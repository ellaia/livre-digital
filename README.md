# 📚 Guide d'Utilisation - Livre Digital

Guide complet pour créer et publier vos livres digitaux interactifs avec effet flip-book.

---

## 🚀 **INSTALLATION ET DÉMARRAGE**

### Prérequis
- Node.js 16+
- PostgreSQL 12+

### Installation en 4 étapes
```bash
# 1. Installation des dépendances
npm install

# 2. Configuration de la base de données
cp .env.example .env
# Éditer .env avec vos paramètres PostgreSQL

# 3. Initialisation complète
npm run setup-db

# 4. Lancement du serveur
npm run editor
```

✅ **Accès :** http://localhost:3000  
🔐 **Connexion :** admin / admin123

---

## 📖 **CRÉER VOTRE PREMIER LIVRE DIGITAL**

### Étape 1 : Informations du livre

Dans l'onglet **📚 Informations** :

1. **Titre principal** : Le nom de votre livre
2. **Sous-titre** : Description ou période couverte
3. **Institution** : Votre organisation
4. **Auteur** : Nom de l'auteur ou du service
5. **Années** : Période couverte (ex: "1960-2025")
6. **Description** : Résumé du contenu
7. **Image de couverture** : Logo ou image principale

**💡 Conseil :** Remplissez tous les champs pour un livre professionnel.

### Étape 2 : Personnalisation du thème

Dans l'onglet **🎨 Thème** :

#### **Section "Thème général"**
- **Couleur principale** : Couleur de base (titres, bordures)
- **Couleur d'accent** : Couleur secondaire (boutons, liens)
- **Couleur de fond** : Couleur de fond des pages
- **Police** : Choisir entre Poppins, Arial, etc.

#### **Aperçu en temps réel**
Les couleurs se mettent à jour automatiquement dans l'aperçu à droite.

#### **Thèmes avancés (optionnel)**
- **Pages COVER** : Thème personnalisé pour la couverture
- **Pages FIN** : Thème personnalisé pour la page de fin

**💡 Conseil :** Utilisez les couleurs de votre charte graphique.

### Étape 3 : Ajout de médias

Dans l'onglet **🎬 Médias** :

1. **Téléchargement** : Cliquer "Choisir un fichier"
2. **Formats supportés** :
   - Images : JPG, PNG, GIF
   - Vidéos : MP4, WebM
3. **Aperçu** : Vérifier que les médias s'affichent correctement

**💡 Conseil :** Optimisez vos images (< 2 MB) pour un chargement rapide.

### Étape 4 : Création des pages

Dans l'onglet **📄 Pages** :

#### **Types de pages disponibles**
- **cover** : Page de couverture
- **sommaire** : Table des matières (générée automatiquement)
- **content** : Pages de contenu principal
- **end** : Page de fin/remerciements

#### **Création d'une page**

1. **Cliquer "Nouvelle Page"**
2. **Remplir le formulaire** :
   - Type : content
   - Titre : "Histoire de l'entreprise"
   - Ordre : 3
3. **Écrire le contenu** avec l'éditeur Quill

#### **Utilisation de l'éditeur**

L'éditeur Quill offre :
- **Formatage** : Gras, italique, souligné
- **Titres** : H1, H2, H3 pour structurer
- **Listes** : Puces et numérotées
- **Alignement** : Gauche, centre, droite, justifié
- **Couleurs** : Texte et arrière-plan

#### **Insertion de médias**

**Pour une image :**
```
[IMAGE: nom-fichier.jpg | 80% | Description de l'image]
```

**Pour une vidéo :**
```
[VIDEO: nom-fichier.mp4 | 70% | Description de la vidéo]
```

**Syntaxe :**
- `nom-fichier` : Nom exact du fichier téléchargé
- `%` : Taille d'affichage (50%, 80%, 100%)
- `Description` : Texte alternatif

**💡 Conseil :** Copiez les références depuis l'onglet Médias pour éviter les erreurs.

### Étape 5 : Configuration avancée

Dans l'onglet **⚙️ Paramètres** :

#### **Fonctionnalités**
- ✅ **Support vidéo** : Lecture des vidéos intégrées
- ✅ **Portrait mobile** : Orientation forcée sur mobile
- ✅ **Contrôles de zoom** : Zoom livre et texte
- ✅ **Indicateur de progression** : Barre de progression
- ✅ **Contrôles déplaçables** : Panneau mobile
- ✅ **Animation de flip** : Effet de tournage de page

#### **Mise en page**
- **Largeur/Hauteur** : Dimensions des pages
- **Limites** : Tailles min/max pour responsive
- **Durée d'animation** : Vitesse du flip (1000ms par défaut)

#### **Contenu**
- ✅ **Afficher sommaire** : Table des matières
- ✅ **Afficher couverture** : Page de garde
- ✅ **Afficher page de fin** : Page de clôture
- ✅ **Génération auto sommaire** : Liens automatiques

### Étape 6 : Génération et test

1. **Sauvegarder** toutes les modifications
2. **Générer le livre** : Bouton "Générer Livre Digital"
3. **Télécharger** le fichier HTML généré
4. **Tester** en ouvrant le fichier dans un navigateur

---

## 🎯 **CONSEILS POUR UN LIVRE RÉUSSI**

### Structure recommandée

1. **Page de Couverture** (cover)
   - Logo/image principale
   - Titre et sous-titre
   - Dates/période
   - Institution

2. **Sommaire** (sommaire)
   - Généré automatiquement
   - Liens vers toutes les pages

3. **Pages de contenu** (content)
   - Histoire de l'organisation
   - Événements marquants
   - Services/activités
   - Témoignages/personnalités
   - Projets/réalisations

4. **Page de fin** (end)
   - Remerciements
   - Contacts
   - Mentions légales

### Bonnes pratiques de contenu

#### **Titres et structure**
- **H1** : Un seul titre principal par page
- **H2** : Sections principales
- **H3** : Sous-sections
- Hiérarchie logique et lisible

#### **Texte**
- **Paragraphes courts** : Maximum 4-5 lignes
- **Listes** : Pour énumérer des points
- **Gras/Italique** : Pour mettre en valeur
- **Justification** : Pour un aspect professionnel

#### **Médias**
- **Images** : JPG pour photos, PNG pour logos
- **Taille** : 50-80% pour la lisibilité
- **Description** : Toujours renseigner l'alt text
- **Qualité** : Privilégier la netteté

#### **Vidéos**
- **Format** : MP4 recommandé
- **Durée** : Maximum 2-3 minutes par vidéo
- **Taille** : 60-70% pour un bon compromis
- **Contenu** : Interviews, présentations, témoignages

---

## 🎨 **PERSONNALISATION AVANCÉE**

### Couleurs et identité visuelle

#### **Couleurs d'entreprise**
Utilisez votre charte graphique :
- **Couleur principale** : Couleur dominante de votre logo
- **Couleur d'accent** : Couleur complémentaire
- **Couleur de fond** : Teinte claire assortie

#### **Exemples de palettes**
```
💼 Corporatif :
- Principal : #2c3e50 (bleu foncé)
- Accent : #3498db (bleu)
- Fond : #ecf0f1 (gris clair)

🏛️ Institutionnel :
- Principal : #2c5530 (vert foncé)
- Accent : #7CB342 (vert)
- Fond : #E8F5E8 (vert clair)

🎓 Éducatif :
- Principal : #8e44ad (violet)
- Accent : #e74c3c (rouge)
- Fond : #f8f9fa (blanc cassé)
```

### Thèmes spécialisés

#### **Thème COVER personnalisé**
Pour une couverture distincte :
1. ✅ Activer "Utiliser un thème personnalisé"
2. Choisir des couleurs contrastées
3. Police différente si nécessaire

#### **Thème FIN personnalisé**
Pour une page de fin élégante :
1. ✅ Activer "Utiliser un thème personnalisé"  
2. Couleurs plus sobres
3. Centrage du contenu

---

## 📱 **OPTIMISATION MOBILE**

### Configuration mobile

Dans **⚙️ Paramètres** :
- ✅ **Portrait par défaut** : Force l'orientation
- ✅ **Contrôles déplaçables** : Interface adaptable
- ✅ **Design responsive** : Adaptation automatique

### Bonnes pratiques mobile

- **Texte** : Taille lisible (éviter le trop petit)
- **Images** : Pas trop larges (80% maximum)
- **Vidéos** : Courtes et optimisées
- **Navigation** : Utiliser les contrôles tactiles

---

## 🔄 **WORKFLOW DE PRODUCTION**

### Phase 1 : Préparation
1. Collecter le contenu (textes, images, vidéos)
2. Définir la structure du livre
3. Préparer la charte graphique
4. Optimiser les médias

### Phase 2 : Création
1. Configurer les informations du livre
2. Personnaliser le thème
3. Télécharger les médias
4. Créer les pages de contenu
5. Vérifier la structure

### Phase 3 : Finalisation
1. Tester sur différents appareils
2. Vérifier tous les liens et médias
3. Générer la version finale
4. Livrer ou publier

---

## 🔧 **DÉPANNAGE**

### Problèmes courants

#### **Images qui ne s'affichent pas**
- Vérifier le nom du fichier exact
- S'assurer que l'image est téléchargée
- Utiliser la syntaxe : `[IMAGE: nom.jpg | 80% | Description]`

#### **Vidéos qui ne se lisent pas**
- Format MP4 recommandé
- Taille de fichier < 50 MB
- Vérifier la syntaxe : `[VIDEO: nom.mp4 | 70% | Description]`

#### **Couleurs qui ne s'appliquent pas**
- Sauvegarder le thème avant de générer
- Vider le cache du navigateur
- Régénérer le livre

#### **Pages dans le mauvais ordre**
- Vérifier les numéros d'ordre dans chaque page
- Commencer par 1 pour la couverture
- Incrémenter de 1 pour chaque page

### Support technique

En cas de problème persistant :
1. Vérifier les logs de la console navigateur (F12)
2. Examiner les erreurs dans la console serveur
3. Vérifier la configuration de la base de données
4. Redémarrer le serveur si nécessaire

---

## 📊 **LIVRE DE RÉFÉRENCE INCLUS**

Un livre d'exemple "LIVRE DIGITAL CNRA (REFERENCE)" est automatiquement créé lors de l'installation. Il contient :

- ✅ **6 pages complètes** avec contenu formaté
- ✅ **Thème professionnel** vert institutionnel
- ✅ **Médias d'exemple** (logo, image historique)
- ✅ **Structure recommandée** à reproduire

**💡 Utilisez-le comme modèle** pour vos propres livres !

---

**🎉 Votre livre digital est maintenant prêt à impressionner vos lecteurs !**

*Pour toute question, consultez la documentation technique ou contactez l'équipe de développement.*