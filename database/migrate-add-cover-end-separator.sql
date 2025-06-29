-- ==============================================
-- MIGRATION : AJOUT COULEUR SÉPARATEUR COVER/FIN
-- Ajoute le champ cover_end_separator_color à la table themes
-- ==============================================

-- Ajouter la nouvelle colonne pour la couleur des traits COVER/FIN
ALTER TABLE themes 
ADD COLUMN IF NOT EXISTS cover_end_separator_color VARCHAR(7) DEFAULT '#ffffff';

-- Mettre à jour les enregistrements existants avec la valeur par défaut
UPDATE themes 
SET cover_end_separator_color = '#ffffff' 
WHERE cover_end_separator_color IS NULL;

-- Vérifier que le nouveau champ a été ajouté
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'themes' 
AND column_name = 'cover_end_separator_color';

-- Afficher un échantillon des données
SELECT 
    id, 
    book_id,
    separator_color,
    cover_end_separator_color,
    updated_at
FROM themes 
LIMIT 5;