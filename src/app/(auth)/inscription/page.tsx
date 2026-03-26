'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/firebase';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { ShieldCheck, Loader2, Mail, KeyRound, User as UserIcon, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function InscriptionPage() {
  const router = useRouter();
  const auth = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      setIsLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const firestore = getFirestore(auth.app);
      const userRef = doc(firestore, 'users', user.uid);

      const adminEmail = atob('Y29udGFjdEBtYXN0ZXJraXMuY29t');
      const userRole = email === adminEmail ? 'admin' : 'resident';

      await setDoc(userRef, {
        id: user.uid,
        role: userRole,
        signInProvider: 'password',
        createdAt: new Date().toISOString(),
        verifiedPhone: false,
        verifiedEmail: user.emailVerified,
        identity: {
          firstName: firstName,
          lastName: lastName,
          gender: "",
          birthDate: "",
          profilePictureUrl: "",
          nationality: "Congolaise",
          pseudo: "",
          description: ""
        },
        address: {
          country: "RDC",
          city: "",
          municipality: "",
          quartier: "",
          street: "",
          plotNumber: "",
          postalCode: "",
          gpsPosition: null
        },
        civilStatus: {
          maritalStatus: "",
          spouseName: "",
          childrenCount: 0,
          childrenNames: []
        },
        education: {
          level: "",
          field: "",
          currentJob: "",
          employer: "",
          experienceYears: 0,
          skills: []
        },
        contact: {
          phone: "",
          email: user.email || ""
        },
        community: {
          housingType: "",
          isNeighborhoodAssociationMember: false,
          associationName: "",
          residenceBadgeNumber: "",
          emergencyContactName: "",
          emergencyContactPhone: "",
          housePictureUrl: "",
          validatedByChief: false
        },
        preferences: {
          preferredLanguage: "Français",
          notificationsEnabled: true,
          preferredCommunication: "Application",
          wantsToJoinGroup: false
        }
      });

      router.push('/profil/modifier');
    } catch (e: any) {
      console.error(e);
      if (e.code === 'auth/email-already-in-use') {
        setError('Cette adresse email est déjà utilisée.');
      } else {
        setError('Une erreur est survenue lors de l\'inscription.');
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 rounded-lg bg-card border text-card-foreground">
      <ShieldCheck className="h-16 w-16 text-primary mb-4" />
      <h1 className="text-2xl font-bold mb-2">Créer un compte</h1>
      <p className="text-muted-foreground mb-6">Rejoignez la communauté QuartierSecure.</p>

      <form onSubmit={handleSignUp} className="w-full space-y-4">
        <div className="flex gap-4">
          <div className="relative w-1/2">
            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Prénom"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="w-full bg-background rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary border"
            />
          </div>
          <div className="relative w-1/2">
            <input
              type="text"
              placeholder="Nom"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="w-full bg-background rounded-lg pl-4 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary border"
            />
          </div>
        </div>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-background rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary border"
          />
        </div>
        <div className="relative">
          <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full bg-background rounded-lg pl-10 pr-10 py-3 focus:outline-none focus:ring-2 focus:ring-primary border"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3"
            aria-label={showPassword ? "Cacher le mot de passe" : "Afficher le mot de passe"}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5 text-muted-foreground" />
            ) : (
              <Eye className="h-5 w-5 text-muted-foreground" />
            )}
          </button>
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-3 transition-colors disabled:opacity-50"
        >
          {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
          S'inscrire et continuer
        </button>
      </form>

      {error && <p className="text-destructive mt-4 text-sm">{error}</p>}
      
      <p className="mt-8 text-sm text-muted-foreground">
        Déjà un compte ?{' '}
        <Link href="/connexion" className="font-semibold text-primary hover:underline">
          Connectez-vous
        </Link>
      </p>
    </div>
  );
}
