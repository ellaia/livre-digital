#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const Mustache = require('mustache');
const chalk = require('chalk');
require('dotenv').config();

// Import des modules de base de données
const Book = require('./models/Book');
const { testConnection } = require('./database/db');

class RTLBookGeneratorFromScratch {
    constructor() {
        this.templatePath = path.join(__dirname, 'templates', 'rtl-from-scratch-template.html');
        this.outputBasePath = path.join(__dirname, 'output');
        this.mediaPath = path.join(__dirname, 'config', 'content', 'media');
        this.outputPath = null;
    }

    async generate(bookId = 1, userId = null) {
        try {
            console.log(chalk.blue('🚀 Génération livre avec StPageFlip RTL from scratch...'));
            
            // Vérifier la connexion à la base de données
            const dbConnected = await testConnection();
            if (!dbConnected) {
                throw new Error('Impossible de se connecter à la base de données');
            }

            // Charger la configuration du livre
            console.log(chalk.yellow('📖 Chargement de la configuration du livre...'));
            const config = await Book.getBookConfig(bookId, userId);
            const bookData = await Book.getById(bookId, userId);
            if (!config || !bookData) {
                throw new Error(`Livre avec l'ID ${bookId} non trouvé`);
            }
            
            console.log(chalk.green(`✓ Configuration chargée pour: ${config.book.title}`));
            console.log(chalk.cyan(`📚 Direction: ${config.book.direction || 'ltr'}`));

            // Créer le dossier de sortie
            const bookFolderName = bookData.slug + '-rtl-scratch';
            this.outputPath = path.join(this.outputBasePath, bookFolderName);
            await fs.ensureDir(this.outputPath);
            console.log(chalk.green(`✓ Dossier de sortie: ${bookFolderName}/`));

            // Charger le contenu des pages
            console.log(chalk.yellow('📄 Chargement des pages...'));
            const pagesMarkdown = await Book.getPagesMarkdown(bookId, userId);
            let pages = this.parseMarkdownPages(pagesMarkdown);
            console.log(chalk.green(`✓ ${pages.length} pages chargées`));

            // Charger le template
            console.log(chalk.yellow('🎨 Chargement du template from scratch...'));
            const template = await this.loadTemplate();
            console.log(chalk.green('✓ Template from scratch chargé'));

            // Génération des pages HTML
            console.log(chalk.yellow('⚙️ Génération des pages HTML...'));
            const pagesHtml = this.generatePagesHTML(pages, config);

            // Chargement et application des styles (PROPRES - sans les hacks RTL)
            let styles = this.generateCleanStyles(config.theme);

            // Assemblage final
            console.log(chalk.yellow('⚙️ Application du template from scratch...'));
            const finalHtml = Mustache.render(template, {
                ...config,
                styles: styles,
                body: pagesHtml,
                pages: { length: pages.length }
            });

            // Écrire le fichier HTML
            const outputFile = path.join(this.outputPath, 'livre-rtl-scratch.html');
            await fs.writeFile(outputFile, finalHtml, 'utf8');

            // Copier le StPageFlip original (CDN)
            console.log(chalk.green('✓ Utilisation StPageFlip original + interception JavaScript'));

            // Copier les médias
            await this.copyMedia();

            console.log(chalk.green(`🎉 Livre RTL from scratch généré: ${outputFile}`));
            console.log(chalk.cyan(`✅ Interception d'événements RTL: ${config.book.direction === 'rtl' ? 'ACTIVÉE' : 'DÉSACTIVÉE'}`));

            return outputFile;

        } catch (error) {
            console.error(chalk.red('❌ Erreur génération RTL from scratch:'), error.message);
            throw error;
        }
    }

    generatePagesHTML(pages, config) {
        let pagesHtml = '';

        pages.forEach((page, index) => {
            const pageClass = this.getPageClass(page, index, pages.length);
            const pageType = page.type || 'content';
            
            pagesHtml += `<div class="page ${pageClass}" data-page-type="${pageType}" role="article" aria-label="Page ${index + 1}">\n`;
            pagesHtml += `    <div class="page-content">\n`;
            pagesHtml += `        ${this.generatePageContent(page, config, index)}\n`;
            pagesHtml += `    </div>\n`;
            pagesHtml += `</div>\n\n`;
        });

        return pagesHtml;
    }

    getPageClass(page, index, totalPages) {
        let classes = [];
        
        if (page.type === 'cover' || index === 0) {
            classes.push('page-cover', 'hard');
        }
        
        if (page.type === 'end' || index === totalPages - 1) {
            classes.push('page-cover', 'hard');
        }
        
        return classes.join(' ');
    }

    generatePageContent(page, config, index) {
        let content = page.content;

        // Traitement des médias
        content = this.processMediaPlaceholders(content);
        
        // Traitement des liens internes
        content = this.processInternalLinks(content);

        return content;
    }

    parseMarkdownPages(markdownContent) {
        if (!markdownContent || typeof markdownContent !== 'string') {
            return [];
        }

        const sections = markdownContent.split('\n---\n');
        const pages = [];

        sections.forEach((section, index) => {
            if (!section.trim()) return;

            const lines = section.split('\n');
            let pageId = null;
            let pageType = 'content';
            let title = `Page ${index + 1}`;
            let content = '';
            let contentStarted = false;

            lines.forEach(line => {
                if (line.startsWith('# Page: ')) {
                    pageId = line.replace('# Page: ', '').trim();
                } else if (line.startsWith('type: ')) {
                    pageType = line.replace('type: ', '').trim();
                } else if (line.startsWith('title: ')) {
                    title = line.replace('title: ', '').trim();
                } else if (line.trim() === '' && !contentStarted) {
                    contentStarted = true;
                } else if (contentStarted) {
                    content += line + '\n';
                }
            });

            pages.push({
                id: pageId || index,
                title: title,
                content: content.trim(),
                type: pageType,
                order: index
            });
        });

        return pages;
    }

    processMediaPlaceholders(content) {
        // Traitement des vidéos avec support du pourcentage comme les images
        content = content.replace(/\[VIDEO:\s*([^\]]+)\]/g, (match, data) => {
            const parts = data.split('|').map(p => p.trim());
            const src = parts[0];

            let scale = null;
            let description = '';

            if (parts.length === 2) {
                if (/^\d+%$/.test(parts[1])) {
                    scale = parts[1];
                } else {
                    description = parts[1];
                }
            } else if (parts.length >= 3) {
                scale = parts[1];
                description = parts.slice(2).join('|');
            }

            let videoStyle = 'max-width: 100%; height: auto; border-radius: 6px;';
            
            if (scale) {
                const sanitized = scale.replace(/[^0-9.%]/g, '');
                if (sanitized) {
                    videoStyle += ` width: ${sanitized};`;
                }
            }

            let videoSrc = src.trim();
            if (!/^https?:\/\//.test(videoSrc) && !videoSrc.startsWith('media/')) {
                videoSrc = `media/${videoSrc}`;
            }

            return `<div class="video-container" style="text-align: center; margin: 1rem 0;">
                <video class="institutional-video" controls preload="metadata" style="${videoStyle}">
                    <source src="${videoSrc}" type="video/mp4">
                    <div class="video-fallback">
                        <p><strong>VIDÉO INSTITUTIONNELLE</strong></p>
                        <p>${description || 'Vidéo non disponible'}</p>
                    </div>
                </video>
                ${description ? `<p style="font-style: italic; margin-top: 0.5rem; font-size: 0.9rem;">${description}</p>` : ''}
            </div>`;
        });

        // Traitement des images et placeholders avec option d'échelle (syntaxe [IMAGE: ...])
        content = content.replace(/\[IMAGE:\s*([^\]]+)\]/g, (match, data) => {
            const parts = data.split('|').map(p => p.trim());
            const src = parts[0];

            const isImage = /\.(jpg|jpeg|png|gif|svg|webp|bmp)$/i.test(src);

            if (!isImage) {
                return `<div class="media-placeholder">${data.trim()}</div>`;
            }

            let scale = null;
            let description = '';

            if (parts.length === 2) {
                if (/^\d+%$/.test(parts[1])) {
                    scale = parts[1];
                } else {
                    description = parts[1];
                }
            } else if (parts.length >= 3) {
                scale = parts[1];
                description = parts.slice(2).join('|');
            }

            let imgStyle = 'max-width: 100%; height: auto; border-radius: 6px;';
            let placeholderPadding = '0.5rem';
            
            if (scale) {
                const sanitized = scale.replace(/[^0-9.%]/g, '');
                if (sanitized) {
                    imgStyle += ` width: ${sanitized};`;
                    // Ajuster le padding selon la taille de l'image
                    const scaleNum = parseInt(sanitized);
                    if (scaleNum <= 15) placeholderPadding = '0.3rem';
                    else if (scaleNum <= 30) placeholderPadding = '0.4rem';
                }
            }

            let imgSrc = src.trim();
            if (!/^https?:\/\//.test(imgSrc) && !imgSrc.startsWith('media/')) {
                imgSrc = `media/${imgSrc}`;
            }
            return `<div style="text-align: center; margin: 1rem 0;">
                <div class="media-placeholder" style="display: inline-block; width: auto; margin: 0; padding: ${placeholderPadding};">
                    <img src="${imgSrc}" alt="${description || 'Image'}" style="${imgStyle}">
                    <p style="font-style: italic; margin-top: 0.5rem; font-size: 0.9rem;">${description || ''}</p>
                </div>
            </div>`;
        });

        // Traitement des placeholders vidéo
        content = content.replace(/\[VIDEO-PLACEHOLDER: ([^|]+)(\|([^\]]+))?\]/g, (match, src, _, description) => {
            return `<div class="video-placeholder"><strong>VIDÉO</strong><br>${description || src}</div>`;
        });

        return content;
    }

    processInternalLinks(content) {
        // Traitement des liens internes
        content = content.replace(/onclick="goToPage\((\d+)\)"/g, (match, pageNum) => {
            return `onclick="goToPage(${pageNum})"`;
        });

        return content;
    }

    async loadTemplate() {
        if (!await fs.pathExists(this.templatePath)) {
            throw new Error(`Template RTL from scratch non trouvé: ${this.templatePath}`);
        }
        return await fs.readFile(this.templatePath, 'utf8');
    }

    async loadOriginalHtml() {
        const fallbackPath = path.join(__dirname, 'gabarit', 'index.html');
        return await fs.readFile(fallbackPath, 'utf8');
    }

    extractStyles(html) {
        const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/);
        return styleMatch ? styleMatch[1] : '';
    }

    generateCleanStyles(theme) {
        // Générer des styles CSS propres avec les nouveaux champs simplifiés
        const coverEndBackground = theme?.cover_end_background_color || '#d8e0e5';
        const globalFont = theme?.global_font || 'Poppins';
        const separatorColor = theme?.separator_color || '#638c1c';
        
        return `
        /* ===== VARIABLES CSS SIMPLIFIÉES ===== */
        :root {
            --cover-end-background-color: ${coverEndBackground};
            --global-font: '${globalFont}', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            --separator-color: ${separatorColor};
            --cover-end-separator-color: ${theme?.cover_end_separator_color || '#ffffff'};
            
            /* Variables de compatibilité pour l'ancien système */
            --font-primary: '${globalFont}', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            --font-secondary: '${globalFont}', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            --primary-color: #323e48;
            --secondary-color: ${separatorColor};
            --tertiary-color: ${coverEndBackground};
        }

        /* ===== STYLES POUR PAGES COVER ET FIN ===== */
        .page[data-page-type="cover"],
        .page[data-page-type="end"] {
            background-color: var(--cover-end-background-color) !important;
        }

        /* ===== STYLES POUR LES SÉPARATEURS DE TITRES ===== */
        .page h1::after {
            content: '';
            display: block;
            width: 100%;
            height: 2px;
            background-color: var(--separator-color);
            margin: 20px 0 25px 0;
        }

        /* Trait de séparation spécifique pour pages COVER et FIN */
        .page[data-page-type="cover"] h1::after,
        .page[data-page-type="end"] h1::after {
            background-color: var(--cover-end-separator-color);
        }

        /* ===== POLICE GLOBALE ===== */
        body, .page, .page-content, h1, h2, h3, h4, h5, h6, p, div, span {
            font-family: var(--global-font) !important;
        }

        /* ===== PANNEAU DE CONTRÔLE THÉMATIQUE ===== */
        .control-button {
            background: var(--cover-end-background-color) !important;
            color: white !important;
            font-family: var(--global-font) !important;
        }

        .control-button:hover {
            background: var(--separator-color) !important;
            color: white !important;
        }

        .control-button:disabled,
        .control-button.disabled {
            background: #cccccc !important;
            color: #666666 !important;
            cursor: not-allowed !important;
            opacity: 0.6 !important;
        }

        .control-button:disabled:hover,
        .control-button.disabled:hover {
            background: #cccccc !important;
            color: #666666 !important;
        }

        .home-button {
            background: var(--cover-end-background-color) !important;
            color: white !important;
        }

        .home-button:hover {
            background: var(--separator-color) !important;
            color: white !important;
        }

        .book-zoom-slider, .text-zoom-slider {
            background: var(--cover-end-background-color) !important;
        }

        .book-zoom-slider::-webkit-slider-thumb, 
        .text-zoom-slider::-webkit-slider-thumb {
            background: white !important;
            border: 2px solid var(--separator-color) !important;
        }
        
        .book-zoom-slider::-moz-range-thumb,
        .text-zoom-slider::-moz-range-thumb {
            background: white !important;
            border: 2px solid var(--separator-color) !important;
        }

        .text-zoom-label {
            color: var(--separator-color) !important;
        }

        /* ===== SUPPORT RTL PROPRE (sans transformation CSS) ===== */
        [dir="rtl"] {
            --text-align-start: right;
            --text-align-end: left;
            --margin-start: margin-right;
            --margin-end: margin-left;
            --padding-start: padding-right;
            --padding-end: padding-left;
            --border-start: border-right;
            --border-end: border-left;
        }

        [dir="ltr"] {
            --text-align-start: left;
            --text-align-end: right;
            --margin-start: margin-left;
            --margin-end: margin-right;
            --padding-start: padding-left;
            --padding-end: padding-right;
            --border-start: border-left;
            --border-end: border-right;
        }
        `;
    }

    applyThemeToStyles(styles, theme) {
        // Cette méthode n'est plus utilisée car nous générons des styles propres
        return styles;
    }

    async copyMedia() {
        const sourceMediaPath = this.mediaPath;
        const targetMediaPath = path.join(this.outputPath, 'media');

        if (await fs.pathExists(sourceMediaPath)) {
            await fs.copy(sourceMediaPath, targetMediaPath);
            
            const mediaFiles = await fs.readdir(targetMediaPath);
            console.log(chalk.green(`✓ ${mediaFiles.length} médias copiés`));
        }
    }
}

// CLI
async function main() {
    const args = process.argv.slice(2);
    
    if (args.includes('--help')) {
        console.log(chalk.cyan('📚 Générateur RTL From Scratch'));
        console.log('');
        console.log('Usage:');
        console.log('  node generator-rtl-from-scratch.js --book=ID [options]');
        console.log('');
        console.log('Options:');
        console.log('  --book=ID     ID du livre à générer (défaut: 1)');
        console.log('  --user=ID     ID de l\'utilisateur (optionnel)');
        console.log('  --help        Afficher cette aide');
        console.log('');
        console.log('Exemples:');
        console.log('  node generator-rtl-from-scratch.js --book=14  # Livre arabe');
        console.log('  node generator-rtl-from-scratch.js --book=16  # Livre français');
        return;
    }

    const bookId = args.find(arg => arg.startsWith('--book='))?.split('=')[1] || 1;
    const userId = args.find(arg => arg.startsWith('--user='))?.split('=')[1] || null;

    const generator = new RTLBookGeneratorFromScratch();
    await generator.generate(parseInt(bookId), userId ? parseInt(userId) : null);
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = RTLBookGeneratorFromScratch;