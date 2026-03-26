'use client';
import { useState } from 'react';
import { useAuth } from '@/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { ShieldCheck, Loader2, Mail } from 'lucide-react';
import Link from 'next/link';

export default function MotDePasseOubliePage() {
  const auth = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [email, setEmail] = useState('');

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess("Un email de réinitialisation a été envoyé à votre adresse.");
    } catch (e: any) {
      if (e.code === 'auth/user-not-found' || e.code === 'auth/invalid-email') {
        setError("Aucun utilisateur trouvé avec cette adresse email.");
      } else {
        setError("Une erreur est survenue.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 rounded-lg bg-card border text-card-foreground">
      <ShieldCheck className="h-16 w-16 text-primary mb-4" />
      <h1 className="text-2xl font-bold mb-2">Mot de passe oublié</h1>
      <p className="text-muted-foreground mb-6">Recevez un lien pour réinitialiser votre mot de passe.</p>

      {success ? (
        <p className="text-green-600 dark:text-green-500 text-center">{success}</p>
      ) : (
        <form onSubmit={handlePasswordReset} className="w-full space-y-4">
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
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-3 transition-colors disabled:opacity-50"
          >
            {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
            Envoyer le lien
          </button>
        </form>
      )}

      {error && <p className="text-destructive mt-4 text-sm">{error}</p>}
      
      <p className="mt-8 text-sm text-muted-foreground">
        <Link href="/connexion" className="font-semibold text-primary hover:underline">
          Retour à la connexion
        </Link>
      </p>
    </div>
  );
}
