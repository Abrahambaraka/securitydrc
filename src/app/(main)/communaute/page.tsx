'use client';
import { useUser, useDoc, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit, where, doc } from 'firebase/firestore';
import { Loader2, Search, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function CommunautePage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Get current user's profile to know their location
  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);
  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userDocRef);

  // Debounce search term
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms delay

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm]);


  const usersQuery = useMemoFirebase(() => {
    if (!firestore || !userProfile?.address?.quartier) return null;

    // Base filters for neighborhood
    const neighborhoodFilters = [
        where('address.city', '==', userProfile.address.city),
        where('address.municipality', '==', userProfile.address.municipality),
        where('address.quartier', '==', userProfile.address.quartier)
    ];

    const searchTermNormalized = debouncedSearchTerm.trim();
    
    if (searchTermNormalized) {
      // Search query within the neighborhood
      return query(
        collection(firestore, 'users'), 
        ...neighborhoodFilters,
        orderBy('identity.pseudo'),
        where('identity.pseudo', '>=', searchTermNormalized),
        where('identity.pseudo', '<=', searchTermNormalized + '\uf8ff'),
        limit(25)
      );
    } else {
      // Default query: show the 25 most recently created users in the neighborhood
      return query(
        collection(firestore, 'users'),
        ...neighborhoodFilters,
        orderBy('createdAt', 'desc'),
        limit(25)
      );
    }
  }, [firestore, userProfile, debouncedSearchTerm]);

  const { data: users, isLoading: areUsersLoading } = useCollection(usersQuery);

  const showLoader = isProfileLoading || (areUsersLoading && !users);

  const renderContent = () => {
    if (showLoader) {
      return (
        <div className="flex justify-center items-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    // Handle case where user profile has no address
    if (!userProfile?.address?.quartier) {
      return (
        <div className="flex h-full flex-col items-center justify-center p-8 text-center">
            <Users className="h-16 w-16 text-muted-foreground mb-4" />
            <h1 className="text-xl font-bold">Veuillez compléter votre profil</h1>
            <p className="text-muted-foreground mt-2 mb-6">Pour voir vos voisins, vous devez d'abord renseigner votre quartier.</p>
            <Link
                href="/profil/modifier"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2 px-6 rounded-lg"
            >
                Compléter le Profil
            </Link>
        </div>
      );
    }
    
    const neighbors = users?.filter(u => u.id !== user?.uid);

    if (!neighbors || neighbors.length === 0) {
      return (
        <p className="text-center text-muted-foreground pt-8">
          {debouncedSearchTerm
            ? `Aucun voisin trouvé pour "@${debouncedSearchTerm}"`
            : "Aucun membre dans votre quartier pour le moment. Soyez le premier !"
          }
        </p>
      );
    }

    return (
      <ul className="space-y-3">
        {neighbors.map(neighbor => (
          <li key={neighbor.id} className="bg-card border rounded-lg p-4 flex items-center gap-4">
            <Image
              src={neighbor.identity?.profilePictureUrl || `https://api.dicebear.com/8.x/initials/svg?seed=${neighbor.identity?.firstName || ''} ${neighbor.identity?.lastName || ''}`}
              alt={`Profil de ${neighbor.identity?.firstName || 'Utilisateur'}`}
              width={48}
              height={48}
              className="rounded-full bg-muted object-cover h-12 w-12"
            />
            <div className="flex-1">
              <p className="font-bold text-foreground">{neighbor.identity?.firstName} {neighbor.identity?.lastName}</p>
              {neighbor.identity?.pseudo && <p className="text-sm text-primary">@{neighbor.identity.pseudo}</p>}
              <p className="text-xs text-muted-foreground mt-1">{neighbor.address?.quartier}, {neighbor.address?.municipality}</p>
            </div>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mon Voisinage</h1>
        <p className="text-muted-foreground">Membres de votre quartier : <span className="font-bold text-primary">{userProfile?.address?.quartier || '...'}</span></p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Rechercher un voisin par pseudo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-card rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary border"
        />
      </div>
      
      {renderContent()}

    </div>
  );
}
