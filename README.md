# QuartierSecure

**Votre bouclier communautaire.**

## 🎯 Objectif

QuartierSecure est une plateforme citoyenne et collaborative conçue pour la République Démocratique du Congo. Face à l'insécurité, l'union fait la force. Notre mission est de permettre aux résidents de signaler des incidents en temps réel, d'alerter leurs voisins et de se coordonner pour créer un environnement plus sûr pour tous.

## ✨ Fonctionnalités Principales

- **Authentification Sécurisée** : Inscription et connexion via e-mail/mot de passe ou compte Google.
- **Profil Utilisateur Complet** : Un formulaire en plusieurs étapes guide les utilisateurs pour compléter leur profil, incluant identité, adresse, profession, et plus encore.
- **Gestion de la Photo de Profil** : Téléversement et suppression de la photo de profil.
- **Système d'Alerte en Temps Réel** : Les utilisateurs peuvent créer des alertes (vol, agression, etc.) qui apparaissent instantanément dans un fil d'actualité pour la communauté.
- **Voisinage Intelligent** : Affiche les membres de la communauté qui vivent dans le même quartier, favorisant les liens sociaux et la reconnaissance mutuelle.
- **Panneau d'Administration** : Une interface sécurisée pour les administrateurs pour gérer les utilisateurs et leur assigner des rôles.
- **Géolocalisation** : Affiche la position actuelle de l'utilisateur sur une carte, une information cruciale en cas d'urgence.
- **Interface Moderne** : Une expérience utilisateur propre, responsive, avec un mode sombre.

## 🛠️ Stack Technique

- **Framework Frontend** : [Next.js](https://nextjs.org/) (avec App Router)
- **Base de Données & Authentification** : [Firebase](https://firebase.google.com/) (Firestore, Authentication)
- **Styling** : [Tailwind CSS](https://tailwindcss.com/)
- **Composants UI** : [Shadcn/ui](https://ui.shadcn.com/)
- **Icônes** : [Lucide React](https://lucide.dev/)
- **Déploiement** : Prêt pour des plateformes comme Vercel ou Firebase Hosting.

## 🚀 Démarrage Rapide (Développement Local)

1.  **Cloner le projet**
    ```bash
    git clone <votre-repo-url>
    cd <nom-du-projet>
    ```

2.  **Installer les dépendances**
    ```bash
    npm install
    ```

3.  **Lancer le serveur de développement**
    ```bash
    npm run dev
    ```

4.  Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

### ⚠️ Configuration Firebase Importante

Pour que la **connexion avec Google fonctionne en local**, vous devez autoriser le domaine `localhost` dans votre configuration Firebase.

1.  Allez dans la [Console Firebase](https://console.firebase.google.com/).
2.  Sélectionnez votre projet.
3.  Allez dans `Authentication` > `Settings` > `Authorized domains`.
4.  Cliquez sur `Add domain` et ajoutez `localhost`.

De plus, assurez-vous que `http://localhost` et `http://localhost:3000` sont ajoutés aux "Origines JavaScript autorisées" dans les paramètres de votre "ID client OAuth 2.0" sur la [Console Google Cloud](https://console.cloud.google.com/apis/credentials).

## 🔮 Prochaines Étapes Possibles

- **Firebase Storage** : Migrer le stockage des photos de profil de Firestore vers Firebase Storage pour de meilleures performances.
- **Notifications Push** : Envoyer des notifications lorsqu'une alerte est postée dans le quartier d'un utilisateur.
- **Validation des Profils** : Mettre en place un système où un chef de quartier peut valider les profils des résidents.
- **Forum Communautaire** : Créer une page de forum pour les discussions générales.
