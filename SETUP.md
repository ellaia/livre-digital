# 📚 **INSTALLATION RAPIDE - LIVRE DIGITAL MINIMAL**

## ✅ **PRÉREQUIS (déjà installés)**
- ✅ Node.js 16+ 
- ✅ PostgreSQL 12+

---

## 🚀 **INSTALLATION EN 5 ÉTAPES**

### **ÉTAPE 1 : Installation des dépendances**
```bash
cd livre-digital-minimal
npm install
```

### **ÉTAPE 2 : Configuration**
```bash
# Copier et éditer le fichier de configuration
cp .env.example .env
nano .env
```

**Modifier dans `.env` :**
- `DB_PASSWORD=` → Votre mot de passe PostgreSQL
- `SESSION_SECRET=` → Clé aléatoire de 32+ caractères

### **ÉTAPE 3 : Initialisation base de données**
```bash
npm run setup-db
```
**Cette étape va :**
- Créer la base de données et toutes les tables
- Créer l'utilisateur admin (admin/admin123)  
- **🎉 Créer un livre de référence "LIVRE DIGITAL CNRA"** avec :
  - 6 pages complètes (cover, sommaire, histoire, services, contact, end)
  - Thème vert CNRA personnalisé
  - 2 médias d'exemple
  - Contenu prêt à l'emploi

### **ÉTAPE 4 : Lancement**
```bash
npm run editor
```

### **ÉTAPE 5 : Accès et test**
```
http://localhost:3000
```
**Connexion :** admin / admin123

---

## 🎯 **LIVRE DE RÉFÉRENCE INCLUS**

### **📖 "LIVRE DIGITAL CNRA (REFERENCE)"**
Un livre complet créé automatiquement pour vous servir de modèle :

**📄 Structure (6 pages) :**
1. **Page de Couverture** - Logo, titre, dates
2. **Sommaire** - Table des matières automatique  
3. **Histoire de la CNRA** - Texte formaté + image historique
4. **Nos Services** - Liste services + vidéo de présentation
5. **Nous Contacter** - Coordonnées complètes
6. **Page de Fin** - Remerciements et contacts

**✨ Contenu professionnel :**
- HTML structuré avec balises `<h1>`, `<h2>`, `<h3>`
- Listes `<ul>` et `<li>` pour les énumérations
- Paragraphes `<p>` avec sauts de ligne appropriés
- Mise en forme typographique (gras, italique)
- Images et vidéos intégrées avec pourcentages

**🎨 Thème personnalisé :**
- Couleurs CNRA (vert institutionnel)
- Police Poppins
- Style professionnel

**🎬 Médias inclus :**
- `logo-cnra.png` - Logo officiel
- `batiment-historique.jpg` - Photo du premier siège

**💡 Utilisation :**
- **Consultez-le** pour comprendre les fonctionnalités
- **Dupliquez-le** pour créer vos propres livres
- **Modifiez-le** selon vos besoins

---

## 📁 **FICHIERS INCLUS (essentiels uniquement)**

```
livre-digital-minimal/
├── 📄 package.json                 # Dépendances
├── 📄 .env.example                 # Configuration à copier
├── 🔧 editor-server.js            # Serveur principal
├── 📄 editor-enhanced.html         # Interface d'édition
├── 🔧 generator-rtl-from-scratch.js # Générateur
├── 📁 database/
│   ├── db.js                       # Connexion PostgreSQL
│   ├── schema-migration.sql        # Structure complète DB
│   ├── setup-complete.js           # Initialisation + livre ref
│   └── create-reference-book.js    # Script création livre CNRA
├── 📁 auth/ → auth.js              # Authentification
├── 📁 models/ → Book.js            # Modèle principal
├── 📁 views/ → 3 fichiers HTML     # Interfaces utilisateur
├── 📁 templates/ → template RTL    # Template de génération
├── 📁 public/quill/                # Éditeur Quill
└── 📁 gabarit/ → styles de base    # CSS/JS de base
```

**Total : 20 fichiers essentiels** + **1 livre de référence automatique**

---

## 🛠️ **COMMANDES DISPONIBLES**

```bash
npm run editor              # Démarrer le serveur
npm run setup-db           # Initialiser DB + livre de référence
```

---

## 🎉 **DÉMARRAGE RAPIDE**

```bash
# Installation complète en 4 commandes
cd livre-digital-minimal
npm install
cp .env.example .env && nano .env
npm run setup-db
npm run editor

# Puis ouvrir http://localhost:3000
# Login: admin / admin123
```

**🎯 Votre livre de référence vous attend dans la liste !**

---

## ✅ **VALIDATION**

- [ ] `npm install` → succès
- [ ] `.env` configuré  
- [ ] `npm run setup-db` → base créée + livre de référence
- [ ] `npm run editor` → serveur démarré
- [ ] `http://localhost:3000` → accessible
- [ ] Login admin/admin123 → connexion OK
- [ ] **Livre "CNRA (REFERENCE)" visible dans la liste**

**🎉 Système opérationnel avec contenu de démonstration !**