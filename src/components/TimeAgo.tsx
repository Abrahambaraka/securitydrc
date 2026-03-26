'use client';

import { useState, useEffect } from 'react';

function timeAgo(dateString: string): string {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 5) {
      return "à l'instant";
    }

    let interval = seconds / 31536000;
    if (interval > 1) {
      const years = Math.floor(interval);
      return `il y a ${years} an${years > 1 ? 's' : ''}`;
    }
    interval = seconds / 2592000;
    if (interval > 1) {
      return "il y a " + Math.floor(interval) + " mois";
    }
    interval = seconds / 86400;
    if (interval > 1) {
      const days = Math.floor(interval);
      return `il y a ${days} jour${days > 1 ? 's' : ''}`;
    }
    interval = seconds / 3600;
    if (interval > 1) {
      return "il y a " + Math.floor(interval) + " h";
    }
    interval = seconds / 60;
    if (interval > 1) {
      return "il y a " + Math.floor(interval) + " min";
    }
    return "il y a " + Math.floor(seconds) + " s";
}

interface TimeAgoProps {
  dateString: string | undefined | null;
  fallback?: string;
}

export default function TimeAgo({ dateString, fallback = '' }: TimeAgoProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!dateString) {
    return <>{fallback}</>;
  }
  
  if (!isClient) {
    return <>{fallback}</>;
  }

  return <>{timeAgo(dateString)}</>;
}
