const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const multer = require('multer');
const { spawn } = require('child_process');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
require('dotenv').config();

// Import des modules d'authentification
const { pool, testConnection } = require('./database/db');
const { authenticateUser, createUser, getUserById, requireAuth, requireGuest } = require('./auth/auth');
const Book = require('./models/Book');

const app = express();
const PORT = process.env.PORT || 3000;

const contentDir = path.join(__dirname, 'config', 'content');
const pagesPath = path.join(contentDir, 'pages.md');
const outputDir = path.join(__dirname, 'output');

// ID du livre par défaut (pour la rétrocompatibilité)
const DEFAULT_BOOK_ID = 1;

// Configuration des sessions
app.use(session({
  store: new pgSession({
    pool: pool,
    tableName: 'session'
  }),
  secret: process.env.SESSION_SECRET || 'votre-cle-secrete-changez-moi',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true if using HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Route pour servir les médias par livre
app.get('/media/:bookSlug/:filename', requireAuth, async (req, res) => {
  try {
    const { bookSlug, filename } = req.params;
    const userId = req.session.userId;
    
    // Vérifier que l'utilisateur a accès à ce livre
    const books = await Book.getByUserId(userId);
    const book = books.find(b => b.slug === bookSlug);
    
    if (!book) {
      return res.status(404).send('Livre non trouvé');
    }
    
    const mediaPath = path.join(outputDir, bookSlug, 'media', filename);
    
    // Vérifier que le fichier existe
    if (await fs.pathExists(mediaPath)) {
      res.sendFile(mediaPath);
    } else {
      res.status(404).send('Média non trouvé');
    }
  } catch (error) {
    console.error('Erreur lors du service du média:', error);
    res.status(500).send('Erreur serveur');
  }
});

// Route alternative pour servir les médias via l'ID du livre
app.get('/books/:id/media/:filename', requireAuth, async (req, res) => {
  try {
    const bookId = parseInt(req.params.id, 10);
    const filename = req.params.filename;
    const userId = req.session.userId;

    if (isNaN(bookId)) {
      return res.status(400).send('ID de livre invalide');
    }

    const book = await Book.getById(bookId, userId);
    if (!book) {
      return res.status(404).send('Livre non trouvé');
    }

    const mediaPath = path.join(outputDir, book.slug, 'media', filename);
    if (await fs.pathExists(mediaPath)) {
      res.sendFile(mediaPath);
    } else {
      res.status(404).send('Média non trouvé');
    }
  } catch (error) {
    console.error('Erreur lors du service du média:', error);
    res.status(500).send('Erreur serveur');
  }
});

app.use(express.urlencoded({ extended: true }));
app.use(express.text({ type: 'text/plain' }));
app.use(express.json());
// Servir les fichiers Quill localement
app.use('/quill', express.static(path.join(__dirname, 'public', 'quill')));

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const bookId = req.query.book || DEFAULT_BOOK_ID;
      const userId = req.session.userId;
      
      // Récupérer les infos du livre pour obtenir le slug
      const book = await Book.getById(bookId, userId);
      if (!book) {
        return cb(new Error('Livre non trouvé'));
      }
      
      // Créer le chemin du dossier média pour ce livre
      const bookMediaDir = path.join(outputDir, book.slug, 'media');
      
      // Créer le dossier s'il n'existe pas
      await fs.ensureDir(bookMediaDir);
      
      cb(null, bookMediaDir);
    } catch (error) {
      console.error('Erreur lors de la création du dossier média:', error);
      cb(error);
    }
  },
  filename: async (req, file, cb) => {
    try {
      const bookId = req.query.book || DEFAULT_BOOK_ID;
      const userId = req.session.userId;
      
      // Récupérer les infos du livre pour obtenir le slug
      const book = await Book.getById(bookId, userId);
      if (!book) {
        return cb(new Error('Livre non trouvé'));
      }
      
      // Extraire l'extension du fichier original (garder l'extension originale)
      let ext = path.extname(file.originalname).toLowerCase();
      
      // Créer le dossier media du livre
      const bookMediaDir = path.join(outputDir, book.slug, 'media');
      await fs.ensureDir(bookMediaDir);
      
      // SOLUTION THREAD-SAFE: Insérer directement en base et obtenir l'ID unique
      const client = await pool.connect();
      try {
        // Insérer un placeholder temporaire pour réserver l'ID et obtenir un filename unique
        const tempFilename = `temp_${Date.now()}_${Math.random().toString(36).substring(7)}${ext}`;
        const insertResult = await client.query(`
          INSERT INTO media (book_id, filename, original_name, mime_type, file_size, file_path, media_type)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING id
        `, [
          bookId,
          tempFilename,
          file.originalname,
          file.mimetype || 'application/octet-stream',
          0, // file.size sera mis à jour après upload
          '', // file_path sera mis à jour après upload
          file.mimetype?.startsWith('image/') ? 'image' : 'file'
        ]);
        
        const mediaId = insertResult.rows[0].id;
        const finalName = `${mediaId}${ext}`;
        
        // Mettre à jour avec le vrai nom de fichier
        await client.query(`
          UPDATE media SET filename = $1 WHERE id = $2
        `, [finalName, mediaId]);
        
        // Stocker l'ID du média pour l'utiliser dans la route POST
        if (!req.mediaIds) req.mediaIds = new Map();
        req.mediaIds.set(finalName, mediaId);
        
        console.log(`📁 Nouveau média uploadé pour "${book.slug}": ${file.originalname} → ${finalName} (ID: ${mediaId})`);
        cb(null, finalName);
      } catch (error) {
        console.error('Erreur lors de l\'insertion en base:', error);
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Erreur lors de la génération du nom de fichier:', error);
      // Fallback vers un nom unique avec timestamp
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(7);
      let ext = path.extname(file.originalname).toLowerCase();
      let safeName = `fallback_${timestamp}_${random}${ext}`;
      cb(null, safeName);
    }
  }
});
const upload = multer({ storage });

// Route pour lister les livres de l'utilisateur
app.get('/books', requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const books = await Book.getByUserId(userId);
    res.json(books);
  } catch (error) {
    console.error('Erreur lors de la récupération des livres:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des livres' });
  }
});

// Route pour récupérer les infos de l'utilisateur connecté
app.get('/api/user', requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const username = req.session.username;
    const isAdmin = username === 'admin'; // Simple check, peut être amélioré
    
    res.json({
      id: userId,
      username: username,
      isAdmin: isAdmin
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des infos utilisateur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route pour dupliquer n'importe quel livre
app.post('/books/:id/duplicate', requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const sourceBookId = req.params.id;
    const { title } = req.body;
    
    const newBookId = await Book.duplicateBook(sourceBookId, userId, title, false);
    res.json({ id: newBookId, message: 'Livre dupliqué avec succès' });
  } catch (error) {
    console.error('Erreur lors de la duplication:', error);
    res.status(500).json({ error: error.message || 'Erreur lors de la duplication' });
  }
});

// Route pour créer un nouveau livre
app.post('/books', requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const { title, subtitle, slug } = req.body;
    
    if (!title || !slug) {
      return res.status(400).json({ error: 'Titre et slug requis' });
    }
    
    const bookId = await Book.create({ title, subtitle, slug }, userId);
    res.json({ id: bookId, message: 'Livre créé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la création du livre:', error);
    res.status(500).json({ error: 'Erreur lors de la création du livre' });
  }
});

// Routes d'authentification
app.get('/login', requireGuest, async (req, res) => {
  try {
    const loginPath = path.join(__dirname, 'views', 'login.html');
    const html = await fs.readFile(loginPath, 'utf8');
    res.type('text/html').send(html);
  } catch (err) {
    console.error('Erreur lors du chargement de la page de connexion:', err);
    res.status(500).send('Erreur lors du chargement de la page de connexion');
  }
});

app.post('/login', requireGuest, async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ success: false, error: 'Nom d\'utilisateur et mot de passe requis' });
  }

  const result = await authenticateUser(username, password);
  
  if (result.success) {
    req.session.userId = result.user.id;
    req.session.username = result.user.username;
    res.json({ success: true, message: 'Connexion réussie' });
  } else {
    res.status(401).json({ success: false, error: result.error });
  }
});

app.get('/register', requireGuest, async (req, res) => {
  try {
    const registerPath = path.join(__dirname, 'views', 'register.html');
    const html = await fs.readFile(registerPath, 'utf8');
    res.type('text/html').send(html);
  } catch (err) {
    console.error('Erreur lors du chargement de la page d\'inscription:', err);
    res.status(500).send('Erreur lors du chargement de la page d\'inscription');
  }
});

app.post('/register', requireGuest, async (req, res) => {
  const { username, email, password } = req.body;
  
  if (!username || !email || !password) {
    return res.status(400).json({ success: false, error: 'Tous les champs sont requis' });
  }

  if (password.length < 6) {
    return res.status(400).json({ success: false, error: 'Le mot de passe doit contenir au moins 6 caractères' });
  }

  const result = await createUser(username, email, password);
  
  if (result.success) {
    res.json({ success: true, message: 'Compte créé avec succès' });
  } else {
    res.status(400).json({ success: false, error: result.error });
  }
});

app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ success: false, error: 'Erreur lors de la déconnexion' });
    }
    res.clearCookie('connect.sid');
    res.json({ success: true, message: 'Déconnexion réussie' });
  });
});

// Route pour la page de gestion des livres
app.get('/books-manager', requireAuth, async (req, res) => {
  try {
    const booksPath = path.join(__dirname, 'views', 'books.html');
    const html = await fs.readFile(booksPath, 'utf8');
    res.type('text/html').send(html);
  } catch (err) {
    console.error('Erreur lors du chargement de la page de gestion:', err);
    res.status(500).send('Erreur lors du chargement de la page de gestion');
  }
});

// Routes pour gérer les informations du livre
app.get('/books/:id/info', requireAuth, async (req, res) => {
  try {
    const bookId = parseInt(req.params.id, 10);
    const userId = req.session.userId;
    
    if (isNaN(bookId)) {
      return res.status(400).json({ error: 'ID de livre invalide' });
    }
    
    const book = await Book.getById(bookId, userId);
    if (!book) {
      return res.status(404).json({ error: 'Livre non trouvé' });
    }
    
    res.json({
      title: book.title,
      subtitle: book.subtitle,
      cover_image: book.cover_image,
      years: book.years,
      institution: book.institution,
      description: book.description,
      author: book.author,
      anniversary: book.anniversary,
      language: book.language || 'fr'
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des informations:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des informations' });
  }
});

app.put('/books/:id/info', requireAuth, async (req, res) => {
  try {
    const bookId = parseInt(req.params.id, 10);
    const userId = req.session.userId;
    
    if (isNaN(bookId)) {
      return res.status(400).json({ error: 'ID de livre invalide' });
    }
    
    // Vérifier que le livre appartient à l'utilisateur
    const book = await Book.getById(bookId, userId);
    if (!book) {
      return res.status(404).json({ error: 'Livre non trouvé' });
    }
    
    const {
      title,
      subtitle,
      cover_image,
      years,
      institution,
      description,
      author,
      anniversary,
      language
    } = req.body;
    
    // Mettre à jour les informations du livre
    const client = await pool.connect();
    try {
      await client.query(`
        UPDATE books SET
          title = $2,
          subtitle = $3,
          cover_image = $4,
          years = $5,
          institution = $6,
          description = $7,
          author = $8,
          anniversary = $9,
          language = $10,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `, [
        bookId,
        title || book.title,
        subtitle || book.subtitle,
        cover_image || book.cover_image,
        years || book.years,
        institution || book.institution,
        description || book.description,
        author || book.author,
        anniversary || book.anniversary,
        language || book.language || 'fr'
      ]);
      
      res.json({ message: 'Informations mises à jour avec succès' });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour des informations:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour des informations' });
  }
});

// Routes pour gérer les thèmes
app.get('/books/:id/theme', requireAuth, async (req, res) => {
  try {
    const bookId = parseInt(req.params.id, 10);
    const userId = req.session.userId;
    
    if (isNaN(bookId)) {
      return res.status(400).json({ error: 'ID de livre invalide' });
    }
    
    const book = await Book.getById(bookId, userId);
    if (!book) {
      return res.status(404).json({ error: 'Livre non trouvé' });
    }
    
    res.json(book.theme);
  } catch (error) {
    console.error('Erreur lors de la récupération du thème:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du thème' });
  }
});

app.put('/books/:id/theme', requireAuth, async (req, res) => {
  try {
    const bookId = parseInt(req.params.id, 10);
    const userId = req.session.userId;
    
    if (isNaN(bookId)) {
      return res.status(400).json({ error: 'ID de livre invalide' });
    }
    
    // Vérifier que le livre appartient à l'utilisateur
    const book = await Book.getById(bookId, userId);
    if (!book) {
      return res.status(404).json({ error: 'Livre non trouvé' });
    }
    
    const {
      cover_end_background_color,
      global_font,
      separator_color,
      cover_end_separator_color
    } = req.body;
    
    // Mettre à jour le thème avec les nouveaux champs simplifiés
    const client = await pool.connect();
    try {
      await client.query(`
        UPDATE themes SET
          cover_end_background_color = $2,
          global_font = $3,
          separator_color = $4,
          cover_end_separator_color = $5,
          updated_at = CURRENT_TIMESTAMP
        WHERE book_id = $1
      `, [
        bookId,
        cover_end_background_color || '#d8e0e5',
        global_font || 'Poppins',
        separator_color || '#638c1c',
        cover_end_separator_color || '#ffffff'
      ]);
      
      res.json({ message: 'Thème mis à jour avec succès' });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour du thème:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du thème' });
  }
});

// Route pour supprimer un livre
app.delete('/books/:id', requireAuth, async (req, res) => {
  try {
    const bookId = parseInt(req.params.id, 10);
    const userId = req.session.userId;
    
    if (isNaN(bookId)) {
      return res.status(400).json({ error: 'ID de livre invalide' });
    }
    
    // Vérifier que le livre appartient à l'utilisateur
    const book = await Book.getById(bookId, userId);
    if (!book) {
      return res.status(404).json({ error: 'Livre non trouvé' });
    }
    
    // Supprimer le livre (CASCADE supprimera automatiquement les données liées)
    const client = await pool.connect();
    try {
      await client.query('DELETE FROM books WHERE id = $1 AND user_id = $2', [bookId, userId]);
      res.json({ message: 'Livre supprimé avec succès' });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erreur lors de la suppression du livre:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du livre' });
  }
});

// Route racine - redirection vers la gestion des livres ou la connexion
app.get('/', (req, res) => {
  if (req.session && req.session.userId) {
    res.redirect('/books-manager');
  } else {
    res.redirect('/login');
  }
});

// Protection de l'éditeur
app.get('/editor', requireAuth, async (req, res) => {
  const bookId = req.query.book || DEFAULT_BOOK_ID;
  const userId = req.session.userId;
  
  if (req.query.raw) {
    try {
      const pagesMarkdown = await Book.getPagesMarkdown(bookId, userId);
      return res.type('text/plain').send(pagesMarkdown);
    } catch (error) {
      console.error('Erreur lors de la récupération des pages:', error);
      return res.status(500).send('Erreur lors de la récupération des pages');
    }
  }

  const htmlPath = path.join(__dirname, 'editor-enhanced.html');

  try {
    let html = await fs.readFile(htmlPath, 'utf8');
    
    const client = await pool.connect();
    const pagesRes = await client.query(
      'SELECT page_id, page_type, title, content FROM pages WHERE book_id = $1 ORDER BY page_order',
      [bookId]
    );
    client.release();

    const first = pagesRes.rows[0] || { page_id: '', page_type: '', title: '', content: '' };

    html = html.replace('__FIRST_PAGE__', JSON.stringify({
      id: first.page_id,
      type: first.page_type,
      title: first.title,
      content: first.content || ''
    }));
    html = html.replace('__TOTAL_PAGES__', String(pagesRes.rows.length));

    res.type('text/html').send(html);
  } catch (err) {
    console.error('Erreur lors du chargement de l\'éditeur:', err);
    res.status(500).send('Erreur lors du chargement de l\'éditeur');
  }
});

// Route pour lister les médias disponibles pour un livre spécifique
app.get('/media', requireAuth, async (req, res) => {
  const bookId = req.query.book || DEFAULT_BOOK_ID;
  const userId = req.session.userId;
  
  try {
    // Vérifier que le livre appartient à l'utilisateur
    const book = await Book.getById(bookId, userId);
    if (!book) {
      return res.status(404).json({ error: 'Livre non trouvé' });
    }
    
    // Récupérer les médias depuis la base de données
    const client = await pool.connect();
    let mediaFiles = [];
    try {
      const result = await client.query(`
        SELECT filename, original_name, mime_type, file_size, media_type, created_at
        FROM media 
        WHERE book_id = $1 
        ORDER BY CAST(SUBSTRING(filename FROM '^([0-9]+)') AS INTEGER)
      `, [bookId]);
      
      mediaFiles = result.rows.map(media => ({
        filename: media.filename,
        originalName: media.original_name,
        number: parseInt(media.filename.match(/^(\d+)/)?.[1] || '0'),
        extension: path.extname(media.filename).toLowerCase(),
        type: media.media_type,
        url: `/media/${book.slug}/${media.filename}`,
        size: media.file_size,
        uploadDate: media.created_at
      }));
    } finally {
      client.release();
    }
    
    res.json(mediaFiles);
  } catch (error) {
    console.error('Erreur lors de la lecture des médias:', error);
    res.status(500).json({ error: 'Erreur lors de la lecture des médias' });
  }
});

// Route pour supprimer un média d'un livre spécifique
app.delete('/media/:filename', requireAuth, async (req, res) => {
  const bookId = req.query.book || DEFAULT_BOOK_ID;
  const userId = req.session.userId;
  const filename = req.params.filename;
  
  try {
    // Vérifier que le livre appartient à l'utilisateur
    const book = await Book.getById(bookId, userId);
    if (!book) {
      return res.status(404).json({ error: 'Livre non trouvé' });
    }
    
    // Supprimer de la base de données ET du disque
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Vérifier que le média existe en base
      const checkResult = await client.query(
        'SELECT id FROM media WHERE book_id = $1 AND filename = $2',
        [bookId, filename]
      );
      
      if (checkResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Média non trouvé en base de données' });
      }
      
      // Supprimer de la base de données
      await client.query(
        'DELETE FROM media WHERE book_id = $1 AND filename = $2',
        [bookId, filename]
      );
      
      // Supprimer le fichier physique
      const mediaPath = path.join(outputDir, book.slug, 'media', filename);
      if (await fs.pathExists(mediaPath)) {
        await fs.remove(mediaPath);
      }
      
      await client.query('COMMIT');
      console.log(`🗑️ Média supprimé (base + disque) pour "${book.slug}": ${filename}`);
      res.json({ success: true, message: `${filename} supprimé avec succès` });
      
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Erreur lors de la suppression:', error);
      res.status(500).json({ error: 'Erreur lors de la suppression du média' });
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('Erreur lors de la suppression du média:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du média' });
  }
});

app.post('/editor', requireAuth, upload.array('media'), async (req, res) => {
  const bookId = req.query.book || DEFAULT_BOOK_ID;
  const userId = req.session.userId;
  
  console.log(`🔄 POST /editor appelé - BookId: ${bookId}, UserId: ${userId}, Files: ${req.files ? req.files.length : 0}`);
  
  try {
    // Si des fichiers ont été uploadés, mettre à jour leurs métadonnées finales
    if (req.files && req.files.length > 0) {
      console.log(`📤 Upload de ${req.files.length} fichier(s) pour le livre ${bookId} par l'utilisateur ${userId}`);
      
      // Mettre à jour les métadonnées finales en base de données 
      // (l'insertion initiale a déjà été faite dans la fonction filename)
      const client = await pool.connect();
      try {
        console.log('🔗 Connexion à la base établie pour mise à jour des métadonnées');
        await client.query('BEGIN');
        
        for (const file of req.files) {
          const mediaType = file.mimetype.startsWith('video/') ? 'video' : 'image';
          const filePath = `media/${file.filename}`;
          
          console.log(`🔄 Mise à jour métadonnées: ${file.originalname} → ${file.filename} (${mediaType}, ${file.size} octets)`);
          
          // Récupérer l'ID du média depuis la map stockée
          const mediaId = req.mediaIds ? req.mediaIds.get(file.filename) : null;
          
          if (mediaId) {
            // Mettre à jour l'enregistrement existant avec les vraies métadonnées
            await client.query(`
              UPDATE media 
              SET file_size = $1, file_path = $2, media_type = $3, updated_at = CURRENT_TIMESTAMP
              WHERE id = $4
            `, [
              file.size,
              filePath,
              mediaType,
              mediaId
            ]);
            
            console.log(`✅ ${file.filename} (ID: ${mediaId}) mis à jour avec succès`);
          } else {
            console.warn(`⚠️ ID du média non trouvé pour ${file.filename}, création manuelle`);
            // Fallback: créer l'enregistrement manuellement (ne devrait pas arriver normalement)
            await client.query(`
              INSERT INTO media (book_id, filename, original_name, mime_type, file_size, file_path, media_type)
              VALUES ($1, $2, $3, $4, $5, $6, $7)
              ON CONFLICT (book_id, filename) DO UPDATE SET
                file_size = EXCLUDED.file_size,
                file_path = EXCLUDED.file_path,
                media_type = EXCLUDED.media_type,
                updated_at = CURRENT_TIMESTAMP
            `, [
              bookId,
              file.filename,
              file.originalname,
              file.mimetype,
              file.size,
              filePath,
              mediaType
            ]);
          }
        }
        
        await client.query('COMMIT');
        console.log('🎉 Métadonnées mises à jour avec succès');
      } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Erreur lors de la mise à jour des métadonnées:', error);
        console.error('Stack trace:', error.stack);
        
        // Retourner une erreur car les métadonnées sont critiques
        return res.status(500).json({ 
          error: 'Erreur lors de la mise à jour des métadonnées en base de données',
          details: error.message,
          uploadedFiles: req.files.map(f => f.filename)
        });
      } finally {
        client.release();
      }
      
      const uploadedFiles = req.files.map(file => ({
        originalName: file.originalname,
        savedAs: file.filename,
        size: file.size,
        type: file.mimetype.startsWith('video/') ? 'video' : 'image'
      }));
      
      console.log(`📁 ${req.files.length} fichier(s) uploadé(s):`, uploadedFiles);
      return res.json({ 
        success: true, 
        message: `${req.files.length} fichier(s) uploadé(s) avec succès`,
        files: uploadedFiles 
      });
    }
    
    const pageCount = parseInt(req.body.pageCount, 10) || 0;
    const sections = [];
    for (let i = 0; i < pageCount; i++) {
      sections.push(req.body[`page${i}`] || '');
    }
    
    // Sauvegarder dans la base de données
    const markdownContent = sections.join('\n---\n');
    await Book.savePagesFromMarkdown(bookId, markdownContent, userId);
    
    res.redirect(`/editor?book=${bookId}`);
  } catch (err) {
    console.error('Erreur lors de la sauvegarde:', err);
    res.status(500).send('Erreur lors de la sauvegarde du contenu');
  }
});

// Route pour récupérer les types de pages disponibles (DOIT être avant /pages/:index)
app.get('/pages/types', requireAuth, async (req, res) => {
  const bookId = req.query.book || DEFAULT_BOOK_ID;
  const userId = req.session.userId;
  
  try {
    const client = await pool.connect();
    
    // Vérifier les permissions d'accès au livre
    const bookCheck = await client.query(
      'SELECT id FROM books WHERE id = $1 AND user_id = $2',
      [bookId, userId]
    );
    
    if (bookCheck.rows.length === 0) {
      client.release();
      return res.status(404).json({ error: 'Livre non trouvé' });
    }
    
    // Vérifier si une page SOMMAIRE existe déjà
    const sommaireCheck = await client.query(
      'SELECT page_id FROM pages WHERE book_id = $1 AND page_type = $2',
      [bookId, 'sommaire']
    );
    
    client.release();
    
    res.json({ 
      hasSommaire: sommaireCheck.rows.length > 0,
      availableTypes: sommaireCheck.rows.length > 0 ? ['content'] : ['content', 'sommaire']
    });
    
  } catch (error) {
    console.error('Erreur lors de la vérification des types de pages:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.get('/pages/:index', requireAuth, async (req, res) => {
  const bookId = req.query.book || DEFAULT_BOOK_ID;
  const userId = req.session.userId;
  
  try {
    const idx = parseInt(req.params.index, 10);
    if (isNaN(idx) || idx < 0) {
      return res.status(400).send('Index invalide');
    }
    
    // Nouveau système : récupérer directement depuis la base
    const client = await pool.connect();
    
    try {
      // Vérifier les permissions
      const bookCheck = await client.query(
        'SELECT id FROM books WHERE id = $1 AND user_id = $2',
        [bookId, userId]
      );
      
      if (bookCheck.rows.length === 0) {
        client.release();
        return res.status(404).send('Livre non trouvé');
      }
      
      // Récupérer toutes les pages pour avoir le total
      const allPagesResult = await client.query(`
        SELECT page_id, page_type, title, content, page_order
        FROM pages 
        WHERE book_id = $1 
        ORDER BY page_order
      `, [bookId]);
      
      if (idx >= allPagesResult.rows.length) {
        client.release();
        return res.status(404).send('Index de page invalide');
      }
      
      const pageData = allPagesResult.rows[idx];
      
      client.release();
      res.json({
        id: pageData.page_id,
        type: pageData.page_type,
        title: pageData.title,
        content: pageData.content || '',
        total: allPagesResult.rows.length
      });
      
    } catch (error) {
      client.release();
      throw error;
    }
  } catch (err) {
    console.error('Erreur lors de la lecture:', err);
    res.status(500).send('Erreur lors de la lecture du contenu');
  }
});

app.post('/pages/:index', requireAuth, async (req, res) => {
  const bookId = req.query.book || DEFAULT_BOOK_ID;
  const userId = req.session.userId;
  
  try {
    const idx = parseInt(req.params.index, 10);
    if (isNaN(idx) || idx < 0) {
      return res.status(400).send('Index invalide');
    }
    
    // Nouveau système : mettre à jour directement le contenu en base
    const client = await pool.connect();
    
    try {
      // Vérifier les permissions
      const bookCheck = await client.query(
        'SELECT id FROM books WHERE id = $1 AND user_id = $2',
        [bookId, userId]
      );
      
      if (bookCheck.rows.length === 0) {
        client.release();
        return res.status(404).send('Livre non trouvé');
      }
      
      // Récupérer la page à l'index donné
      const pageResult = await client.query(`
        SELECT page_id FROM pages 
        WHERE book_id = $1 
        ORDER BY page_order 
        LIMIT 1 OFFSET $2
      `, [bookId, idx]);
      
      if (pageResult.rows.length === 0) {
        client.release();
        return res.status(404).send('Page non trouvée à cet index');
      }
      
      const pageId = pageResult.rows[0].page_id;
      
      // Gérer les données reçues (soit JSON avec title/content, soit texte simple)
      let content, title;
      
      if (typeof req.body === 'object' && req.body.content !== undefined) {
        // Nouveau format JSON avec titre et contenu
        content = req.body.content || '';
        title = req.body.title || 'Nouvelle page';
        
        // Mettre à jour le contenu ET le titre
        await client.query(`
          UPDATE pages 
          SET content = $1, title = $2, updated_at = CURRENT_TIMESTAMP
          WHERE book_id = $3 AND page_id = $4
        `, [content, title, bookId, pageId]);
        
        console.log(`💾 Contenu et titre mis à jour pour page ${pageId} (index ${idx})`);
      } else {
        // Ancien format texte simple (rétrocompatibilité)
        content = req.body || '';
        
        await client.query(`
          UPDATE pages 
          SET content = $1, updated_at = CURRENT_TIMESTAMP
          WHERE book_id = $2 AND page_id = $3
        `, [content, bookId, pageId]);
        
        console.log(`💾 Contenu mis à jour pour page ${pageId} (index ${idx})`);
      }
      
      client.release();
      res.json({ success: true });
      
    } catch (error) {
      client.release();
      throw error;
    }
  } catch (err) {
    console.error('Erreur lors de la sauvegarde:', err);
    res.status(500).send('Erreur lors de la sauvegarde du contenu');
  }
});

app.post('/pages/:index/insert', requireAuth, async (req, res) => {
  const bookId = req.query.book || DEFAULT_BOOK_ID;
  const userId = req.session.userId;
  
  try {
    const idx = parseInt(req.params.index, 10);
    if (isNaN(idx) || idx < 0) {
      return res.status(400).send('Index invalide');
    }

    // Récupérer les données de la nouvelle page depuis le JSON
    const { type, title, content } = req.body;
    if (!type || !title) {
      return res.status(400).send('Type et titre requis');
    }

    // Validation spéciale pour SOMMAIRE : ne peut être inséré qu'après COVER
    if (type === 'sommaire' && idx !== 0) {
      return res.status(400).send('La page SOMMAIRE ne peut être insérée qu\'après la page COVER');
    }

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Vérifier les permissions
      const bookCheck = await client.query(
        'SELECT id FROM books WHERE id = $1 AND user_id = $2',
        [bookId, userId]
      );
      if (bookCheck.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).send('Livre non trouvé');
      }
      
      // Générer l'ID automatiquement selon le type
      let pageId;
      if (type === 'content') {
        // Trouver le prochain numéro content-X
        const maxResult = await client.query(`
          SELECT MAX(CAST(SUBSTRING(page_id FROM 'content-([0-9]+)') AS INTEGER)) as max_num
          FROM pages 
          WHERE book_id = $1 AND page_id ~ '^content-[0-9]+$'
        `, [bookId]);
        
        const nextNum = (maxResult.rows[0].max_num || 0) + 1;
        pageId = `content-${nextNum}`;
      } else {
        // Pour les autres types, utiliser le type directement (cover, end, sommaire)
        pageId = type;
      }
      
      // Récupérer toutes les pages existantes
      const existingPages = await client.query(`
        SELECT id, page_id, page_type, title, content, page_order
        FROM pages 
        WHERE book_id = $1 
        ORDER BY page_order
      `, [bookId]);
      
      // Supprimer toutes les pages temporairement
      await client.query('DELETE FROM pages WHERE book_id = $1', [bookId]);
      
      // Recréer toutes les pages avec les bons page_order
      let currentOrder = 1;
      
      for (let i = 0; i < existingPages.rows.length; i++) {
        const page = existingPages.rows[i];
        
        // Insérer la page existante
        await client.query(`
          INSERT INTO pages (book_id, page_id, page_type, title, content, page_order)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [bookId, page.page_id, page.page_type, page.title, page.content, currentOrder]);
        currentOrder++;
        
        // Insérer la nouvelle page après la page à l'index idx
        if (i === idx) {
          await client.query(`
            INSERT INTO pages (book_id, page_id, page_type, title, content, page_order)
            VALUES ($1, $2, $3, $4, $5, $6)
          `, [bookId, pageId, type, title, content || '', currentOrder]);
          currentOrder++;
        }
      }
      
      // Si la nouvelle page doit être insérée à la fin
      if (idx + 1 >= currentOrder) {
        await client.query(`
          INSERT INTO pages (book_id, page_id, page_type, title, content, page_order)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [bookId, pageId, type, title, content || '', currentOrder]);
      }
      
      // Compter le total de pages
      const countResult = await client.query(
        'SELECT COUNT(*) as total FROM pages WHERE book_id = $1',
        [bookId]
      );
      
      await client.query('COMMIT');
      
      console.log(`✅ Nouvelle page créée: ${pageId} (${type}) - "${title}"`);
      res.json({ 
        index: idx + 1, 
        total: parseInt(countResult.rows[0].total),
        pageId: pageId
      });
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    
  } catch (err) {
    console.error('Erreur lors de l\'insertion:', err);
    res.status(500).send('Erreur lors de l\'insertion de la page');
  }
});


// Route pour supprimer une page
app.delete('/pages/:index', requireAuth, async (req, res) => {
  const bookId = req.query.book || DEFAULT_BOOK_ID;
  const userId = req.session.userId;
  
  try {
    const idx = parseInt(req.params.index, 10);
    if (isNaN(idx) || idx < 0) {
      return res.status(400).json({ error: 'Index invalide' });
    }

    // Récupérer les pages actuelles
    const pagesMarkdown = await Book.getPagesMarkdown(bookId, userId);
    let sections = pagesMarkdown ? pagesMarkdown.split('\n---\n') : [];
    
    if (idx >= sections.length) {
      return res.status(400).json({ error: 'Page non trouvée' });
    }

    // Vérifier les restrictions de suppression
    const pageToDelete = sections[idx];
    const pageMeta = Book.parsePage(pageToDelete);
    
    // Ne peut pas supprimer s'il n'y a qu'une page
    if (sections.length <= 1) {
      return res.status(400).json({ error: 'Impossible de supprimer la seule page restante' });
    }
    
    // Ne peut pas supprimer la page cover
    if (pageMeta.type === 'cover') {
      return res.status(400).json({ error: 'Impossible de supprimer la page de couverture' });
    }
    
    // Ne peut pas supprimer la page end
    if (pageMeta.type === 'end') {
      return res.status(400).json({ error: 'Impossible de supprimer la page de fin' });
    }
    
    // Ne peut pas supprimer la première page (généralement cover)
    if (idx === 0) {
      return res.status(400).json({ error: 'Impossible de supprimer la première page' });
    }
    
    // Ne peut pas supprimer la dernière page (généralement end)
    if (idx === sections.length - 1) {
      return res.status(400).json({ error: 'Impossible de supprimer la dernière page' });
    }

    // Supprimer la page
    sections.splice(idx, 1);
    
    // Sauvegarder dans la base de données
    await Book.savePagesFromMarkdown(bookId, sections.join('\n---\n'), userId);
    
    res.json({ 
      success: true, 
      total: sections.length,
      message: 'Page supprimée avec succès'
    });
  } catch (err) {
    console.error('Erreur lors de la suppression:', err);
    res.status(500).json({ error: 'Erreur lors de la suppression de la page' });
  }
});

app.post('/build', requireAuth, (req, res) => {
  const bookId = req.query.book || DEFAULT_BOOK_ID;
  const userId = req.session.userId;
  const useDatabase = req.body.useDatabase !== false; // Par défaut, utiliser la base de données
  const generatorType = req.body.generatorType || 'standard'; // 'standard' ou 'rtl'

  let script;
  if (useDatabase) {
    script = generatorType === 'rtl' ? 'generator-rtl-from-scratch.js' : 'generator-db.js';
  } else {
    script = 'generator.js';
  }
  
  const flags = req.body.flags ? req.body.flags.split(/\\s+/).filter(Boolean) : [];
  
  // Ajouter les paramètres pour la base de données
  if (useDatabase) {
    flags.push(`--book=${bookId}`);
    if (userId) {
      flags.push(`--user=${userId}`);
    }
  }

  console.log(`🔧 Génération ${generatorType === 'rtl' ? 'RTL' : 'standard'} avec ${script} pour le livre ${bookId}`);

  const child = spawn('node', [script, ...flags], { cwd: __dirname });

  child.stdout.on('data', data => process.stdout.write(data));
  child.stderr.on('data', data => process.stderr.write(data));

  child.on('close', code => {
    if (code === 0) {
      const generatorLabel = generatorType === 'rtl' ? 'RTL' : 'standard';
      res.send(`Build ${generatorLabel} ${useDatabase ? '(base de données)' : '(fichiers)'} succeeded`);
    } else {
      res.status(500).send('Build failed');
    }
  });
});

// Route pour prévisualiser le livre généré directement depuis le serveur
app.get('/books/:id/preview', requireAuth, async (req, res) => {
  const bookId = parseInt(req.params.id, 10);
  const userId = req.session.userId;
  const generatorType = req.query.type || 'standard'; // 'standard' ou 'rtl'

  if (isNaN(bookId)) {
    return res.status(400).send('ID de livre invalide');
  }

  try {
    const book = await Book.getById(bookId, userId);

    if (!book) {
      return res.status(404).send('Livre non trouvé');
    }

    let htmlPath;
    if (generatorType === 'rtl') {
      // Pour le générateur RTL, chercher dans le dossier RTL
      htmlPath = path.join(outputDir, `${book.slug}-rtl-scratch`, 'livre-rtl-scratch.html');
    } else {
      // Pour le générateur standard
      htmlPath = path.join(outputDir, book.slug, 'livre.html');
    }

    if (await fs.pathExists(htmlPath)) {
      res.sendFile(htmlPath);
    } else {
      const typeLabel = generatorType === 'rtl' ? 'RTL' : 'standard';
      res.status(404).send(`Livre ${typeLabel} non généré`);
    }
  } catch (error) {
    console.error('Erreur lors de la prévisualisation:', error);
    res.status(500).send('Erreur serveur lors de la prévisualisation');
  }
});

// Initialisation du serveur
async function startServer() {
  try {
    // Test de la connexion à la base de données
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('❌ Impossible de se connecter à PostgreSQL');
      console.log('💡 Assurez-vous que PostgreSQL est démarré et que la configuration dans .env est correcte');
      console.log('💡 Vous pouvez lancer le setup avec: node database/setup.js');
      process.exit(1);
    }

    app.listen(PORT, () => {
      console.log('🚀 Serveur démarré avec succès !');
      console.log(`📖 Éditeur disponible sur: http://localhost:${PORT}`);
      console.log(`🔐 Page de connexion: http://localhost:${PORT}/login`);
      console.log(`📝 Page d'inscription: http://localhost:${PORT}/register`);
      console.log('\n💡 Compte par défaut: admin / admin123');
    });
  } catch (error) {
    console.error('❌ Erreur lors du démarrage du serveur:', error.message);
    process.exit(1);
  }
}

startServer();
