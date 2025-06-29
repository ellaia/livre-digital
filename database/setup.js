const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupDatabase() {
  // Connexion pour créer la base de données
  const adminClient = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    database: 'postgres' // Base de données par défaut
  });

  try {
    await adminClient.connect();
    console.log('🔗 Connexion à PostgreSQL réussie');

    // Vérifier si la base de données existe
    const dbExists = await adminClient.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [process.env.DB_NAME || 'livre_digital']
    );

    if (dbExists.rows.length === 0) {
      console.log('📦 Création de la base de données...');
      await adminClient.query(`CREATE DATABASE ${process.env.DB_NAME || 'livre_digital'}`);
      console.log('✅ Base de données créée');
    } else {
      console.log('✅ Base de données déjà existante');
    }

    await adminClient.end();

    // Connexion à la nouvelle base de données pour créer les tables
    const client = new Client({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'livre_digital'
    });

    await client.connect();
    console.log('🔗 Connexion à la base livre_digital réussie');

    // Créer les tables
    console.log('📋 Création des tables...');
    
    // Table users
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT true
      )
    `);

    // Table sessions
    await client.query(`
      CREATE TABLE IF NOT EXISTS session (
        sid VARCHAR NOT NULL COLLATE "default",
        sess JSON NOT NULL,
        expire TIMESTAMP(6) NOT NULL
      )
    `);

    await client.query(`
      DO $$ BEGIN
        ALTER TABLE session ADD CONSTRAINT session_pkey PRIMARY KEY (sid);
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$;
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS IDX_session_expire ON session (expire)
    `);

    console.log('✅ Tables créées avec succès');

    // Vérifier si l'utilisateur admin existe
    const adminExists = await client.query(
      "SELECT 1 FROM users WHERE username = 'admin'"
    );

    if (adminExists.rows.length === 0) {
      const bcrypt = require('bcrypt');
      const passwordHash = await bcrypt.hash('admin123', 10);
      
      await client.query(
        "INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3)",
        ['admin', 'admin@example.com', passwordHash]
      );
      console.log('👤 Utilisateur admin créé (username: admin, password: admin123)');
    } else {
      console.log('👤 Utilisateur admin déjà existant');
    }

    await client.end();
    console.log('🎉 Configuration de la base de données terminée !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la configuration:', error.message);
    process.exit(1);
  }
}

// Exécuter le setup si le script est appelé directement
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase };