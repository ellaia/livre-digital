const { pool } = require('../database/db');

class Book {
  constructor(data) {
    Object.assign(this, data);
  }

  // Récupérer un livre complet avec toutes ses configurations
  static async getById(bookId, userId = null) {
    const client = await pool.connect();
    try {
      // Livre de base
      let bookQuery = 'SELECT * FROM books WHERE id = $1';
      let bookParams = [bookId];
      
      if (userId) {
        bookQuery += ' AND user_id = $2';
        bookParams.push(userId);
      }
      
      const bookResult = await client.query(bookQuery, bookParams);
      if (bookResult.rows.length === 0) {
        return null;
      }
      
      const book = bookResult.rows[0];
      
      // Récupérer toutes les configurations associées
      const [theme, features, layout, contentSettings, pages] = await Promise.all([
        client.query('SELECT * FROM themes WHERE book_id = $1', [bookId]),
        client.query('SELECT * FROM book_features WHERE book_id = $1', [bookId]),
        client.query('SELECT * FROM book_layouts WHERE book_id = $1', [bookId]),
        client.query('SELECT * FROM book_content_settings WHERE book_id = $1', [bookId]),
        client.query('SELECT * FROM pages WHERE book_id = $1 ORDER BY page_order', [bookId])
      ]);

      return {
        ...book,
        theme: theme.rows[0] || {},
        features: features.rows[0] || {},
        layout: layout.rows[0] || {},
        content_settings: contentSettings.rows[0] || {},
        pages: pages.rows || []
      };
    } finally {
      client.release();
    }
  }

  // Récupérer un livre au format compatible avec l'ancien système
  static async getBookConfig(bookId, userId = null) {
    const bookData = await this.getById(bookId, userId);
    if (!bookData) return null;

    // Convertir au format book-config.json
    return {
      book: {
        title: bookData.title,
        subtitle: bookData.subtitle,
        cover_image: bookData.cover_image,
        years: bookData.years,
        institution: bookData.institution,
        description: bookData.description,
        author: bookData.author,
        anniversary: bookData.anniversary,
        language: bookData.language || 'fr',
        direction: (bookData.language === 'ar') ? 'rtl' : 'ltr'
      },
      theme: {
        cover_end_background_color: bookData.theme.cover_end_background_color || '#d8e0e5',
        global_font: bookData.theme.global_font || 'Poppins',
        separator_color: bookData.theme.separator_color || '#638c1c',
        cover_end_separator_color: bookData.theme.cover_end_separator_color || '#ffffff'
      },
      features: {
        video_support: bookData.features.video_support,
        mobile_portrait_default: bookData.features.mobile_portrait_default,
        zoom_controls: bookData.features.zoom_controls,
        progress_indicator: bookData.features.progress_indicator,
        draggable_controls: bookData.features.draggable_controls,
        flip_animation: bookData.features.flip_animation,
        responsive_design: bookData.features.responsive_design
      },
      layout: {
        page_width: bookData.layout.page_width,
        page_height: bookData.layout.page_height,
        min_width: bookData.layout.min_width,
        max_width: bookData.layout.max_width,
        min_height: bookData.layout.min_height,
        max_height: bookData.layout.max_height,
        flip_duration: bookData.layout.flip_duration
      },
      content: {
        show_sommaire: bookData.content_settings.show_sommaire,
        show_cover: bookData.content_settings.show_cover,
        show_end_page: bookData.content_settings.show_end_page,
        auto_generate_sommaire: bookData.content_settings.auto_generate_sommaire
      },
      pack_output: bookData.content_settings.pack_output
    };
  }

  // Récupérer les pages au format Markdown
  static async getPagesMarkdown(bookId, userId = null) {
    const client = await pool.connect();
    try {
      let query = `
        SELECT page_id, page_type, title, content, metadata 
        FROM pages 
        WHERE book_id = $1
      `;
      let params = [bookId];
      
      if (userId) {
        query += ' AND book_id IN (SELECT id FROM books WHERE user_id = $2)';
        params.push(userId);
      }
      
      query += ' ORDER BY page_order';
      
      const result = await client.query(query, params);
      
      return result.rows.map(page => {
        let pageContent = `# Page: ${page.page_id}\n`;
        pageContent += `type: ${page.page_type}\n`;
        pageContent += `title: ${page.title}\n`;
        
        // Ajouter les métadonnées
        if (page.metadata && typeof page.metadata === 'object') {
          for (const [key, value] of Object.entries(page.metadata)) {
            if (value) {
              pageContent += `${key}: ${value}\n`;
            }
          }
        }
        
        pageContent += '\n' + (page.content || '');
        return pageContent;
      }).join('\n---\n');
      
    } finally {
      client.release();
    }
  }

  // Sauvegarder les pages depuis du Markdown
  static async savePagesFromMarkdown(bookId, markdownContent, userId = null) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Vérifier les permissions
      if (userId) {
        const bookCheck = await client.query(
          'SELECT id FROM books WHERE id = $1 AND user_id = $2',
          [bookId, userId]
        );
        if (bookCheck.rows.length === 0) {
          throw new Error('Livre non trouvé ou accès non autorisé');
        }
      }
      
      // Parser le contenu Markdown
      const sections = markdownContent.split('\n---\n');
      
      // Supprimer les anciennes pages
      await client.query('DELETE FROM pages WHERE book_id = $1', [bookId]);
      
      // Insérer les nouvelles pages
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i].trim();
        if (!section) continue;
        
        const pageData = this.parsePage(section);
        if (pageData.id && pageData.type && pageData.title) {
          await client.query(`
            INSERT INTO pages (
              book_id, page_id, page_type, title, content, page_order, metadata
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
          `, [
            bookId,
            pageData.id,
            pageData.type,
            pageData.title,
            pageData.body,
            i + 1,
            JSON.stringify(pageData.metadata || {})
          ]);
        }
      }
      
      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Parser une page Markdown
  static parsePage(text) {
    const lines = text.split('\n');
    let id = '', type = '', title = '';
    let metadata = {};
    let bodyStartIndex = 0;

    const metaRegex = /^[a-zA-Z_][\w-]*:/;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.startsWith('# Page:')) {
        id = line.replace('# Page:', '').trim();
        bodyStartIndex = i + 1;
      } else if (line.startsWith('type:')) {
        type = line.replace('type:', '').trim();
        bodyStartIndex = i + 1;
      } else if (line.startsWith('title:')) {
        title = line.replace('title:', '').trim();
        bodyStartIndex = i + 1;
      } else if (metaRegex.test(line)) {
        const [key, ...valueParts] = line.split(':');
        const value = valueParts.join(':').trim();
        if (key && value) {
          const k = key.trim();
          if (k === 'type') {
            type = value;
          } else if (k === 'title') {
            title = value;
          } else {
            metadata[k] = value;
          }
        }
        bodyStartIndex = i + 1;
      } else if (line === '') {
        bodyStartIndex = i + 1;
      } else {
        bodyStartIndex = i;
        break;
      }
    }

    const body = lines.slice(bodyStartIndex).join('\n').trim();
    
    return { id, type, title, body, metadata };
  }

  // Lister tous les livres d'un utilisateur + livres de référence
  static async getByUserId(userId) {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT id, title, subtitle, slug, is_published, is_reference, user_id, created_at, updated_at
        FROM books 
        WHERE user_id = $1 OR is_reference = TRUE
        ORDER BY is_reference DESC, updated_at DESC
      `, [userId]);
      
      return result.rows;
    } finally {
      client.release();
    }
  }

  // Créer un nouveau livre
  static async create(bookData, userId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Créer le livre
      const bookResult = await client.query(`
        INSERT INTO books (user_id, title, subtitle, slug)
        VALUES ($1, $2, $3, $4)
        RETURNING id
      `, [userId, bookData.title, bookData.subtitle || '', bookData.slug]);
      
      const bookId = bookResult.rows[0].id;
      
      // Créer les configurations par défaut
      await Promise.all([
        client.query(`
          INSERT INTO themes (book_id) VALUES ($1)
        `, [bookId]),
        client.query(`
          INSERT INTO book_features (book_id) VALUES ($1)
        `, [bookId]),
        client.query(`
          INSERT INTO book_layouts (book_id) VALUES ($1)
        `, [bookId]),
        client.query(`
          INSERT INTO book_content_settings (book_id) VALUES ($1)
        `, [bookId])
      ]);
      
      // Créer les pages par défaut (COVER et END)
      await client.query(`
        INSERT INTO pages (book_id, page_id, page_type, title, content, page_order)
        VALUES 
          ($1, 'cover', 'cover', $2, '# $2\n\nContenu de votre couverture...', 1),
          ($1, 'end', 'end', 'FIN', '# FIN\n\nContenu de votre page de fin...', 2)
      `, [bookId, bookData.title]);
      
      await client.query('COMMIT');
      console.log(`📚 Livre "${bookData.title}" créé avec ID ${bookId} (pages par défaut incluses)`);
      return bookId;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Dupliquer n'importe quel livre pour un utilisateur
  static async duplicateBook(sourceBookId, userId, newTitle = null, requireReference = false) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Vérifier que le livre source existe
      let query = 'SELECT * FROM books WHERE id = $1';
      if (requireReference) {
        query += ' AND is_reference = TRUE';
      }
      
      const sourceBookResult = await client.query(query, [sourceBookId]);

      if (sourceBookResult.rows.length === 0) {
        throw new Error(requireReference ? 'Livre de référence non trouvé' : 'Livre source non trouvé');
      }

      const sourceBook = sourceBookResult.rows[0];
      const duplicateTitle = newTitle || `${sourceBook.title} (Copie)`;

      // Créer le nouveau livre
      const newBookResult = await client.query(`
        INSERT INTO books (title, subtitle, slug, institution, years, user_id, is_published, is_reference, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, FALSE, NOW(), NOW())
        RETURNING id
      `, [
        duplicateTitle,
        sourceBook.subtitle,
        sourceBook.slug + '-copy-' + Date.now(),
        sourceBook.institution,
        sourceBook.years,
        userId,
        false
      ]);

      const newBookId = newBookResult.rows[0].id;

      // Copier toutes les pages
      const pagesResult = await client.query(
        'SELECT * FROM pages WHERE book_id = $1 ORDER BY page_order',
        [sourceBookId]
      );

      for (const page of pagesResult.rows) {
        await client.query(`
          INSERT INTO pages (book_id, page_id, page_type, title, content, page_order, is_visible, metadata, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
        `, [
          newBookId,
          page.page_id,
          page.page_type,
          page.title,
          page.content,
          page.page_order,
          page.is_visible,
          page.metadata
        ]);
      }

      // Copier le thème si il existe
      const themeResult = await client.query(
        'SELECT * FROM themes WHERE book_id = $1',
        [sourceBookId]
      );

      if (themeResult.rows.length > 0) {
        const theme = themeResult.rows[0];
        await client.query(`
          INSERT INTO themes (book_id, cover_end_background_color, global_font, separator_color, cover_end_separator_color)
          VALUES ($1, $2, $3, $4, $5)
        `, [
          newBookId,
          theme.cover_end_background_color || '#d8e0e5',
          theme.global_font || 'Poppins',
          theme.separator_color || '#638c1c',
          theme.cover_end_separator_color || '#ffffff'
        ]);
      }

      await client.query('COMMIT');
      return newBookId;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Dupliquer un livre de référence pour un utilisateur (méthode de compatibilité)
  static async duplicateFromReference(referenceBookId, userId, newTitle = null) {
    return this.duplicateBook(referenceBookId, userId, newTitle, true);
  }
}

module.exports = Book;