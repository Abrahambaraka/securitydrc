
'use client';

import { useState, useEffect } from 'react';
import FlagShader from '@/components/FlagShader';
import AmbientSound from '@/components/AmbientSound';
import StatsSection from '@/components/StatsSection';
import { requestNotifications } from '@/lib/notifications';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ShieldCheck, Bell } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative min-h-screen bg-black text-white overflow-x-hidden">
      {/* Background Shader Container - Stable structure */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="w-full h-full">
          {mounted && (
            <AnimatePresence>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                transition={{ duration: 2 }}
                className="w-full h-full"
              >
                <FlagShader />
              </motion.div>
            </AnimatePresence>
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/80" />
      </div>

      {/* Theme Toggle Button Container - Stable structure */}
      <div className="absolute top-6 right-6 z-20 min-h-[40px] min-w-[40px]">
        {mounted && (
          <ThemeToggle className="bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 border border-white/10" />
        )}
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        <main className="min-h-screen flex flex-col items-center justify-center text-center px-6">
          <div className={`transition-all duration-1000 ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            <ShieldCheck className="h-20 w-20 sm:h-24 sm:w-24 text-primary mx-auto mb-6 drop-shadow-[0_0_15px_rgba(var(--primary),0.5)]" />
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black mb-4 drop-shadow-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-primary/80">
              QuartierSecure
            </h1>
            <p className="text-xl sm:text-2xl text-primary font-bold mb-6 drop-shadow">
              Votre bouclier communautaire
            </p>
            <p className="max-w-3xl mx-auto text-gray-300 mb-10 text-lg leading-relaxed font-light">
              Face à l'insécurité, l'union fait la force. QuartierSecure est une plateforme citoyenne et collaborative conçue pour la RDC. Signalez les incidents en temps réel et protégez vos proches.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/connexion"
                className="w-full sm:w-auto inline-block bg-primary hover:bg-primary/90 text-black font-bold text-xl py-4 px-12 rounded-full transition-all hover:scale-105 shadow-[0_0_20px_rgba(var(--primary),0.3)] active:scale-95"
              >
                Rejoindre la communauté
              </Link>
              <button
                onClick={requestNotifications}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white font-bold text-lg py-4 px-8 rounded-full transition-all border border-white/10 backdrop-blur-sm active:scale-95"
              >
                <Bell size={20} className="animate-pulse" /> Activer les alertes
              </button>
            </div>
          </div>
        </main>
        
        <div className="min-h-[200px]">
          {mounted && <StatsSection />}
        </div>

        <footer className="text-center py-12 text-gray-500 text-sm border-t border-white/5 bg-black/40 backdrop-blur-md">
          © 2026 QuartierSecure – Protégeons nos quartiers ensemble
        </footer>
      </div>

      {/* Dynamic elements deferred after mounting */}
      {mounted && <AmbientSound />}
    </div>
  );
}
