'use client';

import { useGeolocation } from '@/hooks/use-geolocation';
import { Loader2, MapPin, AlertTriangle } from 'lucide-react';

export default function Map() {
  const { isLoading, coordinates, error } = useGeolocation();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground">Récupération de votre position...</p>
      </div>
    );
  }

  if (error) {
    let errorMessage = "Une erreur est survenue lors de la récupération de votre position.";
    if (error.code === 1) { // PERMISSION_DENIED
        errorMessage = "L'accès à votre position a été refusé. Veuillez l'autoriser dans les paramètres de votre navigateur.";
    } else if (error.code === 2) { // POSITION_UNAVAILABLE
        errorMessage = "Votre position n'a pas pu être déterminée.";
    } else if (error.code === 3) { // TIMEOUT
        errorMessage = "La demande de géolocalisation a expiré.";
    }

    return (
      <div className="p-4 rounded-lg bg-destructive/10 text-destructive flex flex-col items-center gap-4 text-center">
        <AlertTriangle className="h-10 w-10" />
        <h3 className="font-bold">Erreur de géolocalisation</h3>
        <p className="text-sm">{errorMessage}</p>
      </div>
    );
  }

  if (coordinates) {
    return (
      <div className="space-y-4">
        <div className="p-6 bg-card rounded-lg border text-center">
            <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-bold">Votre position actuelle</h3>
            <p className="text-muted-foreground">Ces coordonnées peuvent être partagées en cas d'urgence.</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-card rounded-lg border">
                <p className="text-sm font-medium text-muted-foreground">Latitude</p>
                <p className="text-lg font-bold truncate">{coordinates.lat.toFixed(6)}</p>
            </div>
            <div className="p-4 bg-card rounded-lg border">
                <p className="text-sm font-medium text-muted-foreground">Longitude</p>
                <p className="text-lg font-bold truncate">{coordinates.lng.toFixed(6)}</p>
            </div>
        </div>
        <div className="aspect-video bg-muted rounded-lg overflow-hidden border">
            <iframe
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${coordinates.lng-0.01}%2C${coordinates.lat-0.01}%2C${coordinates.lng+0.01}%2C${coordinates.lat+0.01}&layer=mapnik&marker=${coordinates.lat}%2C${coordinates.lng}`}>
            </iframe>
        </div>
      </div>
    );
  }

  return null; // Should not be reached
}
