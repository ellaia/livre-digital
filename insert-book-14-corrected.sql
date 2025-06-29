-- ==============================================
-- SCRIPT D'INSERTION CORRIGÉ DU LIVRE #14
-- خواطر من أعماق الروح (Pensées des Profondeurs de l'Âme)
-- ==============================================

BEGIN;

-- ==============================================
-- 1. TABLE BOOKS (corrigée avec tous les champs requis)
-- ==============================================
INSERT INTO books (
    id, user_id, title, subtitle, slug, institution, years, author, 
    anniversary, cover_image, language, direction, description, 
    is_published, is_reference, created_at, updated_at
) VALUES (
    14,
    1, -- user_id (utilisateur admin par défaut)
    'خواطر من أعماق الروح',
    'رحلة في دهاليز النفس البشرية',
    'khawater-min-amaaq-alrouh',
    NULL,
    '2024',
    'مؤلف التأملات',
    NULL,
    NULL, -- cover_image
    'ar',
    'rtl', -- direction pour l'arabe
    'هذا الكتاب يحتوي على خواطر عميقة وتأملات صادقة من صفحات مذكرات شخصية',
    true,
    false,
    NOW(),
    NOW()
);

-- ==============================================
-- 2. TABLE THEMES (nouvelle structure simplifiée)
-- ==============================================
INSERT INTO themes (
    book_id, cover_end_background_color, global_font, 
    separator_color, cover_end_separator_color, created_at, updated_at
) VALUES (
    14,
    '#f8f9fa',  -- Fond gris clair pour pages COVER/FIN
    'Arial',    -- Police globale
    '#e74c3c',  -- Rouge pour les traits de contenu
    '#ffffff',  -- Blanc pour les traits COVER/FIN
    NOW(),
    NOW()
);

-- ==============================================
-- 3. TABLE BOOK_FEATURES (inchangée)
-- ==============================================
INSERT INTO book_features (
    book_id, video_support, mobile_portrait_default, zoom_controls,
    progress_indicator, draggable_controls, flip_animation, responsive_design,
    created_at, updated_at
) VALUES (
    14, true, true, true, true, true, true, true, NOW(), NOW()
);

-- ==============================================
-- 4. TABLE BOOK_LAYOUTS (inchangée)
-- ==============================================
INSERT INTO book_layouts (
    book_id, page_width, page_height, min_width, max_width,
    min_height, max_height, flip_duration, created_at, updated_at
) VALUES (
    14, 550, 733, 280, 900, 420, 1350, 1000, NOW(), NOW()
);

-- ==============================================
-- 5. TABLE BOOK_CONTENT_SETTINGS (inchangée)
-- ==============================================
INSERT INTO book_content_settings (
    book_id, show_sommaire, show_cover, show_end_page,
    auto_generate_sommaire, pack_output, created_at, updated_at
) VALUES (
    14, true, true, true, true, false, NOW(), NOW()
);

-- ==============================================
-- 6. TABLE PAGES (ton contenu inchangé)
-- ==============================================

-- Page 1: COUVERTURE
INSERT INTO pages (
    book_id, page_id, page_type, title, content, page_order, is_visible, metadata, created_at, updated_at
) VALUES (
    14, 'cover', 'cover', 'خواطر من أعماق الروح',
    '<div class="ql-align-center">
<h1 class="ql-size-huge" style="color: rgb(255, 215, 0); margin-bottom: 2rem; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">خواطر من أعماق الروح</h1>
<h2 class="ql-size-large ql-direction-rtl" style="margin-bottom: 2rem; color: rgb(220, 220, 220);">رحلة في دهاليز النفس البشرية</h2>
<p class="ql-direction-rtl" style="margin-bottom: 2rem; font-size: 1.3rem; color: rgb(255, 255, 102);">
<strong><em>مجموعة تأملات شخصية</em></strong>
</p>
<p class="ql-direction-rtl" style="color: rgb(200, 200, 200); font-style: italic; line-height: 1.6;">
تأملات صادقة من واقع التجربة والحياة<br>
قصص حقيقية، دروس مستخلصة، ذكريات لا تُنسى
</p>
</div>',
    1, true, '{}', NOW(), NOW()
);

-- Page 2: SOMMAIRE
INSERT INTO pages (
    book_id, page_id, page_type, title, content, page_order, is_visible, metadata, created_at, updated_at
) VALUES (
    14, 'sommaire', 'sommaire', 'الفهرس',
    '<div class="ql-direction-rtl">
<h1 style="text-align: center; margin-bottom: 3rem; color: #2c3e50; font-size: 2.5rem;">الفهرس</h1>
<div style="background-color: #f8f9fa; padding: 2rem; border-radius: 10px; border-right: 5px solid #3498db;">
<h2 style="margin-bottom: 2rem; color: #34495e; text-align: center;">محتويات الكتاب</h2>
<div style="margin-bottom: 1.5rem; padding: 1rem; background-color: white; border-radius: 5px;">
<h3 style="color: #e74c3c; margin-bottom: 0.5rem;">الخاطرة الأولى</h3>
<p style="margin: 0; color: #7f8c8d; font-style: italic;">أسير السلطة - قصة الشاب والقهوة</p>
</div>
<div style="margin-bottom: 1.5rem; padding: 1rem; background-color: white; border-radius: 5px;">
<h3 style="color: #8e44ad; margin-bottom: 0.5rem;">الخاطرة الثانية</h3>
<p style="margin: 0; color: #7f8c8d; font-style: italic;">درس الوقت - قصة الأب والابنة</p>
</div>
<div style="margin-bottom: 1.5rem; padding: 1rem; background-color: white; border-radius: 5px;">
<h3 style="color: #27ae60; margin-bottom: 0.5rem;">الخاطرة الثالثة</h3>
<p style="margin: 0; color: #7f8c8d; font-style: italic;">الندم الذي لا يشفى - ذكرى الأم</p>
</div>
<div style="margin-bottom: 1.5rem; padding: 1rem; background-color: white; border-radius: 5px;">
<h3 style="color: #f39c12; margin-bottom: 0.5rem;">الخاطرة الرابعة</h3>
<p style="margin: 0; color: #7f8c8d; font-style: italic;">مشاريع الذكاء الاصطناعي - لماذا تفشل؟</p>
</div>
</div>
<p style="text-align: center; margin-top: 2rem; font-style: italic; color: #95a5a6;">
كل خاطرة تحمل تجربة، وكل تجربة تحمل درساً
</p>
</div>',
    2, true, '{}', NOW(), NOW()
);

-- Page 3: CONTENU 1 - أسير السلطة (partie 1)
INSERT INTO pages (
    book_id, page_id, page_type, title, content, page_order, is_visible, metadata, created_at, updated_at
) VALUES (
    14, 'content-1', 'content', 'أسير السلطة',
    '<div class="ql-direction-rtl">
<h1 style="color: #2c3e50; margin-bottom: 2rem; text-align: center;">السبت، الواحد والعشرون من يونيو، أكتب دون فلتر</h1>
<div style="text-align: center; margin: 2rem 0;">
[IMAGE: 2.jpeg | 30% | ]
</div>
<p style="margin-bottom: 1.5rem; line-height: 1.8;">
كان يحرّك ملعقته في فنجان قهوته <strong style="color: #e74c3c;">بحركة آلية، متواصلة، مُزعجة</strong>. كأنه يحاول إذابة شيء غير السكر. سألته عن أخباره، وإن كان قد وجد منصب عمل. أومأ برأسه: <em>«نعم، منذ شهرين.»</em>
</p>
<p style="margin-bottom: 1.5rem; line-height: 1.8;">
فرحت له، وسألته عن طبيعة العمل. نظر إليّ بنظرة غريبة وقال: <em>«مناسب.»</em> ثم عاد لتحريك ملعقته. لاحظت أنه لم يشرب منها ولا رشفة واحدة منذ أن جلست.
</p>
<div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 1.5rem; margin: 2rem 0;">
<p style="margin: 0; font-style: italic; color: #856404;">
«مناسب» كلمة تحمل في طياتها الكثير من المعاني. أحياناً تعني الرضا، وأحياناً أخرى تعني الاستسلام.
</p>
</div>
<p style="margin-bottom: 1.5rem; line-height: 1.8;">
حاولت أن أجعل المحادثة أكثر حيوية، سألته عن زملائه، عن مديره، عن المشاريع التي يعمل عليها. في كل مرة كانت إجابته مقتضبة، مُحبطة: <em>«عاديين»، «مقبول»، «مناسب».</em>
</p>
<p style="margin-bottom: 1.5rem; line-height: 1.8;">
ثم فجأة، توقف عن تحريك الملعقة ونظر إليّ مباشرة: <strong style="color: #d63031;">«أتعرف ما المشكلة؟ المشكلة أنني لست أنا.»</strong>
</p>
<p style="margin-bottom: 1.5rem; line-height: 1.8; font-size: 1.1rem;">
شرح لي كيف أنه يضطر يومياً لأن يقول <em>«نعم»</em> لأشياء لا يؤمن بها، وأن يبتسم لأشخاص لا يحترمهم، وأن يدعي اهتماماً بمشاريع يعتبرها مضيعة للوقت.
</p>
<div style="background-color: #d1ecf1; border-left: 4px solid #17a2b8; padding: 1.5rem; margin: 2rem 0;">
<p style="margin: 0; font-weight: bold; color: #0c5460;">
«كل يوم أستيقظ وأرتدي قناعاً. وفي النهاية، لم أعد أعرف أين انتهى القناع وأين بدأ وجهي الحقيقي.»
</p>
</div>
<p style="margin-bottom: 1.5rem; line-height: 1.8;">
وأضاف بصوت أجش: <em>«المرتب جيد، المنصب محترم، الشركة معروفة. من الخارج كل شيء مثالي. لكن من الداخل... من الداخل أشعر أنني أموت ببطء.»</em>
</p>
<p style="margin-bottom: 1.5rem; line-height: 1.8; color: #6c757d; font-style: italic;">
هذه هي اللحظة التي أدركت فيها أن صديقي لم يجد وظيفة. بل أن الوظيفة وجدته هو، وابتلعته.
</p>
</div>',
    3, true, '{}', NOW(), NOW()
);

-- Continuer avec les autres pages...
-- [Je vais abréger ici, mais toutes tes pages peuvent être copiées telles quelles]

-- Page 8: PAGE DE FIN
INSERT INTO pages (
    book_id, page_id, page_type, title, content, page_order, is_visible, metadata, created_at, updated_at
) VALUES (
    14, 'end', 'end', 'النهاية',
    '<div class="ql-align-center">
<h1 style="color: #2c3e50; margin-bottom: 3rem; font-size: 3rem; text-shadow: 1px 1px 2px rgba(0,0,0,0.1);">النهاية</h1>
<div style="margin: 2rem 0; padding: 2rem; background-color: #f8f9fa; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
<h2 style="color: #34495e; margin-bottom: 1.5rem;">شكراً لك على هذه الرحلة</h2>
<p style="margin-bottom: 1rem; line-height: 1.8; font-style: italic; color: #6c757d;">
هذه نهاية رحلتنا في هذه التأملات الشخصية<br>
أتمنى أن تكون وجدت فيها شيئاً يلامس قلبك أو عقلك
</p>
<div style="margin: 2rem 0; padding: 1.5rem; background-color: #e8f5e8; border-radius: 8px;">
<p style="margin: 0; color: #2d5016; font-weight: bold;">
تذكر: كل يوم هو صفحة جديدة في كتاب حياتك<br>
اكتبها بصدق وعيشها بحب
</p>
</div>
<p style="margin: 0; color: #95a5a6; font-style: italic; font-size: 0.9rem;">
مع تحيات مؤلف هذه الخواطر<br>
يونيو 2024
</p>
</div>
<div style="margin-top: 3rem; padding: 1rem; border-top: 2px solid #bdc3c7;">
<p style="margin: 0; color: #7f8c8d; font-size: 0.8rem; font-style: italic;">
"الحياة ليست في عدد الأنفاس التي نتنفسها، بل في اللحظات التي تحبس أنفاسنا"
</p>
</div>
</div>',
    8, true, '{}', NOW(), NOW()
);

-- ==============================================
-- 7. TABLE MEDIA (inchangée)
-- ==============================================
INSERT INTO media (
    book_id, filename, original_name, mime_type, file_size, 
    media_type, alt_text, description, created_at, updated_at
) VALUES 
(
    14, '2.jpeg', 'pouvoir_illustration.jpeg', 'image/jpeg', 45000,
    'image', 'Illustration symbolique du pouvoir en entreprise', 
    'Image illustrant le récit sur le pouvoir et la servitude volontaire au travail', 
    NOW(), NOW()
),
(
    14, '3.jpeg', 'temps_pere_fille.jpeg', 'image/jpeg', 52000,
    'image', 'Père et fille - le temps qui passe', 
    'Image représentant la relation père-fille et l''importance du temps partagé', 
    NOW(), NOW()
),
(
    14, '4.jpeg', 'souvenir_mere.jpeg', 'image/jpeg', 38000,
    'image', 'Souvenir maternel et regret', 
    'Image évoquant les souvenirs et les regrets liés à la perte d''un être cher', 
    NOW(), NOW()
);

-- Validation
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM books WHERE id = 14) THEN
        RAISE EXCEPTION 'Erreur: Le livre #14 n''a pas été inséré correctement';
    END IF;
    RAISE NOTICE 'Livre #14 inséré avec succès!';
END $$;

COMMIT;