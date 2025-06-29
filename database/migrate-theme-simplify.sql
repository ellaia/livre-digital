-- ==============================================
-- MIGRATION : SIMPLIFICATION DE LA TABLE THEMES
-- Ajoute les nouveaux champs simplifiés et supprime les anciens
-- ==============================================

-- Ajouter les nouvelles colonnes pour le thème simplifié
ALTER TABLE themes 
ADD COLUMN IF NOT EXISTS cover_end_background_color VARCHAR(7) DEFAULT '#d8e0e5',
ADD COLUMN IF NOT EXISTS global_font VARCHAR(100) DEFAULT 'Poppins',
ADD COLUMN IF NOT EXISTS separator_color VARCHAR(7) DEFAULT '#638c1c';

-- Migrer les données existantes vers les nouveaux champs
UPDATE themes SET 
    cover_end_background_color = COALESCE(tertiary_color, '#d8e0e5'),
    global_font = COALESCE(font_primary, 'Poppins'),
    separator_color = COALESCE(secondary_color, '#638c1c')
WHERE cover_end_background_color IS NULL OR global_font IS NULL OR separator_color IS NULL;

-- Optionnel : Supprimer les anciennes colonnes (décommentez si vous voulez les supprimer définitivement)
-- ALTER TABLE themes DROP COLUMN IF EXISTS primary_color;
-- ALTER TABLE themes DROP COLUMN IF EXISTS secondary_color; 
-- ALTER TABLE themes DROP COLUMN IF EXISTS tertiary_color;
-- ALTER TABLE themes DROP COLUMN IF EXISTS primary_light;
-- ALTER TABLE themes DROP COLUMN IF EXISTS secondary_light;
-- ALTER TABLE themes DROP COLUMN IF EXISTS tertiary_dark;
-- ALTER TABLE themes DROP COLUMN IF EXISTS font_primary;
-- ALTER TABLE themes DROP COLUMN IF EXISTS font_secondary;

-- Vérifier que les nouveaux champs ont été ajoutés
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'themes' 
AND column_name IN ('cover_end_background_color', 'global_font', 'separator_color')
ORDER BY column_name;

-- Afficher un échantillon des données migrées
SELECT 
    id, 
    book_id,
    cover_end_background_color,
    global_font,
    separator_color,
    updated_at
FROM themes 
LIMIT 5;