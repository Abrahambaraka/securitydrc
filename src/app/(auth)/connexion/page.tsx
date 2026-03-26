'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { handleGoogleSignIn } from '@/lib/google-auth';
import { ShieldCheck, Loader2, Mail, KeyRound, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function ConnexionPage() {
  const router = useRouter();
  const auth = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/accueil');
    } catch (e: any) {
      if (e.code === 'auth/user-not-found' || e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential') {
        setError('Email ou mot de passe incorrect.');
      } else {
        setError('Une erreur est survenue lors de la connexion.');
      }
      setIsLoading(false);
    }
  };

  const onGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setError(null);
    try {
      const { isNewUser } = await handleGoogleSignIn(auth);
      if (isNewUser) {
        router.push('/profil/modifier');
      } else {
        router.push('/accueil');
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 rounded-lg bg-card border text-card-foreground">
      <ShieldCheck className="h-16 w-16 text-primary mb-4" />
      <h1 className="text-2xl font-bold mb-2">Connexion</h1>
      <p className="text-muted-foreground mb-6">Accédez à votre espace QuartierSecure.</p>

      <form onSubmit={handleLogin} className="w-full space-y-4">
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
          Se connecter
        </button>
      </form>
      
      <div className="text-right w-full mt-2">
        <Link href="/mot-de-passe-oublie" className="text-sm text-muted-foreground hover:text-primary">
          Mot de passe oublié ?
        </Link>
      </div>

      <div className="relative my-6 w-full">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">Ou continuez avec</span>
        </div>
      </div>

      <button
        onClick={onGoogleSignIn}
        disabled={isGoogleLoading}
        className="w-full bg-background border hover:bg-muted/50 text-foreground font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-3 transition-colors disabled:opacity-50"
      >
        {isGoogleLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <svg className="h-5 w-5" version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" >
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
            <path fill="none" d="M0 0h48v48H0z"></path>
          </svg>
        )}
        Google
      </button>

      {error && <p className="text-destructive mt-4 text-sm">{error}</p>}
      
      <p className="mt-8 text-sm text-muted-foreground">
        Pas encore de compte ?{' '}
        <Link href="/inscription" className="font-semibold text-primary hover:underline">
          Créez-en un
        </Link>
      </p>
    </div>
  );
}
