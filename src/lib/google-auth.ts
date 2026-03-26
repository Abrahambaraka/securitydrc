'use client';
import { Auth, User, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

export interface GoogleSignInResult {
  user: User;
  isNewUser: boolean;
}

/**
 * Gère la connexion Google de manière simplifiée et robuste.
 */
export async function handleGoogleSignIn(auth: Auth): Promise<GoogleSignInResult> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const firestore = getFirestore(auth.app);
    const userRef = doc(firestore, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    
    const isNewUser = !userDoc.exists();

    if (isNewUser) {
      const [firstName, ...lastNameParts] = (user.displayName || "").split(" ");
      const lastName = lastNameParts.join(" ");
      
      const adminEmail = atob('Y29udGFjdEBtYXN0ZXJraXMuY29t');
      const userRole = user.email === adminEmail ? 'admin' : 'resident';

      // Création d'un profil minimaliste
      await setDoc(userRef, {
        id: user.uid,
        role: userRole,
        signInProvider: 'google.com',
        createdAt: new Date().toISOString(),
        verifiedEmail: user.emailVerified,
        identity: {
          firstName: firstName || "",
          lastName: lastName || "",
          profilePictureUrl: user.photoURL || `https://api.dicebear.com/8.x/initials/svg?seed=${user.uid}`,
          gender: "",
          nationality: "Congolaise",
        },
        contact: {
          email: user.email || "",
        },
        address: {
          country: "RDC",
          city: "", // Vide pour forcer la redirection vers /profil/modifier
        },
        preferences: {
          preferredLanguage: "Français",
          notificationsEnabled: true,
          preferredCommunication: "Application",
        }
      });
    }

    return { user, isNewUser };

  } catch (error: any) {
    console.error("Erreur de connexion Google:", error);

    // Extraction du domaine actuel pour aider l'utilisateur
    const currentDomain = typeof window !== 'undefined' ? window.location.hostname : 'votre domaine';

    if (error.code === 'auth/unauthorized-domain') {
      throw new Error(`Ce domaine (${currentDomain}) n'est pas autorisé dans votre console Firebase. Allez dans 'Authentication' > 'Settings' > 'Authorized domains' et ajoutez : ${currentDomain}`);
    }

    switch (error.code) {
      case 'auth/popup-blocked':
        throw new Error('Le popup de connexion a été bloqué. Veuillez autoriser les popups.');
      case 'auth/popup-closed-by-user':
        throw new Error('Vous avez fermé la fenêtre de connexion.');
      default:
        throw new Error(error.message || 'Une erreur est survenue lors de la connexion Google.');
    }
  }
}
