-- ==============================================
-- SCRIPT D'INSERTION COMPLÈTE DU LIVRE #14
-- خواطر من أعماق الروح (Pensées des Profondeurs de l'Âme)
-- ==============================================
-- Ce script insère toutes les données du livre #14 dans une base vierge
-- Ordre respectant les contraintes d'intégrité référentielle

-- Démarrer une transaction pour assurer la cohérence
BEGIN;

-- ==============================================
-- 1. TABLE BOOKS (table principale)
-- ==============================================
INSERT INTO books (
    id, title, subtitle, slug, institution, years, author, language, description, 
    is_published, is_reference, created_at, updated_at
) VALUES (
    14,
    'خواطر من أعماق الروح',
    'رحلة في دهاليز النفس البشرية',
    'khawater-min-amaaq-alrouh',
    NULL,
    NULL,
    'مؤلف التأملات',
    'ar',
    'هذا الكتاب يحتوي على خواطر عميقة وتأملات صادقة من صفحات مذكرات شخصية',
    true,
    false,
    NOW(),
    NOW()
);

-- ==============================================
-- 2. TABLE THEMES (configuration visuelle)
-- ==============================================
INSERT INTO themes (
    book_id, primary_color, secondary_color, tertiary_color, 
    primary_light, secondary_light, tertiary_dark, 
    font_primary, font_secondary, created_at, updated_at
) VALUES (
    14,
    '#2c3e50',  -- Bleu foncé pour les titres
    '#e74c3c',  -- Rouge pour les accents
    '#f8f9fa',  -- Gris très clair pour les fonds
    '#34495e',  -- Bleu moyen
    '#c0392b',  -- Rouge foncé
    '#e9ecef',  -- Gris clair
    'Arial',
    'Arial',
    NOW(),
    NOW()
);

-- ==============================================
-- 3. TABLE BOOK_FEATURES (fonctionnalités)
-- ==============================================
INSERT INTO book_features (
    book_id, video_support, mobile_portrait_default, zoom_controls,
    progress_indicator, draggable_controls, flip_animation, responsive_design,
    created_at, updated_at
) VALUES (
    14, true, true, true, true, true, true, true, NOW(), NOW()
);

-- ==============================================
-- 4. TABLE BOOK_LAYOUTS (dimensions et animation)
-- ==============================================
INSERT INTO book_layouts (
    book_id, page_width, page_height, min_width, max_width,
    min_height, max_height, flip_duration, created_at, updated_at
) VALUES (
    14, 550, 733, 280, 900, 420, 1350, 1000, NOW(), NOW()
);

-- ==============================================
-- 5. TABLE BOOK_CONTENT_SETTINGS (configuration contenu)
-- ==============================================
INSERT INTO book_content_settings (
    book_id, show_sommaire, show_cover, show_end_page,
    auto_generate_sommaire, pack_output, created_at, updated_at
) VALUES (
    14, true, true, true, true, false, NOW(), NOW()
);

-- ==============================================
-- 6. TABLE PAGES (contenu des pages)
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

-- Page 4: CONTENU 2 - أسير السلطة (partie 2)
INSERT INTO pages (
    book_id, page_id, page_type, title, content, page_order, is_visible, metadata, created_at, updated_at
) VALUES (
    14, 'content-2', 'content', 'أسير السلطة (تتمة)',
    '<div class="ql-direction-rtl">
<p style="margin-bottom: 1.5rem; line-height: 1.8; font-size: 1.1rem;">
ثم، شيئاً فشيئاً، <strong style="color: #27ae60;">بدأت أرى ما كان غائباً عني</strong>. لم يكن وحياً إلهياً بل نتيجة حتمية لأخطاء متكررة وفشل ذريع في فهم <em style="color: #e74c3c;">اللعبة - لعبة السلطة</em> - التي تحكمها ثلاث حقائق:
</p>

<div style="background-color: #f8f9fa; border-radius: 10px; padding: 2rem; margin: 2rem 0;">
<h3 style="color: #2c3e50; margin-bottom: 1.5rem; text-align: center; border-bottom: 2px solid #3498db; padding-bottom: 0.5rem;">الحقائق الثلاث للسلطة</h3>

<div style="margin-bottom: 2rem; padding: 1.5rem; background-color: #fff; border-right: 4px solid #e74c3c; border-radius: 5px;">
<h4 style="color: #e74c3c; margin-bottom: 1rem;">🎭 الحقيقة الأولى: قانون الأقنعة</h4>
<p style="margin: 0; line-height: 1.6;">
السلطة لا تُمنح للأشخاص الأصليين، بل <strong>للممثلين الماهرين</strong>. من يستطيع أن يمثل دور "الموظف المثالي" أفضل من الآخرين، يفوز. الصدق والأصالة؟ مجرد عوائق.
</p>
</div>

<div style="margin-bottom: 2rem; padding: 1.5rem; background-color: #fff; border-right: 4px solid #f39c12; border-radius: 5px;">
<h4 style="color: #f39c12; margin-bottom: 1rem;">⚡ الحقيقة الثانية: قانون الطاقة المحدودة</h4>
<p style="margin: 0; line-height: 1.6;">
كل شخص لديه <strong>طاقة محدودة</strong> يومياً. إذا صرفتها في التمثيل والانبطاح والمجاملات، لن تبقى لديك طاقة للإبداع أو التطوير الحقيقي. النتيجة: تصبح آلة بلا روح.
</p>
</div>

<div style="margin-bottom: 2rem; padding: 1.5rem; background-color: #fff; border-right: 4px solid #8e44ad; border-radius: 5px;">
<h4 style="color: #8e44ad; margin-bottom: 1rem;">🔄 الحقيقة الثالثة: قانون التحول التدريجي</h4>
<p style="margin: 0; line-height: 1.6;">
<strong>أنت تصبح ما تمارسه يومياً</strong>. إذا مارست النفاق لثماني ساعات يومياً لسنوات، ستصبح منافقاً حتى في حياتك الشخصية. القناع يلتصق بالوجه إلى الأبد.
</p>
</div>
</div>

<div style="background-color: #d4edda; border: 1px solid #c3e6cb; border-radius: 8px; padding: 2rem; margin: 2rem 0;">
<h4 style="color: #155724; margin-bottom: 1rem; text-align: center;">💡 الخلاصة العملية</h4>
<p style="margin-bottom: 1rem; line-height: 1.6; color: #155724;">
السلطة ليست شيئاً تحصل عليه، بل شيء <strong>تدفع ثمنه</strong>. والثمن هو هويتك الحقيقية.
</p>
<p style="margin: 0; line-height: 1.6; color: #155724; font-style: italic;">
الأذكياء لا يلعبون هذه اللعبة. يخلقون لعبتهم الخاصة.
</p>
</div>

<p style="margin-bottom: 1.5rem; line-height: 1.8; color: #6c757d;">
عندما انتهيت من شرح هذا لصديقي، نظر إلى فنجان قهوته البارد وابتسم ابتسامة مريرة: <em>«يبدو أنني اخترت أن أكون أسيراً.»</em>
</p>

<div style="text-align: center; margin: 2rem 0; padding: 1.5rem; background-color: #f1f3f4; border-radius: 10px;">
<p style="margin: 0; font-size: 1.2rem; color: #5f6368; font-style: italic;">
وأنت... أي لعبة تلعب؟
</p>
</div>
</div>',
    4, true, '{}', NOW(), NOW()
);

-- Page 5: CONTENU 3 - درس الوقت
INSERT INTO pages (
    book_id, page_id, page_type, title, content, page_order, is_visible, metadata, created_at, updated_at
) VALUES (
    14, 'content-3', 'content', 'درس الوقت',
    '<div class="ql-direction-rtl">
<h1 style="color: #2c3e50; margin-bottom: 2rem; text-align: center;">الأحد، الخامس عشر من يونيو. أكتب بدون فلتر</h1>
<div style="text-align: center; margin: 2rem 0;">
[IMAGE: 3.jpeg | 40% | ]
</div>
<p style="margin-bottom: 1.5rem; line-height: 1.8;">
«<strong style="color: #e74c3c;">بابا، ليش دايما مشغول؟</strong>»
</p>
<p style="margin-bottom: 1.5rem; line-height: 1.8;">
السؤال جاء من ابنتي البالغة من العمر سبع سنوات، وأنا أتصفح هاتفي أثناء العشاء. نظرت إليها للحظة، ثم عدت لشاشتي: <em>«بابا يعمل عشان يأمّن لك حياة حلوة.»</em>
</p>
<div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 1.5rem; margin: 2rem 0;">
<p style="margin: 0; font-style: italic; color: #856404; text-align: center;">
الإجابة النموذجية للأب النموذجي. الكذبة التي نقولها لأنفسنا قبل أطفالنا.
</p>
</div>
<p style="margin-bottom: 1.5rem; line-height: 1.8;">
بعد أن أنهت عشاءها، جاءت وجلست بجانبي. وضعت يدها الصغيرة على ذراعي وقالت: <em>«بس أنا ما بدي حياة حلوة. بدي بابا يلعب معي.»</em>
</p>
<p style="margin-bottom: 1.5rem; line-height: 1.8; color: #e74c3c; font-weight: bold;">
هذه هي اللحظة التي أدركت فيها أنني أسرق من المستقبل لأدفع للحاضر.
</p>
<div style="background-color: #f8f9fa; border-radius: 10px; padding: 2rem; margin: 2rem 0; border-right: 5px solid #3498db;">
<p style="margin-bottom: 1rem; line-height: 1.6; font-size: 1.1rem;">
كم من الآباء يقضون سنوات في «تأمين المستقبل» بينما أطفالهم ينمون وحيدين في الحاضر؟
</p>
<p style="margin: 0; line-height: 1.6; font-style: italic; color: #6c757d;">
نحن نؤجل الحياة لنعيش... متى؟
</p>
</div>
<p style="margin-bottom: 1.5rem; line-height: 1.8;">
في تلك الليلة، بعد أن نامت، جلست أحسب كم ساعة أقضيها فعلياً معها يومياً. <strong style="color: #d63031;">النتيجة كانت صادمة: أقل من ساعة واحدة من الوقت "الحقيقي"</strong> - وقت بدون هاتف، بدون تلفزيون، بدون تشتت.
</p>
<div style="background-color: #d1ecf1; border-left: 4px solid #17a2b8; padding: 1.5rem; margin: 2rem 0;">
<h4 style="color: #0c5460; margin-bottom: 1rem;">📊 حساب مرعب:</h4>
<ul style="margin: 0; color: #0c5460; line-height: 1.6;">
<li>ساعات الاستيقاظ: 16 ساعة</li>
<li>ساعات العمل + المواصلات: 10 ساعات</li>
<li>الأكل + الاستحمام + المهام: 3 ساعات</li>
<li>وقت "الراحة" (هاتف + تلفزيون): 2 ساعة</li>
<li><strong>وقت حقيقي مع الطفل: 1 ساعة فقط!</strong></li>
</ul>
</div>
<p style="margin-bottom: 1.5rem; line-height: 1.8;">
اليوم التالي، قررت تجربة شيء مختلف. عندما عدت من العمل، أغلقت الهاتف تماماً. جلست معها على الأرض ولعبنا بالمكعبات. لم نبني شيئاً عظيماً، لكننا بنينا <em style="color: #27ae60;">ذكرى</em>.
</p>
<div style="background-color: #d4edda; border: 1px solid #c3e6cb; border-radius: 8px; padding: 2rem; margin: 2rem 0;">
<p style="margin-bottom: 1rem; line-height: 1.6; color: #155724; font-weight: bold;">
ما تعلمته من طفلة عمرها سبع سنوات:
</p>
<p style="margin: 0; line-height: 1.6; color: #155724;">
الوقت ليس شيئاً نملكه، بل شيء <strong>نختار كيف نقضيه</strong>. والأطفال لا يتذكرون كم أنفقت عليهم، بل كم أنفقت <em>معهم</em>.
</p>
</div>
<p style="margin-bottom: 1.5rem; line-height: 1.8; color: #6c757d; font-style: italic;">
في النهاية، عندما تكبر ابنتي، لن تتذكر أنني كنت أعمل من أجلها. ستتذكر فقط أنني كنت غائباً.
</p>
<div style="text-align: center; margin: 2rem 0; padding: 1.5rem; background-color: #f1f3f4; border-radius: 10px;">
<p style="margin: 0; font-size: 1.2rem; color: #5f6368; font-style: italic;">
هل نحن نعيش، أم ننتظر الحياة؟
</p>
</div>
</div>',
    5, true, '{}', NOW(), NOW()
);

-- Page 6: CONTENU 4 - الندم الذي لا يشفى
INSERT INTO pages (
    book_id, page_id, page_type, title, content, page_order, is_visible, metadata, created_at, updated_at
) VALUES (
    14, 'content-4', 'content', 'الندم الذي لا يشفى',
    '<div class="ql-direction-rtl">
<h1 style="color: #2c3e50; margin-bottom: 2rem; text-align: center;">السبت، 24 مايو، أكتب بدون فلتر</h1>
<div style="text-align: center; margin: 2rem 0;">
[IMAGE: 4.jpeg | 35% | ]
</div>
<p style="margin-bottom: 1.5rem; line-height: 1.8;">
اليوم، وأنا أمر بجانب محل الأحذية في السوق، <strong style="color: #e74c3c;">تذكرت أمي</strong>. تذكرت كيف كانت تشتكي دائماً من حذائها القديم، وكيف كنت أقول لها: <em>«ما شي وقتو دابا، غادي نشريو ليك واحد الزوج زوين قريب.»</em>
</p>
<div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 1.5rem; margin: 2rem 0;">
<p style="margin: 0; font-style: italic; color: #856404; text-align: center;">
"قريب" - الكلمة التي نستخدمها لنؤجل السعادة إلى غد لا يأتي أبداً.
</p>
</div>
<p style="margin-bottom: 1.5rem; line-height: 1.8;">
مرت السنوات، وأمي توفيت وهي ترتدي نفس الحذاء القديم. <strong style="color: #d63031;">دفنتها بحذاء جديد اشتريته من نفس المحل الذي مررت به اليوم</strong>. لكن... ما الفائدة؟
</p>
<p style="margin-bottom: 1.5rem; line-height: 1.8; font-size: 1.1rem;">
هل تعرف ما هو أقسى أنواع الندم؟ ليس الندم على ما فعلناه، بل الندم على <em style="color: #e74c3c;">ما لم نفعله</em> عندما كان الوقت متاحاً.
</p>
<div style="background-color: #f8f9fa; border-radius: 10px; padding: 2rem; margin: 2rem 0; border-right: 5px solid #e74c3c;">
<h3 style="color: #2c3e50; margin-bottom: 1.5rem; text-align: center;">💔 قائمة الندم الأبدي</h3>
<ul style="line-height: 1.8; color: #6c757d;">
<li><strong>الحذاء الجديد</strong> الذي أجّلته «لمناسبة خاصة» لم تأت</li>
<li><strong>الرحلة</strong> التي قلت عنها «العام القادم إن شاء الله»</li>
<li><strong>الكلمات الحلوة</strong> التي لم أقلها خجلاً أو انشغالاً</li>
<li><strong>العناق الطويل</strong> الذي استعجلت منه لأجيب على رسالة عمل</li>
<li><strong>جلسة القهوة</strong> التي أجّلتها لأنني كنت «مشغولاً»</li>
</ul>
</div>
<p style="margin-bottom: 1.5rem; line-height: 1.8;">
أمي كانت تحب الياسمين. كل مرة تمر بجانب نبتة ياسمين، تتوقف وتشم الرائحة وتبتسم. قالت لي مرة: <em>«نتا اشتري لي شي نبتة ياسمين للبيت.»</em>
</p>
<p style="margin-bottom: 1.5rem; line-height: 1.8;">
قلت لها: <em>«أوكي ماما، هاد الويك اند إن شاء الله.»</em> ثم نسيت. وفي الويك اند التالي كان لدي شيء «أهم». وهكذا مرت الشهور.
</p>
<div style="background-color: #d1ecf1; border-left: 4px solid #17a2b8; padding: 1.5rem; margin: 2rem 0;">
<p style="margin: 0; color: #0c5460; font-weight: bold; line-height: 1.6;">
اليوم، بيتنا مليء بنباتات الياسمين. كل ركن فيه نبتة. لكن... أمي لم تعد هنا لتشم رائحتها.
</p>
</div>
<p style="margin-bottom: 1.5rem; line-height: 1.8; color: #e74c3c; font-weight: bold;">
نحن نعيش وكأن لدينا وقتاً لا نهائياً، ونتصرف وكأن أحباءنا سيبقون إلى الأبد.
</p>
<div style="background-color: #d4edda; border: 1px solid #c3e6cb; border-radius: 8px; padding: 2rem; margin: 2rem 0;">
<h4 style="color: #155724; margin-bottom: 1rem;">💡 الدرس الذي تعلمته بعد فوات الأوان:</h4>
<p style="margin-bottom: 1rem; line-height: 1.6; color: #155724;">
<strong>الحب ليس مشاعر نحتفظ بها في القلب، بل أفعال نقوم بها في الحاضر.</strong>
</p>
<p style="margin: 0; line-height: 1.6; color: #155724; font-style: italic;">
والوقت المناسب لإظهار الحب هو... الآن. دائماً الآن.
</p>
</div>
<p style="margin-bottom: 1.5rem; line-height: 1.8; color: #6c757d;">
عندما أعود للبيت اليوم، سأعانق ابنتي عناقاً طويلاً. وسأشتري لها شيئاً صغيراً تحبه، ليس لمناسبة، بل لأنها <em>موجودة</em> في حياتي الآن.
</p>
<div style="text-align: center; margin: 2rem 0; padding: 1.5rem; background-color: #f1f3f4; border-radius: 10px;">
<p style="margin: 0; font-size: 1.2rem; color: #5f6368; font-style: italic;">
من تحب؟ ومتى ستخبره بذلك؟
</p>
</div>
</div>',
    6, true, '{}', NOW(), NOW()
);

-- Page 7: CONTENU 5 - مشاريع الذكاء الاصطناعي
INSERT INTO pages (
    book_id, page_id, page_type, title, content, page_order, is_visible, metadata, created_at, updated_at
) VALUES (
    14, 'content-5', 'content', 'مشاريع الذكاء الاصطناعي',
    '<div class="ql-direction-rtl">
<h1 style="color: #2c3e50; margin-bottom: 2rem; text-align: center; font-size: 1.8rem;">علاش المشاريع ديال الذكاء الاصطناعي، غالبا مكايصدقوش؟!</h1>
<div style="background-color: #e8f4fd; border: 1px solid #bee5eb; border-radius: 8px; padding: 1.5rem; margin: 2rem 0;">
<p style="margin: 0; font-style: italic; color: #0c5460; text-align: center;">
<strong>ملاحظة:</strong> هذا الجزء مكتوب بالدارجة المغربية لأنه كان نقاش حقيقي مع زميل مغربي في المقهى
</p>
</div>
<p style="margin-bottom: 1.5rem; line-height: 1.8;">
كنت جالس مع زميل في الشغل، مهندس ذكي بزاف، وكان يشتكي: <strong style="color: #e74c3c;">«واخا نبداو مشروع ديال AI، ولكن دايما كايفشل!»</strong>
</p>
<p style="margin-bottom: 1.5rem; line-height: 1.8;">
قلت ليه: <em>«شنو المشكل؟ التيكنولوجي صعيب؟»</em> جاوبني: <em>«لا، الكود مزيان. ولكن النتايج... مكايناش.»</em>
</p>
<div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 1.5rem; margin: 2rem 0;">
<p style="margin: 0; font-style: italic; color: #856404; text-align: center;">
وهنا بديت نفهم أن المشكل ماشي تقني، ولكن... نفسي!
</p>
</div>
<div style="background-color: #f8f9fa; border-radius: 10px; padding: 2rem; margin: 2rem 0; border-right: 5px solid #e74c3c;">
<h3 style="color: #2c3e50; margin-bottom: 1.5rem; text-align: center;">🧠 الأسباب الحقيقية لفشل مشاريع الذكاء الاصطناعي</h3>

<div style="margin-bottom: 1.5rem; padding: 1rem; background-color: #fff; border-radius: 5px;">
<h4 style="color: #d63031; margin-bottom: 0.5rem;">1️⃣ متلازمة "الحل السحري"</h4>
<p style="margin: 0; line-height: 1.6; color: #333;">
<strong>المشكل:</strong> الناس كايفكرو أن AI غادي يحل كلشي بوحدو، بلا ما يغيرو أي حاجة في العمليات ديالهم.
</p>
<p style="margin: 0.5rem 0 0 0; line-height: 1.6; color: #6c757d; font-style: italic;">
<strong>الواقع:</strong> AI هو مجرد أداة. بحال المطرقة، إذا ماعرفتيش كيفاش تستعملها، غادي تضرب صبعك!
</p>
</div>

<div style="margin-bottom: 1.5rem; padding: 1rem; background-color: #fff; border-radius: 5px;">
<h4 style="color: #f39c12; margin-bottom: 0.5rem;">2️⃣ بيانات خايبة = نتايج خايبة</h4>
<p style="margin: 0; line-height: 1.6; color: #333;">
<strong>المشكل:</strong> كايبداو المشروع بلا ما يتأكدو من جودة البيانات. "عندنا داطا بزاف!"
</p>
<p style="margin: 0.5rem 0 0 0; line-height: 1.6; color: #6c757d; font-style: italic;">
<strong>الواقع:</strong> البيانات الكثيرة والخايبة أسوأ من البيانات القليلة والمزيانة.
</p>
</div>

<div style="margin-bottom: 1.5rem; padding: 1rem; background-color: #fff; border-radius: 5px;">
<h4 style="color: #8e44ad; margin-bottom: 0.5rem;">3️⃣ التوقعات الجنونية</h4>
<p style="margin: 0; line-height: 1.6; color: #333;">
<strong>المشكل:</strong> "بغينا نظام كايتوقع المستقبل ب 99% دقة في شهر واحد!"
</p>
<p style="margin: 0.5rem 0 0 0; line-height: 1.6; color: #6c757d; font-style: italic;">
<strong>الواقع:</strong> حتى Google و Facebook مكاملوش النتايج ديالهم من أول مرة.
</p>
</div>
</div>

<p style="margin-bottom: 1.5rem; line-height: 1.8;">
قلت للزميل ديالي: <em>«شوف، AI ماشي سحر. هو بحال السيارة - إذا ماتعلمتيش تسوق، غادي تصطدم!»</em>
</p>

<div style="background-color: #d1ecf1; border-left: 4px solid #17a2b8; padding: 1.5rem; margin: 2rem 0;">
<h4 style="color: #0c5460; margin-bottom: 1rem;">🎯 الخطوات ديال النجاح:</h4>
<ol style="margin: 0; color: #0c5460; line-height: 1.6;">
<li><strong>ابدا صغير:</strong> ماتحاولش تحل كلشي دفعة واحدة</li>
<li><strong>نظف البيانات:</strong> شهر في تنظيف البيانات أحسن من 6 شهور في إصلاح النتايج</li>
<li><strong>جرب بزاف:</strong> كل فشل هو درس، ماشي نهاية العالم</li>
<li><strong>اشرك المستخدمين:</strong> مايمكنش تبني شي حاجة بلا ما تعرف شنو بغاو الناس</li>
</ol>
</div>

<p style="margin-bottom: 1.5rem; line-height: 1.8;">
في الأخير، زميلي فهم أن المشكل ماشي تقني، ولكن في الطريقة ديال التفكير. <strong style="color: #27ae60;">دابا مشروعو كايشتغل مزيان!</strong>
</p>

<div style="background-color: #d4edda; border: 1px solid #c3e6cb; border-radius: 8px; padding: 2rem; margin: 2rem 0;">
<h4 style="color: #155724; margin-bottom: 1rem; text-align: center;">💡 الخلاصة بالمغربية:</h4>
<p style="margin: 0; line-height: 1.6; color: #155724; font-weight: bold; text-align: center;">
AI ماشي مشكل تقني، ولكن مشكل إدارة وتوقعات!
</p>
</div>

<div style="text-align: center; margin: 2rem 0; padding: 1.5rem; background-color: #f1f3f4; border-radius: 10px;">
<p style="margin: 0; font-size: 1.2rem; color: #5f6368; font-style: italic;">
واش نتا كاتجرب AI ولا كاتخاف منو؟ 🤖
</p>
</div>
</div>',
    7, true, '{}', NOW(), NOW()
);

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
-- 7. TABLE MEDIA (fichiers images)
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

-- ==============================================
-- VALIDATION ET FINALISATION
-- ==============================================

-- Vérifier que toutes les insertions ont réussi
DO $$
BEGIN
    -- Vérifier le livre
    IF NOT EXISTS (SELECT 1 FROM books WHERE id = 14) THEN
        RAISE EXCEPTION 'Erreur: Le livre #14 n''a pas été inséré correctement';
    END IF;
    
    -- Vérifier les pages (doit y en avoir 8)
    IF (SELECT COUNT(*) FROM pages WHERE book_id = 14) != 8 THEN
        RAISE EXCEPTION 'Erreur: Le nombre de pages du livre #14 est incorrect';
    END IF;
    
    -- Vérifier les médias (doit y en avoir 3)
    IF (SELECT COUNT(*) FROM media WHERE book_id = 14) != 3 THEN
        RAISE EXCEPTION 'Erreur: Le nombre de médias du livre #14 est incorrect';
    END IF;
    
    RAISE NOTICE 'Livre #14 inséré avec succès!';
END $$;

-- Confirmer la transaction
COMMIT;

-- ==============================================
-- STATISTIQUES POST-INSERTION
-- ==============================================
-- Afficher un résumé de l'insertion
SELECT 
    'LIVRE #14 - INSERTION COMPLÈTE' AS status,
    (SELECT title FROM books WHERE id = 14) AS titre,
    (SELECT COUNT(*) FROM pages WHERE book_id = 14) AS nombre_pages,
    (SELECT COUNT(*) FROM media WHERE book_id = 14) AS nombre_medias,
    (SELECT language FROM books WHERE id = 14) AS langue;