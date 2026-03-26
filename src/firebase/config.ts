import { firebaseConfig as devConfig } from './firebase.dev';
import { firebaseConfig as prodConfig } from './firebase.prod';

const isProd = process.env.NODE_ENV === 'production';

/**
 * Sélectionne automatiquement la configuration en fonction de l'environnement d'exécution.
 * En développement (npm run dev), utilise les clés de test.
 * En production (déploiement final), utilise les clés de production.
 */
export const firebaseConfig = isProd ? prodConfig : devConfig;
