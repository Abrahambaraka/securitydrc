'use client';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy, doc, deleteDoc } from 'firebase/firestore';
import { Loader2, Trash2, Home, User as UserIcon, AlertTriangle, PersonStanding, Flame } from 'lucide-react';
import TimeAgo from '@/components/TimeAgo';
import { useState } from 'react';

const alertTypes = ['Vol', 'Agression', 'Cambriolage', 'Activité Suspecte', 'Disparition', 'Incendie', 'Autre'] as const;
type AlertType = typeof alertTypes[number];

const alertIcons: { [key in AlertType]: React.ElementType } = {
  'Vol': UserIcon,
  'Agression': PersonStanding,
  'Cambriolage': Home,
  'Activité Suspecte': AlertTriangle,
  'Disparition': UserIcon,
  'Incendie': Flame,
  'Autre': AlertTriangle,
};

export default function MesAlertesPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const userAlertsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'alerts'), where('userId', '==', user.uid), orderBy('creationDate', 'desc'));
  }, [firestore, user]);

  const { data: alerts, isLoading } = useCollection(userAlertsQuery);

  const handleDelete = async (alertId: string) => {
    if (!firestore) return;
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette alerte ?")) {
      setDeletingId(alertId);
      try {
        await deleteDoc(doc(firestore, 'alerts', alertId));
      } catch (error) {
        console.error("Erreur lors de la suppression de l'alerte:", error);
        alert("Une erreur s'est produite.");
      } finally {
        setDeletingId(null);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!alerts || alerts.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <AlertTriangle className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-xl font-bold">Aucune alerte trouvée</h1>
        <p className="text-muted-foreground mt-2">Vous n'avez pas encore créé d'alerte.</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <ul className="space-y-4">
        {alerts.map(alert => {
          const Icon = alertIcons[alert.alertType as AlertType] || AlertTriangle;
          return (
            <li key={alert.id} className="bg-card border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                  <span className="font-bold">{alert.alertType}</span>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${alert.status === 'En cours' ? 'bg-destructive/20 text-destructive' : 'bg-green-600/20 text-green-500'}`}>
                  {alert.status}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{alert.location}</p>
              <p className="my-2">{alert.description}</p>
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                <span>
                  <TimeAgo dateString={alert.creationDate ? new Date(alert.creationDate.seconds * 1000).toISOString() : undefined} fallback="À l'instant" />
                </span>
                <button 
                  onClick={() => handleDelete(alert.id)}
                  disabled={deletingId === alert.id}
                  className="p-2 rounded-md hover:bg-destructive/20 text-destructive disabled:opacity-50"
                  aria-label="Supprimer l'alerte"
                >
                  {deletingId === alert.id ? <Loader2 className="h-5 w-5 animate-spin" /> : <Trash2 className="h-5 w-5" />}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
