"use client";
import { Search, Siren, Home, MapPin, Phone, User, AlertTriangle, Loader2, PlusCircle, PersonStanding, Flame } from 'lucide-react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useState, useMemo } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase, useCollection } from '@/firebase';
import { collection, addDoc, query, orderBy, limit, serverTimestamp, doc } from 'firebase/firestore';
import Image from 'next/image';
import TimeAgo from '@/components/TimeAgo';

const alertTypes = ['Vol', 'Agression', 'Cambriolage', 'Activité Suspecte', 'Disparition', 'Incendie', 'Autre'] as const;
type AlertType = typeof alertTypes[number];

const alertIcons: { [key in AlertType]: React.ElementType } = {
  'Vol': User,
  'Agression': PersonStanding,
  'Cambriolage': Home,
  'Activité Suspecte': AlertTriangle,
  'Disparition': User,
  'Incendie': Flame,
  'Autre': AlertTriangle,
};

function CreateAlertModal() {
    const { user } = useUser();
    const firestore = useFirestore();
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [alertType, setAlertType] = useState<AlertType>('Activité Suspecte');
    const [description, setDescription] = useState('');
    
    const userDocRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, 'users', user.uid);
    }, [user, firestore]);
    const { data: userProfile } = useDoc(userDocRef);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !userProfile || !firestore) {
            setError("Vous devez être connecté et avoir un profil complet.");
            return;
        }
        setIsLoading(true);
        setError(null);

        try {
            await addDoc(collection(firestore, 'alerts'), {
                userId: user.uid,
                userPseudo: userProfile.identity.pseudo || `${userProfile.identity.firstName} ${userProfile.identity.lastName}`,
                userProfilePictureUrl: userProfile.identity.profilePictureUrl || `https://api.dicebear.com/8.x/initials/svg?seed=${userProfile.identity.firstName} ${userProfile.identity.lastName}`,
                alertType,
                description,
                location: `${userProfile.address.quartier}, ${userProfile.address.municipality}`,
                creationDate: serverTimestamp(),
                status: 'En cours',
            });
            setIsOpen(false);
            setDescription('');
        } catch (err) {
            console.error(err);
            setError("Une erreur est survenue lors de la création de l'alerte.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-4 rounded-lg text-base transition-colors flex items-center justify-center gap-2">
                    <PlusCircle className="h-5 w-5" />
                    Lancer une alerte
                </button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Lancer une nouvelle alerte</DialogTitle>
                    <DialogDescription>
                        Décrivez l'incident. Ces informations seront visibles par la communauté.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="alertType" className="block text-sm font-medium text-muted-foreground mb-1">Type d'alerte</label>
                        <select
                            id="alertType"
                            value={alertType}
                            onChange={(e) => setAlertType(e.target.value as AlertType)}
                            className="w-full bg-card border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            {alertTypes.map(type => <option key={type} value={type}>{type}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-muted-foreground mb-1">Description</label>
                        <textarea
                            id="description"
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Donnez des détails sur l'incident..."
                            required
                            className="w-full bg-card border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                    {error && <p className="text-destructive text-sm">{error}</p>}
                    <DialogFooter>
                        <button type="button" onClick={() => setIsOpen(false)} className="bg-muted text-muted-foreground font-bold py-2 px-4 rounded-lg">
                            Annuler
                        </button>
                        <button type="submit" disabled={isLoading} className="bg-primary text-primary-foreground font-bold py-2 px-4 rounded-lg flex items-center gap-2 disabled:opacity-50">
                            {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
                            Envoyer
                        </button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function LatestAlertsFeed() {
    const firestore = useFirestore();

    const alertsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'alerts'), orderBy('creationDate', 'desc'), limit(10));
    }, [firestore]);

    const { data: alerts, isLoading } = useCollection(alertsQuery);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }
    
    if (!alerts || alerts.length === 0) {
        return <p className="text-muted-foreground text-center p-4">Aucune alerte pour le moment.</p>
    }

    return (
        <div className="bg-card rounded-2xl border divide-y">
            {alerts.map(alert => {
                const Icon = alertIcons[alert.alertType as AlertType] || AlertTriangle;
                return (
                    <div key={alert.id} className="p-4 flex items-start gap-4">
                        <Image
                            src={alert.userProfilePictureUrl}
                            alt={alert.userPseudo}
                            width={40}
                            height={40}
                            className="rounded-full bg-muted object-cover w-10 h-10"
                        />
                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <p className="font-semibold">{alert.userPseudo}</p>
                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${alert.status === 'En cours' ? 'bg-destructive/20 text-destructive' : 'bg-green-600/20 text-green-500'}`}>
                                    {alert.status}
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground">{alert.location}</p>
                            <div className="flex items-center gap-2 mt-2">
                                <Icon className="h-5 w-5 text-muted-foreground" />
                                <span className="font-medium">{alert.alertType}</span>
                            </div>
                            <p className="mt-1 text-sm">{alert.description}</p>
                            <p className="text-xs text-muted-foreground text-right mt-2">
                                <TimeAgo dateString={alert.creationDate ? new Date(alert.creationDate.seconds * 1000).toISOString() : undefined} fallback="" />
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default function HomePage() {
  return (
    <div className="p-4 space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Rechercher une alerte, un voisin..."
          className="w-full bg-card rounded-full pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary border"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-4 text-center">
          <Link href="#" className="flex flex-col items-center space-y-2 text-foreground hover:text-primary transition-colors">
              <div className="bg-card p-3 rounded-xl w-16 h-16 flex items-center justify-center">
                  <Siren className="h-6 w-6 text-primary" />
              </div>
              <span className="text-xs font-medium">Police</span>
          </Link>
          <Link href="/communaute" className="flex flex-col items-center space-y-2 text-foreground hover:text-primary transition-colors">
              <div className="bg-card p-3 rounded-xl w-16 h-16 flex items-center justify-center">
                  <Home className="h-6 w-6" />
              </div>
              <span className="text-xs font-medium">Voisinage</span>
          </Link>
          <Link href="/ma-position" className="flex flex-col items-center space-y-2 text-foreground hover:text-primary transition-colors">
              <div className="bg-card p-3 rounded-xl w-16 h-16 flex items-center justify-center">
                  <MapPin className="h-6 w-6" />
              </div>
              <span className="text-xs font-medium">Ma position</span>
          </Link>
          <Link href="#" className="flex flex-col items-center space-y-2 text-foreground hover:text-primary transition-colors">
              <div className="bg-card p-3 rounded-xl w-16 h-16 flex items-center justify-center">
                  <Phone className="h-6 w-6" />
              </div>
              <span className="text-xs font-medium">Appel direct</span>
          </Link>
      </div>

      {/* Main Alert Card */}
      <div className="bg-card rounded-2xl p-5 border">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-destructive/20 p-3 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div>
                <h2 className="text-lg font-bold text-foreground">Protégez votre quartier</h2>
                <p className="text-muted-foreground text-sm">envoyez une alerte en cas de danger</p>
            </div>
          </div>
          <CreateAlertModal />
      </div>

      {/* Latest Alerts */}
      <div>
        <h3 className="text-lg font-bold mb-4">Dernières alertes</h3>
        <LatestAlertsFeed />
      </div>
    </div>
  );
}
