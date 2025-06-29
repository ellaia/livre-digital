const { pool } = require('./database/db');
const fs = require('fs').promises;
const path = require('path');
const chalk = require('chalk');

async function runMigration() {
    const client = await pool.connect();
    
    try {
        console.log(chalk.cyan('🔄 Exécution du script de migration du livre arabe...'));
        
        // Lire le fichier SQL de migration
        const migrationSQL = await fs.readFile(
            path.join(__dirname, 'insert-book-14-corrected.sql'), 
            'utf8'
        );
        
        // Exécuter la migration
        await client.query(migrationSQL);
        
        console.log(chalk.green('✅ Migration du livre arabe terminée avec succès !'));
        
        // Vérifier que le livre a été inséré
        const result = await client.query(`
            SELECT 
                id, title, language, direction
            FROM books 
            WHERE id = 14
        `);
        
        if (result.rows.length > 0) {
            console.log(chalk.yellow('📊 Livre inséré :'));
            console.table(result.rows);
        } else {
            console.log(chalk.red('❌ Le livre n\'a pas été trouvé après insertion'));
        }
        
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
    runMigration()
        .then(() => {
            console.log(chalk.green('🎉 Migration terminée !'));
            process.exit(0);
        })
        .catch((error) => {
            console.error(chalk.red('💥 Échec de la migration :'), error);
            process.exit(1);
        });
}

module.exports = { runMigration };