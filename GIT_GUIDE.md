# Guide pour Pousser votre Code sur GitHub

Vous avez rencontré une erreur car vous essayiez d'envoyer des fichiers trop volumineux (`node_modules`) sur GitHub.

La solution consiste à dire à Git d'ignorer ce dossier (ce qui a été fait en ajoutant le fichier `.gitignore`), puis de "nettoyer" votre historique local avant de l'envoyer.

## Étapes à suivre dans votre terminal

Veuillez exécuter ces commandes **exactement comme écrit, une par une**.

### Étape 1 : Annuler les anciens commits locaux

Cette commande prépare vos changements pour un nouveau "commit" propre. Elle n'efface pas votre code.

```bash
git reset origin/main
```

### Étape 2 : Préparer tous vos fichiers pour le nouveau commit

Le `.` signifie "tous les fichiers". Git lira le `.gitignore` et exclura automatiquement `node_modules`.

```bash
git add .
```

### Étape 3 : Créer le nouveau commit propre

Ceci regroupe tous vos changements dans un paquet unique et propre.

```bash
git commit -m "Commit propre pour le push initial sur GitHub"
```

### Étape 4 : Pousser votre application sur GitHub

C'est l'étape finale. Comme le commit est propre, GitHub l'acceptera.

```bash
git push origin main
```

---

Après avoir suivi ces étapes, toute votre application (sauf les fichiers volontairement ignorés comme `node_modules`) sera sur GitHub.
