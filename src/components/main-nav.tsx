
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShieldAlert, Users, User as UserIcon, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useState, useEffect } from "react";

const links = [
  { href: "/accueil", label: "Accueil", icon: Home },
  { href: "/mes-alertes", label: "Mes alertes", icon: ShieldAlert },
  { href: "/communaute", label: "Communauté", icon: Users },
  { href: "/profil", label: "Profil", icon: UserIcon },
];

export function MainNav() {
  const pathname = usePathname();
  const { user } = useUser();
  const firestore = useFirestore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userProfile } = useDoc(userDocRef);

  const isAdmin = mounted && userProfile?.role === 'admin';

  return (
    <nav className="flex justify-around items-center h-20">
      {links.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            "flex flex-col items-center space-y-1 text-muted-foreground hover:text-primary",
            pathname === href && "text-foreground"
          )}
        >
          <Icon className="h-6 w-6" />
          <span className="text-xs font-bold">{label}</span>
        </Link>
      ))}
      {isAdmin && (
        <Link
          href="/admin"
          className={cn(
            "flex flex-col items-center space-y-1 text-muted-foreground hover:text-primary",
            pathname === "/admin" && "text-foreground"
          )}
        >
          <Shield className="h-6 w-6" />
          <span className="text-xs font-bold">Admin</span>
        </Link>
      )}
    </nav>
  );
}
