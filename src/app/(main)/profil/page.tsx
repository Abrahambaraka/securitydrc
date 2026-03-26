'use client';

import { useUser, useFirestore, useDoc, useMemoFirebase, useAuth } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Loader2, Edit, LogOut, AlertCircle, CheckCircle, Shield, User, Map, BookUser, Briefcase, Phone, Users2, Gem, UploadCloud, Image as ImageIcon, Cog, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';

// Component for a section of the profile
const ProfileSection = ({ title, icon: Icon, children }: { title: string, icon: React.ElementType, children: React.ReactNode }) => (
    <div className="bg-card rounded-lg border">
        <div className="p-4 flex items-center gap-3 border-b">
            <Icon className="h-6 w-6 text-primary" />
            <h3 className="font-semibold text-lg">{title}</h3>
        </div>
        <dl className="p-4">{children}</dl>
    </div>
);

// Component for a single field in a profile section
const PreviewField = ({ label, value, isImage = false }: { label: string, value: any, isImage?: boolean }) => {
  const displayValue = value || <span className="text-muted-foreground/60">Non renseigné</span>;
  return (
    <div className="flex flex-col py-3 border-b last:border-b-0 gap-1">
      <div className="flex justify-between items-center">
        <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
        {!isImage && <dd className="text-sm text-right">{displayValue}</dd>}
      </div>
      {isImage && value && typeof value === 'string' && value.startsWith('data:image') && (
          <div className="relative w-full aspect-video rounded-lg overflow-hidden border mt-1 shadow-sm bg-muted/20">
              <Image src={value} alt={label} fill className="object-cover" />
          </div>
      )}
      {isImage && !value && <dd className="text-sm text-right text-muted-foreground/60">Non renseignée</dd>}
    </div>
  );
};

export default function ProfilViewPage() {
  const { user, isUserLoading: isAuthLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  
  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isClient, setIsClient] = useState(false);

  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userDocRef);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Reset preview state when the dialog closes
    if (!isPhotoDialogOpen) {
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  }, [isPhotoDialogOpen]);

  const handleSignOut = async () => {
    if (auth) {
        await auth.signOut();
        router.push('/connexion');
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB limit
        alert("L'image est trop grande. Veuillez choisir un fichier de moins de 1 Mo.");
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSavePhoto = async () => {
    if (!selectedFile || !userDocRef || !previewUrl) return;

    setIsUploading(true);
    try {
      await updateDoc(userDocRef, {
        "identity.profilePictureUrl": previewUrl
      });
      setIsPhotoDialogOpen(false);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde de la photo:", error);
      alert("Une erreur est survenue lors de la sauvegarde de la photo.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!userDocRef) return;
    setIsRemoving(true);
    try {
      await updateDoc(userDocRef, {
        "identity.profilePictureUrl": ""
      });
      setIsPhotoDialogOpen(false);
    } catch (error) {
      console.error("Erreur lors de la suppression de la photo:", error);
      alert("Une erreur est survenue lors de la suppression de la photo.");
    } finally {
      setIsRemoving(false);
    }
  };


  const isLoading = isAuthLoading || isProfileLoading;
  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!userProfile) {
    return (
        <div className="flex h-full flex-col items-center justify-center p-8 text-center">
            <p className="mb-4">Profil introuvable. Veuillez le compléter.</p>
            <Link
                href="/profil/modifier"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2 px-6 rounded-lg"
            >
                Compléter le Profil
            </Link>
        </div>
    );
  }

  const profileIncomplete = !userProfile.identity?.gender || !userProfile.address?.city;
  const { identity, address, civilStatus, education, contact, community, preferences, role, signInProvider } = userProfile;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col items-center text-center space-y-3">
        <Dialog open={isPhotoDialogOpen} onOpenChange={setIsPhotoDialogOpen}>
          <DialogTrigger asChild>
            <div className="relative group cursor-pointer">
              <Image 
                src={identity?.profilePictureUrl || `https://api.dicebear.com/8.x/initials/svg?seed=${identity?.firstName || ''} ${identity?.lastName || ''}`} 
                alt="Photo de profil"
                width={96}
                height={96}
                className="w-24 h-24 rounded-full border-4 border-card shadow-lg object-cover bg-muted"
              />
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Edit className="h-8 w-8 text-white" />
              </div>
            </div>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Changer la photo de profil</DialogTitle>
              <DialogDescription>
                Choisissez une image depuis votre appareil. Fichiers de moins de 1Mo.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center justify-center gap-4 py-4">
              <div className="w-40 h-40 rounded-full border-2 border-dashed flex items-center justify-center bg-muted overflow-hidden">
                {previewUrl ? (
                  <Image src={previewUrl} alt="Aperçu" width={160} height={160} className="w-full h-full object-cover" />
                ) : identity?.profilePictureUrl ? (
                  <Image src={identity.profilePictureUrl} alt="Photo actuelle" width={160} height={160} className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="h-16 w-16 text-muted-foreground" />
                )}
              </div>
              <input type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} className="hidden" />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                <UploadCloud className="h-5 w-5" />
                Choisir une image
              </button>
            </div>
            <DialogFooter className="flex-col sm:flex-row sm:justify-between w-full">
              <button 
                onClick={handleRemovePhoto} 
                disabled={isUploading || isRemoving || !identity?.profilePictureUrl}
                className="bg-destructive/10 hover:bg-destructive/20 text-destructive font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
                aria-label="Supprimer la photo"
              >
                {isRemoving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Trash2 className="h-5 w-5" />}
              </button>
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                <button onClick={() => setIsPhotoDialogOpen(false)} className="bg-muted hover:bg-muted/80 text-muted-foreground font-bold py-2 px-4 rounded-lg">
                    Annuler
                </button>
                <button 
                    onClick={handleSavePhoto} 
                    disabled={!selectedFile || isUploading || isRemoving}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Sauvegarder'}
                </button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div>
            <h1 className="text-2xl font-bold">{identity?.firstName} {identity?.lastName}</h1>
            {identity?.pseudo && (
              <div className="flex items-center justify-center gap-2">
                <p className="text-lg text-primary font-semibold">@{identity.pseudo}</p>
                {signInProvider === 'password' && <Gem className="h-5 w-5 text-primary" />}
                {signInProvider === 'google.com' && <Gem className="h-5 w-5 text-info" />}
              </div>
            )}
        </div>
        {identity?.description && <p className="text-sm text-muted-foreground max-w-md">{identity.description}</p>}
      </div>

      <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${profileIncomplete ? 'bg-destructive/20 text-destructive' : 'bg-green-600/20 text-green-500'}`}>
        {profileIncomplete ? <AlertCircle className="h-5 w-5" /> : <CheckCircle className="h-5 w-5" />}
        <span className="font-semibold">{profileIncomplete ? 'Profil incomplet' : 'Profil complet'}</span>
      </div>

      <div className="space-y-4">
        <ProfileSection title="Identité" icon={User}>
            <PreviewField label="Genre" value={identity?.gender} />
            <PreviewField label="Date de naissance" value={identity?.birthDate} />
            <PreviewField label="Nationalité" value={identity?.nationality} />
        </ProfileSection>

        <ProfileSection title="Adresse" icon={Map}>
            <PreviewField label="Ville" value={address?.city} />
            <PreviewField label="Commune" value={address?.municipality} />
            <PreviewField label="Quartier" value={address?.quartier} />
            <PreviewField label="Avenue / Rue" value={address?.street} />
            <PreviewField label="N° Parcelle" value={address?.plotNumber} />
        </ProfileSection>
        
        <ProfileSection title="État Civil" icon={BookUser}>
            <PreviewField label="Situation" value={civilStatus?.maritalStatus} />
            <PreviewField label="Conjoint(e)" value={civilStatus?.spouseName} />
            <PreviewField label="Enfants" value={civilStatus?.childrenCount} />
            <PreviewField label="Noms des enfants" value={civilStatus?.childrenNames?.join(', ')} />
        </ProfileSection>

        <ProfileSection title="Profession" icon={Briefcase}>
            <PreviewField label="Niveau d'études" value={education?.level} />
            <PreviewField label="Profession" value={education?.currentJob} />
            <PreviewField label="Employeur" value={education?.employer} />
            <PreviewField label="Compétences" value={education?.skills?.join(', ')} />
        </ProfileSection>
        
        <ProfileSection title="Contact" icon={Phone}>
            <PreviewField label="Email" value={contact?.email} />
            <PreviewField label="Téléphone" value={contact?.phone} />
        </ProfileSection>

        <ProfileSection title="Communauté" icon={Users2}>
            <PreviewField label="Logement" value={community?.housingType} />
            <PreviewField label="Membre association" value={community?.isNeighborhoodAssociationMember ? 'Oui' : 'Non'} />
            <PreviewField label="Nom de l'association" value={community?.associationName} />
            <PreviewField label="Badge de résidence" value={community?.residenceBadgeNumber} />
            <PreviewField label="Photo de la maison" value={community?.housePictureUrl} isImage={true} />
            <PreviewField label="Contact d'urgence" value={community?.emergencyContactName} />
        </ProfileSection>
        
        <ProfileSection title="Préférences" icon={Cog}>
            <PreviewField label="Langue" value={preferences?.preferredLanguage} />
            <PreviewField label="Communication" value={preferences?.preferredCommunication} />
            <PreviewField label="Notifications" value={preferences?.notificationsEnabled ? 'Activées' : 'Désactivées'} />
            <PreviewField label="Rejoindre un groupe" value={preferences?.wantsToJoinGroup ? 'Oui' : 'Non'} />
        </ProfileSection>
      </div>

      <div className="flex flex-col gap-3 pt-4">
          <Link
            href="/profil/modifier"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-3 transition-colors"
          >
            <Edit className="h-5 w-5" />
            Modifier le Profil
          </Link>
          {isClient && role === 'admin' && (
            <Link
                href="/admin"
                className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-3 transition-colors"
            >
                <Shield className="h-5 w-5" />
                Panneau Admin
            </Link>
          )}
          <button
            onClick={handleSignOut}
            className="w-full bg-destructive/10 hover:bg-destructive/20 text-destructive font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-3 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Se déconnecter
          </button>
      </div>

    </div>
  );
}
