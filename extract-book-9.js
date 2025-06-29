#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
require('dotenv').config();

// Import du modèle Book depuis le répertoire original
const originalBookPath = path.join(__dirname, '..', 'book-generator', 'models', 'Book.js');
const Book = require(originalBookPath);

async function extractBook9Data() {
    try {
        console.log('🔍 Extraction des données du livre n°9...');
        
        // Récupérer les données du livre 9
        const bookConfig = await Book.getBookConfig(9);
        const bookData = await Book.getById(9);
        const pagesMarkdown = await Book.getPagesMarkdown(9);
        const mediaList = await Book.getMediaByBookId(9);
        
        console.log('📖 Livre trouvé:', bookData.title);
        console.log('📄 Pages récupérées');
        console.log('🎬 Médias trouvés:', mediaList.length);
        
        // Sauvegarder les données extraites
        const extractedData = {
            book: bookData,
            config: bookConfig,
            pages: pagesMarkdown,
            media: mediaList,
            extractedAt: new Date().toISOString()
        };
        
        await fs.writeJSON('./book-9-reference.json', extractedData, { spaces: 2 });
        console.log('✅ Données sauvegardées dans book-9-reference.json');
        
        // Afficher un résumé
        console.log('\n📊 RÉSUMÉ DU LIVRE DE RÉFÉRENCE:');
        console.log(`- Titre: ${bookData.title}`);
        console.log(`- Sous-titre: ${bookData.subtitle}`);
        console.log(`- Langue: ${bookData.language}`);
        console.log(`- Slug: ${bookData.slug}`);
        console.log(`- Nombre de médias: ${mediaList.length}`);
        
        return extractedData;
        
    } catch (error) {
        console.error('❌ Erreur lors de l\'extraction:', error.message);
        throw error;
    }
}

if (require.main === module) {
    extractBook9Data().catch(console.error);
}

module.exports = extractBook9Data;