'use client';

import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { Loader2, UploadCloud, X, ImageIcon } from 'lucide-react';
import { locations, cities } from '@/lib/locations';
import Image from 'next/image';

// Progress Indicator Component
const ProgressIndicator = ({ currentStep, totalSteps }: { currentStep: number, totalSteps: number }) => {
  const progressPercentage = (currentStep / totalSteps) * 100;
  return (
    <div className="w-full bg-card rounded-full h-2.5 mb-8">
      <div
        className="bg-primary h-2.5 rounded-full transition-all duration-300"
        style={{ width: `${progressPercentage}%` }}
      ></div>
    </div>
  );
};

// Preview Field Component
const PreviewField = ({ label, value, isImage = false }: { label: string, value: any, isImage?: boolean }) => {
  const displayValue = value || <span className="text-muted-foreground/60">Non renseigné</span>;
  return (
    <div className="flex flex-col sm:flex-row py-2">
      <dt className="w-full sm:w-1/3 font-medium text-muted-foreground">{label}</dt>
      <dd className="w-full sm:w-2/3 whitespace-pre-wrap">
        {isImage && typeof value === 'string' && value.startsWith('data:image') ? (
            <div className="relative w-full max-w-xs aspect-video rounded-lg overflow-hidden border mt-1">
                <Image src={value} alt={label} fill className="object-cover" />
            </div>
        ) : displayValue}
      </dd>
    </div>
  );
};


export default function ProfilModifierPage() {
  const { user, isUserLoading: isAuthLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const totalSteps = 8; // A, B, C, D, E, F, G, H(preview)

  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userDocRef);

  const [formData, setFormData] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [housePhotoPreview, setHousePhotoPreview] = useState<string | null>(null);
  const houseFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (userProfile) {
      setFormData(JSON.parse(JSON.stringify(userProfile)));
      if (userProfile.community?.housePictureUrl) {
          setHousePhotoPreview(userProfile.community.housePictureUrl);
      }
    }
  }, [userProfile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const keys = name.split('.');

    let finalValue: any = value;
    
    const targetType = (e.target as HTMLInputElement).type;
    const isBooleanSelect = ['community.isNeighborhoodAssociationMember', 'preferences.notificationsEnabled', 'preferences.wantsToJoinGroup'].includes(name);
    const isArrayText = ['civilStatus.childrenNames', 'education.skills'].includes(name);

    if (targetType === 'number') {
        const num = parseInt(value, 10);
        finalValue = isNaN(num) ? null : num;
    } else if (isBooleanSelect) {
      finalValue = value === 'Oui';
    } else if (isArrayText) {
      finalValue = value.split(',').map(item => item.trim()).filter(Boolean);
    }

    setFormData((prev: any) => {
      const newState = JSON.parse(JSON.stringify(prev));
      let current = newState;
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = current[keys[i]] || {};
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = finalValue;
      
      if (name === 'address.city') {
        newState.address.municipality = '';
        newState.address.quartier = '';
      }
      if (name === 'address.municipality') {
        newState.address.quartier = '';
      }

      return newState;
    });
  };

  const handleHousePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          if (file.size > 1024 * 1024) { // 1MB limit for firestore document
              alert("L'image est trop grande. Veuillez choisir un fichier de moins de 1 Mo.");
              return;
          }
          const reader = new FileReader();
          reader.onloadend = () => {
              const base64 = reader.result as string;
              setHousePhotoPreview(base64);
              setFormData((prev: any) => {
                  const newState = JSON.parse(JSON.stringify(prev));
                  if (!newState.community) newState.community = {};
                  newState.community.housePictureUrl = base64;
                  return newState;
              });
          };
          reader.readAsDataURL(file);
      }
  };
  
  const getValue = (path: string) => {
    if (!formData) return '';
    const value = path.split('.').reduce((obj, key) => (obj && obj[key] !== undefined && obj[key] !== null) ? obj[key] : '', formData);
    
    const isBooleanSelect = ['community.isNeighborhoodAssociationMember', 'preferences.notificationsEnabled', 'preferences.wantsToJoinGroup'].includes(path);
    if (isBooleanSelect) {
        if (typeof value === 'boolean') {
            return value ? 'Oui' : 'Non';
        }
    }
    
    if (Array.isArray(value)) {
        return value.join(', ');
    }
    
    return value;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userDocRef) return;
    setIsSaving(true);
    try {
      const dataToSave = JSON.parse(JSON.stringify(formData));

      if (dataToSave.address.city === 'Autre') {
        dataToSave.address.city = dataToSave.address.city_other || '';
      }
      if (dataToSave.address.municipality === 'Autre') {
        dataToSave.address.municipality = dataToSave.address.municipality_other || '';
      }
      if (dataToSave.address.quartier === 'Autre') {
        dataToSave.address.quartier = dataToSave.address.quartier_other || '';
      }

      delete dataToSave.address.city_other;
      delete dataToSave.address.municipality_other;
      delete dataToSave.address.quartier_other;

      await setDoc(userDocRef, dataToSave, { merge: true });
      router.push('/profil');
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil : ", error);
      alert("Une erreur s'est produite. Veuillez réessayer.");
    } finally {
      setIsSaving(false);
    }
  };

  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };


  if (isAuthLoading || isProfileLoading || !formData) {
    return (
      <div className="flex h-full w-full items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const renderInput = (name: string, label: string, type = 'text', required = false, placeholder = '', readOnly = false) => (
    <div className="flex flex-col">
      <label htmlFor={name} className="mb-1 text-sm font-medium text-muted-foreground">{label}</label>
      <input
        type={type}
        id={name}
        name={name}
        value={getValue(name)}
        onChange={handleChange}
        required={required}
        placeholder={placeholder}
        readOnly={readOnly}
        className="bg-card border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary read-only:bg-muted/50"
      />
    </div>
  );

  const renderTextarea = (name: string, label: string, required = false, placeholder = '') => (
    <div className="flex flex-col md:col-span-2">
      <label htmlFor={name} className="mb-1 text-sm font-medium text-muted-foreground">{label}</label>
      <textarea
        id={name}
        name={name}
        value={getValue(name)}
        onChange={handleChange}
        required={required}
        placeholder={placeholder}
        rows={3}
        className="bg-card border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </div>
  );

  const renderSelect = (name: string, label: string, options: readonly string[], required = false, disabled = false) => (
    <div className="flex flex-col">
      <label htmlFor={name} className="mb-1 text-sm font-medium text-muted-foreground">{label}</label>
      <select
        id={name}
        name={name}
        value={getValue(name)}
        onChange={handleChange}
        required={required}
        disabled={disabled}
        className="bg-card border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-muted/50 disabled:cursor-not-allowed"
      >
        <option value="">Sélectionner...</option>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );

  const stepTitles = [
    "A. Identité Personnelle",
    "B. Adresse et Localisation",
    "C. État Civil",
    "D. Études et Profession",
    "E. Contacts et Sécurité",
    "F. Informations Communautaires",
    "G. Préférences",
    "H. Aperçu et Confirmation"
  ];
  
  const selectedCity = getValue('address.city');
  const selectedMunicipality = getValue('address.municipality');
  
  const municipalities = selectedCity && selectedCity !== 'Autre' && locations[selectedCity as keyof typeof locations] ? Object.keys(locations[selectedCity as keyof typeof locations]) : [];
  const neighborhoods = selectedCity && selectedCity !== 'Autre' && selectedMunicipality && selectedMunicipality !== 'Autre' && locations[selectedCity as keyof typeof locations]?.[selectedMunicipality as keyof typeof locations[keyof typeof locations]] ? locations[selectedCity as keyof typeof locations][selectedMunicipality as keyof typeof locations[keyof typeof locations]] : [];


  return (
    <div className="p-4 sm:p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Complétez votre profil</h1>
        {formData?.identity?.pseudo && <p className="text-lg text-primary font-semibold">@{formData.identity.pseudo}</p>}
        <p className="text-muted-foreground mt-1">
          Étape {step} sur {totalSteps} : {stepTitles[step-1]}
        </p>
      </div>

      <ProgressIndicator currentStep={step} totalSteps={totalSteps} />

      <form onSubmit={handleSubmit} className="space-y-12">
        
        {step === 1 && (
          <fieldset className="space-y-6">
            <legend className="text-lg font-semibold text-foreground">A. Identité Personnelle</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderInput('identity.firstName', 'Prénom', 'text', true)}
              {renderInput('identity.lastName', 'Nom', 'text', true)}
              {renderInput('identity.pseudo', 'Pseudo', 'text', true, 'Votre nom public')}
              {renderSelect('identity.gender', 'Genre', ['Homme', 'Femme', 'Autre'], true)}
              {renderInput('identity.birthDate', 'Date de naissance', 'date', true)}
              {renderInput('identity.nationality', 'Nationalité', 'text', false, 'Congolaise')}
              {renderTextarea('identity.description', 'Description / Bio', false, 'Parlez un peu de vous...')}
            </div>
          </fieldset>
        )}

        {step === 2 && (
          <fieldset className="space-y-6">
            <legend className="text-lg font-semibold text-foreground">B. Adresse et Localisation</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderInput('address.country', 'Pays', 'text', true, 'RDC', true)}
              {renderSelect('address.city', 'Ville', [...cities, 'Autre'], true)}
              {getValue('address.city') === 'Autre' && renderInput('address.city_other', 'Précisez votre ville', 'text', true)}

              {getValue('address.city') && getValue('address.city') !== 'Autre' && (
                <>
                  {renderSelect('address.municipality', 'Commune', [...municipalities, 'Autre'], true, !selectedCity)}
                  {getValue('address.municipality') === 'Autre' && renderInput('address.municipality_other', 'Précisez votre commune', 'text', true)}
                </>
              )}

              {getValue('address.municipality') && getValue('address.municipality') !== 'Autre' && (
                <>
                  {renderSelect('address.quartier', 'Quartier', [...neighborhoods, 'Autre'], true, !selectedMunicipality || neighborhoods.length === 0)}
                  {getValue('address.quartier') === 'Autre' && renderInput('address.quartier_other', 'Précisez votre quartier', 'text', true)}
                </>
              )}
              
              {renderInput('address.street', 'Avenue / Rue', 'text', true)}
              {renderInput('address.plotNumber', 'Numéro de parcelle')}
            </div>
          </fieldset>
        )}

        {step === 3 && (
          <fieldset className="space-y-6">
            <legend className="text-lg font-semibold text-foreground">C. État Civil</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderSelect('civilStatus.maritalStatus', 'Situation matrimoniale', ['Célibataire', 'Marié(e)', 'Veuf(ve)'])}
              {renderInput('civilStatus.spouseName', 'Nom du conjoint (si applicable)')}
              {renderInput('civilStatus.childrenCount', 'Nombre d\'enfants', 'number')}
              {renderTextarea('civilStatus.childrenNames', 'Noms des enfants (séparés par une virgule)', false, 'Prénom1, Prénom2, ...')}
            </div>
          </fieldset>
        )}

        {step === 4 && (
          <fieldset className="space-y-6">
            <legend className="text-lg font-semibold text-foreground">D. Études et Profession</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderInput('education.level', 'Niveau d\'études')}
              {renderInput('education.field', 'Domaine d\'études')}
              {renderInput('education.currentJob', 'Profession actuelle')}
              {renderInput('education.employer', 'Employeur')}
              {renderInput('education.experienceYears', 'Années d\'expérience', 'number')}
              {renderTextarea('education.skills', 'Compétences clés (séparées par une virgule)', false, 'Compétence1, Compétence2, ...')}
            </div>
          </fieldset>
        )}

        {step === 5 && (
          <fieldset className="space-y-6">
            <legend className="text-lg font-semibold text-foreground">E. Contacts et Sécurité</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderInput('contact.email', 'Adresse e-mail', 'email', true, '', true)}
              {renderInput('contact.phone', 'Numéro de téléphone', 'tel', true)}
            </div>
            <p className="text-sm text-muted-foreground">La vérification par SMS (OTP) et par e-mail sera implémentée dans une future version pour renforcer la sécurité.</p>
          </fieldset>
        )}

        {step === 6 && (
          <fieldset className="space-y-6">
            <legend className="text-lg font-semibold text-foreground">F. Informations Communautaires</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderSelect('community.housingType', 'Type de logement', ['Locataire', 'Propriétaire'])}
              {renderSelect('community.isNeighborhoodAssociationMember', 'Membre d\'une association du quartier ?', ['Oui', 'Non'])}
              {renderInput('community.associationName', 'Nom de l\'association (si oui)')}
              {renderInput('community.residenceBadgeNumber', 'Numéro de badge de résidence')}
              {renderInput('community.emergencyContactName', 'Personne à contacter en cas d\'urgence')}
              {renderInput('community.emergencyContactPhone', 'Numéro du contact d\'urgence', 'tel')}
              
              {/* House Photo Upload Section */}
              <div className="flex flex-col md:col-span-2">
                <label className="mb-1 text-sm font-medium text-muted-foreground">Photo de la maison</label>
                <div className="flex flex-col items-center gap-4 p-6 border-2 border-dashed rounded-xl bg-muted/30">
                    {housePhotoPreview ? (
                        <div className="relative w-full aspect-video max-h-56 rounded-lg overflow-hidden border shadow-inner">
                            <Image src={housePhotoPreview} alt="Aperçu maison" fill className="object-cover" />
                            <button 
                                type="button"
                                onClick={() => {
                                    setHousePhotoPreview(null);
                                    setFormData((prev: any) => ({ ...prev, community: { ...prev.community, housePictureUrl: "" } }));
                                }}
                                className="absolute top-2 right-2 bg-destructive text-destructive-foreground p-1.5 rounded-full shadow-lg hover:scale-110 transition-transform"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center py-6">
                            <ImageIcon className="h-16 w-16 text-muted-foreground/40 mb-3" />
                            <p className="text-sm text-muted-foreground font-medium">Téléversez une photo de votre façade</p>
                            <p className="text-xs text-muted-foreground mt-1">Format JPG/PNG, Max 1 Mo</p>
                        </div>
                    )}
                    <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleHousePhotoChange} 
                        ref={houseFileInputRef} 
                        className="hidden" 
                    />
                    <button 
                        type="button"
                        onClick={() => houseFileInputRef.current?.click()}
                        className="bg-secondary hover:bg-secondary/80 text-secondary-foreground font-bold py-2.5 px-6 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
                    >
                        <UploadCloud className="h-5 w-5" />
                        {housePhotoPreview ? 'Changer la photo' : 'Sélectionner une photo'}
                    </button>
                </div>
              </div>
            </div>
          </fieldset>
        )}
        
        {step === 7 && (
          <fieldset className="space-y-6">
            <legend className="text-lg font-semibold text-foreground">G. Préférences</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderSelect('preferences.preferredLanguage', 'Langue préférée', ['Français', 'Anglais', 'Swahili'])}
              {renderSelect('preferences.preferredCommunication', 'Moyen de communication préféré', ['SMS', 'Courriel', 'Application'])}
              {renderSelect('preferences.notificationsEnabled', 'Activer les notifications', ['Oui', 'Non'])}
              {renderSelect('preferences.wantsToJoinGroup', 'Souhaite rejoindre des groupes', ['Oui', 'Non'])}
            </div>
          </fieldset>
        )}
        
        {step === 8 && (
          <div className="space-y-8">
            <h2 className="text-lg font-semibold text-foreground">H. Aperçu et Confirmation</h2>
            <p className="text-muted-foreground">Veuillez vérifier que toutes les informations sont correctes avant de finaliser votre profil.</p>
            
            <div className="space-y-6">

              <div className="border rounded-lg divide-y">
                <h3 className="font-semibold text-lg p-4">A. Identité Personnelle</h3>
                <dl className="p-4 space-y-2">
                  <PreviewField label="Prénom" value={getValue('identity.firstName')} />
                  <PreviewField label="Nom" value={getValue('identity.lastName')} />
                  <PreviewField label="Pseudo" value={getValue('identity.pseudo')} />
                  <PreviewField label="Description" value={getValue('identity.description')} />
                  <PreviewField label="Genre" value={getValue('identity.gender')} />
                  <PreviewField label="Date de naissance" value={getValue('identity.birthDate')} />
                  <PreviewField label="Nationalité" value={getValue('identity.nationality')} />
                </dl>
              </div>

              <div className="border rounded-lg divide-y">
                <h3 className="font-semibold text-lg p-4">B. Adresse et Localisation</h3>
                <dl className="p-4 space-y-2">
                  <PreviewField label="Pays" value={getValue('address.country')} />
                  <PreviewField label="Ville" value={getValue('address.city') === 'Autre' ? getValue('address.city_other') : getValue('address.city')} />
                  <PreviewField label="Commune" value={getValue('address.municipality') === 'Autre' ? getValue('address.municipality_other') : getValue('address.municipality')} />
                  <PreviewField label="Quartier" value={getValue('address.quartier') === 'Autre' ? getValue('address.quartier_other') : getValue('address.quartier')} />
                  <PreviewField label="Avenue / Rue" value={getValue('address.street')} />
                  <PreviewField label="N° parcelle" value={getValue('address.plotNumber')} />
                </dl>
              </div>

              <div className="border rounded-lg divide-y">
                <h3 className="font-semibold text-lg p-4">C. État Civil</h3>
                <dl className="p-4 space-y-2">
                  <PreviewField label="Situation matrimoniale" value={getValue('civilStatus.maritalStatus')} />
                  <PreviewField label="Nom du conjoint" value={getValue('civilStatus.spouseName')} />
                  <PreviewField label="Nombre d'enfants" value={getValue('civilStatus.childrenCount')} />
                  <PreviewField label="Noms des enfants" value={getValue('civilStatus.childrenNames')} />
                </dl>
              </div>

              <div className="border rounded-lg divide-y">
                <h3 className="font-semibold text-lg p-4">D. Études et Profession</h3>
                <dl className="p-4 space-y-2">
                  <PreviewField label="Niveau d'études" value={getValue('education.level')} />
                  <PreviewField label="Domaine" value={getValue('education.field')} />
                  <PreviewField label="Profession" value={getValue('education.currentJob')} />
                  <PreviewField label="Employeur" value={getValue('education.employer')} />
                  <PreviewField label="Années d'expérience" value={getValue('education.experienceYears')} />
                  <PreviewField label="Compétences" value={getValue('education.skills')} />
                </dl>
              </div>

              <div className="border rounded-lg divide-y">
                <h3 className="font-semibold text-lg p-4">E. Contacts et Sécurité</h3>
                <dl className="p-4 space-y-2">
                  <PreviewField label="Email" value={getValue('contact.email')} />
                  <PreviewField label="Téléphone" value={getValue('contact.phone')} />
                </dl>
              </div>

              <div className="border rounded-lg divide-y">
                <h3 className="font-semibold text-lg p-4">F. Informations Communautaires</h3>
                <dl className="p-4 space-y-2">
                  <PreviewField label="Type de logement" value={getValue('community.housingType')} />
                  <PreviewField label="Membre association?" value={getValue('community.isNeighborhoodAssociationMember')} />
                  <PreviewField label="Nom association" value={getValue('community.associationName')} />
                  <PreviewField label="Numéro de badge" value={getValue('community.residenceBadgeNumber')} />
                  <PreviewField label="Photo de la maison" value={getValue('community.housePictureUrl')} isImage={true} />
                  <PreviewField label="Contact d'urgence" value={getValue('community.emergencyContactName')} />
                  <PreviewField label="Téléphone d'urgence" value={getValue('community.emergencyContactPhone')} />
                </dl>
              </div>

              <div className="border rounded-lg divide-y">
                <h3 className="font-semibold text-lg p-4">G. Préférences</h3>
                <dl className="p-4 space-y-2">
                  <PreviewField label="Langue" value={getValue('preferences.preferredLanguage')} />
                  <PreviewField label="Communication" value={getValue('preferences.preferredCommunication')} />
                  <PreviewField label="Notifications" value={getValue('preferences.notificationsEnabled')} />
                  <PreviewField label="Rejoindre groupes" value={getValue('preferences.wantsToJoinGroup')} />
                </dl>
              </div>
            </div>
          </div>
        )}
        
        <div className="pt-8 border-t flex justify-between">
          <button 
            type="button" 
            onClick={prevStep} 
            disabled={step === 1}
            className="bg-muted hover:bg-muted/80 text-muted-foreground font-bold py-3 px-8 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Précédent
          </button>
          
          {step < totalSteps ? (
            <button 
              type="button" 
              onClick={nextStep}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-8 rounded-lg transition-colors"
            >
              Suivant
            </button>
          ) : (
            <button 
              type="submit" 
              disabled={isSaving} 
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-8 rounded-lg flex items-center justify-center gap-3 transition-colors disabled:opacity-50"
            >
              {isSaving && <Loader2 className="h-5 w-5 animate-spin" />}
              Sauvegarder et Terminer
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
