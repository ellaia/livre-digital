#!/usr/bin/env node

const { pool } = require('./db');
const fs = require('fs-extra');
const path = require('path');

// Données du livre de référence (extraites du livre n°9)
const REFERENCE_BOOK_DATA = {
  "book": {
    "id": 9,
    "user_id": 1,
    "title": "LIVRE DIGITAL CNRA (REFERENCE)",
    "subtitle": "DE LA CRÉATION DE LA CAISSE NATIONALE DE RETRAITES ET D'ASSURANCES À AUJOURD'HUI",
    "cover_image": "media/logo-cnra.png",
    "years": "1960 - 2025",
    "institution": "Caisse Nationale de Retraites et d'Assurances",
    "description": "Histoire et évolution de la CNRA depuis sa création en 1960 jusqu'à aujourd'hui. Ce livre digital présente les principales étapes du développement de l'institution.",
    "author": "CNRA - Service Communication",
    "anniversary": "65 ans d'histoire",
    "slug": "livre-digital-cnra-reference-copy",
    "language": "fr",
    "direction": "ltr",
    "is_published": true,
    "is_reference": true
  },
  "theme": {
    "primary_color": "#2c5530",
    "secondary_color": "#7CB342", 
    "tertiary_color": "#E8F5E8",
    "primary_light": "#5f8863",
    "secondary_light": "#afe675",
    "tertiary_dark": "#b5c2b5",
    "font_primary": "Poppins",
    "font_secondary": "Poppins"
  },
  "media": [
    {
      "filename": "logo-cnra.png",
      "original_name": "logo-cnra.png",
      "mime_type": "image/png",
      "file_size": 15324,
      "media_type": "image",
      "alt_text": "Logo CNRA",
      "description": "Logo officiel de la Caisse Nationale de Retraites et d'Assurances"
    },
    {
      "filename": "batiment-historique.jpg",
      "original_name": "batiment-historique.jpg", 
      "mime_type": "image/jpeg",
      "file_size": 87654,
      "media_type": "image",
      "alt_text": "Premier siège CNRA",
      "description": "Premier siège de la CNRA en 1960"
    }
  ]
};

async function createReferenceBook() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('📚 Création du livre de référence...');
    
    // 1. Créer le livre
    const bookResult = await client.query(`
      INSERT INTO books (
        user_id, title, subtitle, cover_image, years, institution, 
        description, author, anniversary, slug, language, direction, is_published, is_reference
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING id
    `, [
      1, // user_id = 1 (utilisateur admin)
      REFERENCE_BOOK_DATA.book.title,
      REFERENCE_BOOK_DATA.book.subtitle,
      REFERENCE_BOOK_DATA.book.cover_image,
      REFERENCE_BOOK_DATA.book.years,
      REFERENCE_BOOK_DATA.book.institution,
      REFERENCE_BOOK_DATA.book.description,
      REFERENCE_BOOK_DATA.book.author,
      REFERENCE_BOOK_DATA.book.anniversary,
      REFERENCE_BOOK_DATA.book.slug + '-' + Date.now(),
      REFERENCE_BOOK_DATA.book.language,
      REFERENCE_BOOK_DATA.book.direction,
      true,
      true
    ]);
    
    const bookId = bookResult.rows[0].id;
    console.log(`✅ Livre créé avec ID: ${bookId}`);
    
    // 2. Créer le thème
    await client.query(`
      INSERT INTO themes (
        book_id, primary_color, secondary_color, tertiary_color,
        primary_light, secondary_light, tertiary_dark, font_primary, font_secondary
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [
      bookId,
      REFERENCE_BOOK_DATA.theme.primary_color,
      REFERENCE_BOOK_DATA.theme.secondary_color,
      REFERENCE_BOOK_DATA.theme.tertiary_color,
      REFERENCE_BOOK_DATA.theme.primary_light,
      REFERENCE_BOOK_DATA.theme.secondary_light,
      REFERENCE_BOOK_DATA.theme.tertiary_dark,
      REFERENCE_BOOK_DATA.theme.font_primary,
      REFERENCE_BOOK_DATA.theme.font_secondary
    ]);
    console.log('🎨 Thème créé');
    
    // 3. Créer les features par défaut
    await client.query(`
      INSERT INTO book_features (book_id) VALUES ($1)
    `, [bookId]);
    
    // 4. Créer les pages individuellement
    const pages = [
      {
        page_id: 'cover',
        page_type: 'cover',
        title: 'Page de Couverture',
        content: `<div class="page-content page-cover">
  <h1>LIVRE DIGITAL CNRA</h1>
  <h2>DE LA CRÉATION DE LA CAISSE NATIONALE DE RETRAITES ET D'ASSURANCES À AUJOURD'HUI</h2>
  
  <div style="text-align: center; margin: 2rem 0;">
    [IMAGE: logo-cnra.png | 60% | Logo officiel de la CNRA]
  </div>
  
  <h3 style="text-align: center; font-weight: 600; margin: 2rem 0;">65 ans d'histoire au service des retraités</h3>
  
  <p style="text-align: center; font-size: 1.2rem; font-weight: 500;">1960 - 2025</p>
</div>`,
        page_order: 1
      },
      {
        page_id: 'sommaire',
        page_type: 'sommaire',
        title: 'SOMMAIRE',
        content: `<div class="page-content">
  <h1>SOMMAIRE</h1>
  
  <h2>Table des matières</h2>
  
  <p>Ce sommaire est généré automatiquement en fonction des pages de contenu de votre livre.</p>
  
  <!-- Les liens vers les pages sont générés automatiquement -->
</div>`,
        page_order: 2
      },
      {
        page_id: 'histoire',
        page_type: 'content',
        title: 'Histoire de la CNRA',
        content: `<div class="page-content">
  <h1>Histoire de la CNRA</h1>
  
  <h2>Les débuts (1960-1980)</h2>
  
  <p>La <strong>Caisse Nationale de Retraites et d'Assurances</strong> a été créée en <strong>1960</strong> pour répondre aux besoins croissants de protection sociale des travailleurs.</p>
  
  <div style="text-align: center; margin: 1.5rem 0;">
    [IMAGE: batiment-historique.jpg | 50% | Premier siège de la CNRA en 1960]
  </div>
  
  <h3>Missions principales :</h3>
  <ul>
    <li>Gestion des retraites</li>
    <li>Protection sociale</li>
    <li>Accompagnement des assurés</li>
  </ul>
  
  <h2>Évolution moderne (1980-2025)</h2>
  
  <p>L'institution a su s'adapter aux défis du XXI<sup>e</sup> siècle en modernisant ses services et en développant des solutions digitales innovantes.</p>
  
  <h3>Chiffres clés :</h3>
  <ul>
    <li>Plus de <strong>500 000 bénéficiaires</strong></li>
    <li><strong>65 années</strong> d'expérience</li>
    <li>Couverture <strong>nationale</strong></li>
  </ul>
</div>`,
        page_order: 3
      },
      {
        page_id: 'services',
        page_type: 'content',
        title: 'Nos Services',
        content: `<div class="page-content">
  <h1>Nos Services</h1>
  
  <h2>Une gamme complète de prestations</h2>
  
  <p>La CNRA propose aujourd'hui un ensemble de services modernes et accessibles pour tous ses assurés.</p>
  
  <h3>Services en ligne :</h3>
  <ul>
    <li>Consultation de compte</li>
    <li>Demandes de prestations</li>
    <li>Simulateurs de retraite</li>
    <li>Espace personnel sécurisé</li>
  </ul>
  
  <h3>Accompagnement personnalisé :</h3>
  <ul>
    <li>Conseillers dédiés</li>
    <li>Permanences régionales</li>
    <li>Information et orientation</li>
  </ul>
  
  <div style="text-align: center; margin: 2rem 0;">
    [VIDEO: presentation-services.mp4 | 70% | Présentation de nos services]
  </div>
  
  <h2>Innovation et digital</h2>
  
  <p>Notre transformation digitale nous permet d'offrir une expérience utilisateur optimale tout en préservant la qualité de l'accompagnement humain.</p>
</div>`,
        page_order: 4
      },
      {
        page_id: 'contact',
        page_type: 'content',
        title: 'Nous Contacter',
        content: `<div class="page-content">
  <h1>Nous Contacter</h1>
  
  <h2>Restez en contact avec la CNRA</h2>
  
  <h3>Siège Social</h3>
  <p><strong>Adresse :</strong> 123 Avenue de la Retraite, 75001 Paris<br>
  <strong>Téléphone :</strong> 01 23 45 67 89<br>
  <strong>Email :</strong> contact@cnra.fr</p>
  
  <h3>Horaires d'ouverture</h3>
  <ul>
    <li><strong>Lundi à Vendredi :</strong> 8h30 - 17h30</li>
    <li><strong>Samedi :</strong> 9h00 - 12h00</li>
  </ul>
  
  <h3>Services numériques</h3>
  <ul>
    <li><strong>Site web :</strong> www.cnra.fr</li>
    <li><strong>Application mobile :</strong> CNRA Mobile</li>
    <li><strong>Réseaux sociaux :</strong> @CNRAOfficiel</li>
  </ul>
</div>`,
        page_order: 5
      },
      {
        page_id: 'end',
        page_type: 'end',
        title: 'Page de Fin',
        content: `<div class="page-content" style="text-align: center;">
  <h1>Merci de votre attention</h1>
  
  <h2>CNRA - 65 ans à votre service</h2>
  
  <p style="font-size: 1.2rem; margin: 2rem 0;"><strong>Caisse Nationale de Retraites et d'Assurances</strong></p>
  
  <p style="font-style: italic; margin: 2rem 0;">Votre partenaire retraite depuis 1960</p>
  
  <hr style="margin: 2rem 0;">
  
  <div style="line-height: 1.8;">
    <p><strong>📞 Contact :</strong> 01 23 45 67 89</p>
    <p><strong>🌐 Web :</strong> www.cnra.fr</p>
    <p><strong>📧 Email :</strong> contact@cnra.fr</p>
  </div>
</div>`,
        page_order: 6
      }
    ];

    for (const page of pages) {
      await client.query(`
        INSERT INTO pages (book_id, page_id, page_type, title, content, page_order, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `, [bookId, page.page_id, page.page_type, page.title, page.content, page.page_order]);
    }
    console.log('📄 Pages créées');
    
    // 5. Créer les médias (métadonnées seulement)
    for (const media of REFERENCE_BOOK_DATA.media) {
      await client.query(`
        INSERT INTO media (
          book_id, filename, original_name, mime_type, file_size, 
          media_type, alt_text, description
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        bookId,
        media.filename,
        media.original_name,
        media.mime_type,
        media.file_size,
        media.media_type,
        media.alt_text,
        media.description
      ]);
    }
    console.log('🎬 Métadonnées des médias créées');
    
    // 6. Créer le dossier de médias
    const mediaDir = path.join(__dirname, '..', 'output', `livre-${bookId}`, 'media');
    await fs.ensureDir(mediaDir);
    console.log('📁 Dossier média créé:', mediaDir);
    
    await client.query('COMMIT');
    
    console.log('🎉 LIVRE DE RÉFÉRENCE CRÉÉ AVEC SUCCÈS !');
    console.log(`📖 Titre: ${REFERENCE_BOOK_DATA.book.title}`);
    console.log(`🆔 ID: ${bookId}`);
    console.log(`📄 Pages: 6 pages individuelles avec contenu HTML formaté`);
    console.log(`🎬 Médias: ${REFERENCE_BOOK_DATA.media.length} fichiers`);
    console.log('');
    console.log('💡 PROCHAINES ÉTAPES:');
    console.log('1. Connectez-vous à http://localhost:3000');
    console.log('2. Utilisez admin/admin123 pour vous connecter');
    console.log('3. Le livre de référence apparaîtra dans votre liste');
    console.log('4. Vous pouvez le dupliquer pour créer vos propres livres');
    
    return bookId;
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Erreur lors de la création du livre de référence:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  createReferenceBook().catch(console.error);
}

module.exports = createReferenceBook;