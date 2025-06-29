const { pool } = require('./db');
const fs = require('fs').promises;
const path = require('path');
const chalk = require('chalk');

async function migrateThemes() {
    const client = await pool.connect();
    
    try {
        console.log(chalk.cyan('🔄 Début de la migration des thèmes...'));
        
        // Lire le fichier SQL de migration
        const migrationSQL = await fs.readFile(
            path.join(__dirname, 'migrate-theme-simplify.sql'), 
            'utf8'
        );
        
        // Exécuter la migration
        await client.query(migrationSQL);
        
        console.log(chalk.green('✅ Migration des thèmes terminée avec succès !'));
        
        // Vérifier les données après migration
        const result = await client.query(`
            SELECT 
                book_id,
                cover_end_background_color,
                global_font,
                separator_color
            FROM themes 
            ORDER BY book_id
            LIMIT 10
        `);
        
        console.log(chalk.yellow('📊 Échantillon des données migrées :'));
        console.table(result.rows);
        
        return true;
        
    } catch (error) {
        console.error(chalk.red('❌ Erreur lors de la migration :'), error.message);
        throw error;
    } finally {
        client.release();
    }
}

// Exécuter si appelé directement
if (require.main === module) {
    migrateThemes()
        .then(() => {
            console.log(chalk.green('🎉 Migration terminée !'));
            process.exit(0);
        })
        .catch((error) => {
            console.error(chalk.red('💥 Échec de la migration :'), error);
            process.exit(1);
        });
}

module.exports = { migrateThemes };