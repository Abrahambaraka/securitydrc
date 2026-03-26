'use client';

import { useUser, useFirestore, useDoc, useMemoFirebase, useCollection } from '@/firebase';
import { doc, collection, setDoc, deleteDoc, query, orderBy, where, limit } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Loader2, Shield, Trash2, UserX, Gem, Search } from 'lucide-react';

export default function AdminPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Debounce search term
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms delay

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm]);

  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userDocRef);
  
  const usersQueryRef = useMemoFirebase(() => {
    if (!firestore || userProfile?.role !== 'admin') return null;
    
    const searchTermNormalized = debouncedSearchTerm.trim();
    
    if (searchTermNormalized) {
        return query(
            collection(firestore, 'users'),
            orderBy('contact.email'),
            where('contact.email', '>=', searchTermNormalized),
            where('contact.email', '<=', searchTermNormalized + '\uf8ff'),
            limit(50)
        );
    }

    return query(collection(firestore, 'users'), orderBy('createdAt', 'desc'), limit(50));
  }, [firestore, userProfile, debouncedSearchTerm]);

  const { data: users, isLoading: areUsersLoading } = useCollection(usersQueryRef);

  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const toggleAdminRole = async (targetUser: any) => {
    if (!firestore || !user) return;
    setIsUpdating(targetUser.id);
    const targetUserRef = doc(firestore, 'users', targetUser.id);
    const newRole = targetUser.role === 'admin' ? 'resident' : 'admin';
    try {
      await setDoc(targetUserRef, { role: newRole }, { merge: true });
    } catch (error) {
      console.error("Failed to update role:", error);
      alert("Erreur: Impossible de changer le rôle de l'utilisateur.");
    } finally {
      setIsUpdating(null);
    }
  };

  const deleteUserDocument = async (targetUserId: string) => {
    if (!firestore) return;
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible et supprimera ses données de profil, mais pas son compte d'authentification.")) {
      return;
    }
    setIsUpdating(targetUserId);
    const targetUserRef = doc(firestore, 'users', targetUserId);
    try {
      await deleteDoc(targetUserRef);
    } catch (error) {
      console.error("Failed to delete user document:", error);
      alert("Erreur: Impossible de supprimer le profil de l'utilisateur.");
    } finally {
      setIsUpdating(null);
    }
  };


  const isLoading = isUserLoading || isProfileLoading;
  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (userProfile?.role !== 'admin') {
    return (
      <div className="flex flex-col h-full items-center justify-center p-8 text-center">
        <UserX className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold">Accès refusé</h1>
        <p className="text-muted-foreground mt-2">Vous n'avez pas les autorisations nécessaires pour accéder à cette page.</p>
        <button onClick={() => router.push('/accueil')} className="mt-6 bg-primary text-primary-foreground font-bold py-2 px-6 rounded-lg">
          Retour à l'accueil
        </button>
      </div>
    );
  }
  
  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Panneau d'administration</h1>
          <p className="text-muted-foreground">Gestion des utilisateurs de la plateforme.</p>
        </div>
      </div>

       <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Rechercher par email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-card rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary border"
        />
      </div>
      
      {areUsersLoading && !users ? (
        <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="bg-card rounded-lg border">
          <div className="p-4 flex items-center justify-between border-b">
            <h2 className="text-lg font-semibold">Utilisateurs</h2>
            <p className="text-sm text-muted-foreground">Affichage des derniers inscrits ou des résultats de recherche.</p>
          </div>
          {users && users.length > 0 ? (
            <ul className="divide-y">
                {users.map(u => (
                  <li key={u.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{u.identity?.firstName} {u.identity?.lastName}</p>
                        {u.signInProvider === 'password' && <Gem className="h-4 w-4 text-primary" />}
                        {u.signInProvider === 'google.com' && <Gem className="h-4 w-4 text-info" />}
                      </div>
                      <p className="text-sm text-muted-foreground">{u.contact?.email}</p>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${u.role === 'admin' ? 'bg-primary/20 text-primary' : 'bg-muted'}`}>
                        {u.role}
                      </span>
                    </div>
                    <div className="flex gap-2 self-end sm:self-center">
                      <button 
                        onClick={() => toggleAdminRole(u)} 
                        disabled={isUpdating === u.id || user?.uid === u.id}
                        className="p-2 rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Changer le rôle admin"
                      >
                        {isUpdating === u.id ? <Loader2 className="h-5 w-5 animate-spin"/> : <Shield className="h-5 w-5" />}
                      </button>
                      <button 
                        onClick={() => deleteUserDocument(u.id)}
                        disabled={isUpdating === u.id || user?.uid === u.id}
                        className="p-2 rounded-md hover:bg-destructive/20 text-destructive disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Supprimer l'utilisateur"
                      >
                         {isUpdating === u.id ? <Loader2 className="h-5 w-5 animate-spin"/> : <Trash2 className="h-5 w-5" />}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
          ) : (
            <p className="text-center text-muted-foreground p-8">
              {debouncedSearchTerm
                ? `Aucun utilisateur trouvé pour "${debouncedSearchTerm}"`
                : "Aucun utilisateur trouvé."
              }
            </p>
          )}
        </div>
      )}
    </div>
  );
}
