-- ==============================================
-- SCHÉMA DE BASE DE DONNÉES POUR LIVRE DIGITAL
-- Migration complète des fichiers vers PostgreSQL
-- ==============================================

-- Table des livres (remplace book-config.json)
CREATE TABLE IF NOT EXISTS books (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    subtitle TEXT,
    cover_image VARCHAR(255),
    years VARCHAR(100),
    institution VARCHAR(255),
    description TEXT,
    author VARCHAR(255),
    anniversary VARCHAR(255),
    slug VARCHAR(100) UNIQUE NOT NULL, -- URL-friendly identifier
    language VARCHAR(10) DEFAULT 'fr', -- Langue du livre (fr, ar, etc.)
    direction VARCHAR(3) DEFAULT 'ltr', -- Direction du texte (ltr, rtl)
    is_published BOOLEAN DEFAULT false,
    is_reference BOOLEAN DEFAULT false, -- Livre de référence (template)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des thèmes (remplace theme dans book-config.json)
CREATE TABLE IF NOT EXISTS themes (
    id SERIAL PRIMARY KEY,
    book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
    primary_color VARCHAR(7) DEFAULT '#323e48',
    secondary_color VARCHAR(7) DEFAULT '#638c1c',
    tertiary_color VARCHAR(7) DEFAULT '#d8e0e5',
    primary_light VARCHAR(7) DEFAULT '#4a5660',
    secondary_light VARCHAR(7) DEFAULT '#7ba821',
    tertiary_dark VARCHAR(7) DEFAULT '#c1cdd4',
    font_primary VARCHAR(100) DEFAULT 'Poppins',
    font_secondary VARCHAR(100) DEFAULT 'Poppins',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des fonctionnalités (remplace features dans book-config.json)
CREATE TABLE IF NOT EXISTS book_features (
    id SERIAL PRIMARY KEY,
    book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
    video_support BOOLEAN DEFAULT true,
    mobile_portrait_default BOOLEAN DEFAULT true,
    zoom_controls BOOLEAN DEFAULT true,
    progress_indicator BOOLEAN DEFAULT true,
    draggable_controls BOOLEAN DEFAULT true,
    flip_animation BOOLEAN DEFAULT true,
    responsive_design BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des configurations de layout (remplace layout dans book-config.json)
CREATE TABLE IF NOT EXISTS book_layouts (
    id SERIAL PRIMARY KEY,
    book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
    page_width INTEGER DEFAULT 550,
    page_height INTEGER DEFAULT 733,
    min_width INTEGER DEFAULT 280,
    max_width INTEGER DEFAULT 900,
    min_height INTEGER DEFAULT 420,
    max_height INTEGER DEFAULT 1350,
    flip_duration INTEGER DEFAULT 1000,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des configurations de contenu (remplace content dans book-config.json)
CREATE TABLE IF NOT EXISTS book_content_settings (
    id SERIAL PRIMARY KEY,
    book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
    show_sommaire BOOLEAN DEFAULT true,
    show_cover BOOLEAN DEFAULT true,
    show_end_page BOOLEAN DEFAULT true,
    auto_generate_sommaire BOOLEAN DEFAULT true,
    pack_output BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des pages (remplace pages.md)
CREATE TABLE IF NOT EXISTS pages (
    id SERIAL PRIMARY KEY,
    book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
    page_id VARCHAR(100) NOT NULL, -- ID unique de la page (ex: "cover", "sommaire")
    page_type VARCHAR(50) NOT NULL, -- "cover", "content", "sommaire", "end"
    title VARCHAR(255) NOT NULL,
    content TEXT, -- Contenu Markdown
    page_order INTEGER NOT NULL, -- Ordre dans le livre
    is_visible BOOLEAN DEFAULT true,
    metadata JSONB, -- Métadonnées supplémentaires (image, years, etc.)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(book_id, page_id),
    UNIQUE(book_id, page_order)
);

-- Table des médias (remplace le dossier media/)
CREATE TABLE IF NOT EXISTS media (
    id SERIAL PRIMARY KEY,
    book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size INTEGER NOT NULL,
    file_path VARCHAR(500), -- Chemin relatif ou URL
    file_data BYTEA, -- Stockage direct du fichier (optionnel)
    alt_text TEXT,
    description TEXT,
    media_type VARCHAR(50) NOT NULL, -- "image", "video", "audio", "document"
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(book_id, filename)
);

-- Table des templates (remplace les templates HTML)
CREATE TABLE IF NOT EXISTS templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    html_content TEXT NOT NULL, -- Template HTML complet
    css_content TEXT, -- CSS spécifique au template
    js_content TEXT, -- JavaScript spécifique au template
    is_default BOOLEAN DEFAULT false,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table de liaison livre-template
CREATE TABLE IF NOT EXISTS book_templates (
    id SERIAL PRIMARY KEY,
    book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
    template_id INTEGER REFERENCES templates(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(book_id)
);

-- Index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_books_user_id ON books(user_id);
CREATE INDEX IF NOT EXISTS idx_books_slug ON books(slug);
CREATE INDEX IF NOT EXISTS idx_pages_book_id ON pages(book_id);
CREATE INDEX IF NOT EXISTS idx_pages_order ON pages(book_id, page_order);
CREATE INDEX IF NOT EXISTS idx_media_book_id ON media(book_id);
CREATE INDEX IF NOT EXISTS idx_media_type ON media(media_type);

-- Triggers pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_books_updated_at ON books;
DROP TRIGGER IF EXISTS update_themes_updated_at ON themes;
DROP TRIGGER IF EXISTS update_pages_updated_at ON pages;
DROP TRIGGER IF EXISTS update_media_updated_at ON media;
DROP TRIGGER IF EXISTS update_templates_updated_at ON templates;

CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON books FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_themes_updated_at BEFORE UPDATE ON themes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON pages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_media_updated_at BEFORE UPDATE ON media FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();