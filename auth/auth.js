const bcrypt = require('bcrypt');
const { pool } = require('../database/db');

// Fonction pour hasher un mot de passe
async function hashPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

// Fonction pour vérifier un mot de passe
async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

// Fonction pour créer un utilisateur
async function createUser(username, email, password) {
  try {
    const passwordHash = await hashPassword(password);
    const result = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, created_at',
      [username, email, passwordHash]
    );
    return { success: true, user: result.rows[0] };
  } catch (error) {
    if (error.code === '23505') { // Code d'erreur PostgreSQL pour violation de contrainte unique
      return { success: false, error: 'Nom d\'utilisateur ou email déjà utilisé' };
    }
    return { success: false, error: 'Erreur lors de la création de l\'utilisateur' };
  }
}

// Fonction pour authentifier un utilisateur
async function authenticateUser(username, password) {
  try {
    const result = await pool.query(
      'SELECT id, username, email, password_hash, is_active FROM users WHERE username = $1 OR email = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return { success: false, error: 'Utilisateur non trouvé' };
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return { success: false, error: 'Compte désactivé' };
    }

    const isValid = await verifyPassword(password, user.password_hash);
    
    if (!isValid) {
      return { success: false, error: 'Mot de passe incorrect' };
    }

    // Retourner l'utilisateur sans le hash du mot de passe
    const { password_hash, ...userWithoutPassword } = user;
    return { success: true, user: userWithoutPassword };
  } catch (error) {
    console.error('Erreur d\'authentification:', error);
    return { success: false, error: 'Erreur interne' };
  }
}

// Fonction pour obtenir un utilisateur par ID
async function getUserById(id) {
  try {
    const result = await pool.query(
      'SELECT id, username, email, created_at, is_active FROM users WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    return null;
  }
}

// Middleware pour vérifier l'authentification
function requireAuth(req, res, next) {
  if (req.session && req.session.userId) {
    next();
  } else {
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      // Requête AJAX
      res.status(401).json({ error: 'Authentification requise' });
    } else {
      // Requête normale, rediriger vers la page de connexion
      res.redirect('/login');
    }
  }
}

// Middleware pour rediriger les utilisateurs déjà connectés
function requireGuest(req, res, next) {
  if (req.session && req.session.userId) {
    res.redirect('/editor');
  } else {
    next();
  }
}

module.exports = {
  hashPassword,
  verifyPassword,
  createUser,
  authenticateUser,
  getUserById,
  requireAuth,
  requireGuest
};