const { pool } = require('./db');
const fs = require('fs').promises;
const path = require('path');
const chalk = require('chalk');

async function migrateCoverEndSeparator() {
    const client = await pool.connect();
    
    try {
        console.log(chalk.cyan('🔄 Ajout du champ cover_end_separator_color...'));
        
        // Lire le fichier SQL de migration
        const migrationSQL = await fs.readFile(
            path.join(__dirname, 'migrate-add-cover-end-separator.sql'), 
            'utf8'
        );
        
        // Exécuter la migration
        await client.query(migrationSQL);
        
        console.log(chalk.green('✅ Migration cover_end_separator_color terminée avec succès !'));
        
        // Vérifier les données après migration
        const result = await client.query(`
            SELECT 
                book_id,
                separator_color,
                cover_end_separator_color
            FROM themes 
            ORDER BY book_id
            LIMIT 10
        `);
        
        console.log(chalk.yellow('📊 Données après migration :'));
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
    migrateCoverEndSeparator()
        .then(() => {
            console.log(chalk.green('🎉 Migration terminée !'));
            process.exit(0);
        })
        .catch((error) => {
            console.error(chalk.red('💥 Échec de la migration :'), error);
            process.exit(1);
        });
}

module.exports = { migrateCoverEndSeparator };