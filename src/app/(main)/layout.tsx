
"use client";

import Link from 'next/link';
import { Bell, Loader2 } from 'lucide-react';
import { MainNav } from '@/components/main-nav';
import { ThemeToggle } from '@/components/theme-toggle';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc } from 'firebase/firestore';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const firestore = useFirestore();
  const [isReady, setIsReady] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userDocRef);

  useEffect(() => {
    if (!mounted || isUserLoading) return;

    if (!user) {
      router.replace('/connexion');
      return;
    }

    if (isProfileLoading) return;

    const isModifierPage = pathname === '/profil/modifier';
    const profileIncomplete = !userProfile || !userProfile.identity?.gender || !userProfile.address?.city;
    
    if (profileIncomplete && !isModifierPage) {
      router.replace('/profil/modifier');
    } else {
      setIsReady(true);
    }
  }, [mounted, user, userProfile, isUserLoading, isProfileLoading, router, pathname]);

  // Stable titles to avoid hydration mismatch
  const getPageTitle = () => {
    if (!mounted) return "QuartierSecure";
    
    const pageTitles: { [key: string]: string } = {
      '/accueil': "Tableau de bord",
      '/profil': "Mon Profil",
      '/profil/modifier': "Modifier le Profil",
      '/mes-alertes': "Mes Alertes",
      '/communaute': "Communauté",
      '/admin': "Administration",
      '/ma-position': "Ma Position",
    };
    
    return pathname ? (pageTitles[pathname] || "QuartierSecure") : "QuartierSecure";
  };

  const isLoading = !mounted || isUserLoading || (user && isProfileLoading) || (!isReady && pathname !== '/profil/modifier');
  
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-t-2 border-primary animate-spin"></div>
            <Loader2 className="h-8 w-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <p className="text-sm text-muted-foreground font-medium tracking-widest uppercase animate-pulse">
            Sécurisation...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-full max-w-md mx-auto bg-background text-foreground shadow-2xl overflow-hidden">
      <header className="relative flex items-center justify-between p-4 border-b bg-card/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="w-10"></div>
        <h1 className="text-xl font-bold text-center tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
          {getPageTitle()}
        </h1>
        <div className="flex items-center gap-2">
          <Link href="/mes-alertes" className="hover:text-primary transition-colors p-2 rounded-full hover:bg-muted">
            <Bell className="h-5 w-5" />
          </Link>
          <div className="min-w-[40px]">
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto scrollbar-hide bg-gradient-to-b from-background to-muted/20">
        {children}
      </main>
      <footer className="sticky bottom-0 bg-background/90 backdrop-blur-lg border-t z-50">
        <MainNav />
      </footer>
    </div>
  );
}
