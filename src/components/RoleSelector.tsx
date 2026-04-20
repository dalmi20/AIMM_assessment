import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { CheckCircle2, Users, Briefcase, Building2, User, PlusCircle } from 'lucide-react';
import type { UserInfo } from '@/hooks/useQuestionnaire';

interface RoleSelectorProps {
  roles: string[];
  selectedRole: string | null;
  onSelectRole: (role: string) => void;
  userInfo: UserInfo;
  onUpdateUserInfo: (info: UserInfo) => void;
  onConfirm: () => void;
}

type JobTitle = { title: string; company: 'Prodeval' | 'Aventech'; role: 'strategique' | 'operationnel' };

// Liste des postes par entreprise avec type de rôle
const INITIAL_jobTitles: JobTitle[] = [
  { title: "Chargé d'affaire", company: 'Prodeval', role: 'operationnel' },
  { title: "Chargé d'affaire (binôme)", company: 'Aventech', role: 'operationnel' },
  { title: 'Chef de projet', company: 'Aventech', role: 'operationnel' },
  { title: 'Chef de projet', company: 'Prodeval', role: 'operationnel' },
  { title: 'Contrôleur FAT Élec', company: 'Prodeval', role: 'operationnel' },
  { title: 'Contrôleur FAT Méca', company: 'Prodeval', role: 'operationnel' },
  { title: 'Contrôleur Méca', company: 'Aventech', role: 'operationnel' },
  { title: 'Approvisionneur', company: 'Prodeval', role: 'operationnel' },
  { title: "Responsable d'achat", company: 'Prodeval', role: 'strategique' },
  { title: "Responsable d'achat", company: 'Aventech', role: 'strategique' },
  { title: 'Planificateur', company: 'Prodeval', role: 'operationnel' },
  { title: 'Responsable de contrôle opérationnel', company: 'Aventech', role: 'strategique' },
  { title: 'Responsable de contrôle opérationnel', company: 'Prodeval', role: 'strategique' },
  { title: 'Responsable Moyens & Outillages - Qualité & Sécurité', company: 'Aventech', role: 'strategique' },
  { title: "Assistant de chargé d'affaire (binôme côté production)", company: 'Aventech', role: 'operationnel' },
  { title: 'Agent de logistique', company: 'Aventech', role: 'operationnel' },
  { title: 'Assistant de responsable production (ARP)', company: 'Aventech', role: 'operationnel' },
];

export function RoleSelector({
  roles,
  selectedRole,
  onSelectRole,
  userInfo,
  onUpdateUserInfo,
  onConfirm,
}: RoleSelectorProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedJobTitle, setSelectedJobTitle] = useState<string>('');
  const [jobTitles, setJobTitles] = useState<JobTitle[]>(() => {
    try {
      const saved = localStorage.getItem('customJobTitles');
      const custom: JobTitle[] = saved ? JSON.parse(saved) : [];
      return [...INITIAL_jobTitles, ...custom];
    } catch {
      return INITIAL_jobTitles;
    }
  });
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customJobTitle, setCustomJobTitle] = useState('');

  // Map role names to display names and descriptions
  const roleConfig: Record<
    string,
    { label: string; description: string; icon: React.ReactNode }
  > = {
    'Stratégique: un responsable de service, chef de projet': {
      label: 'Rôle Stratégique',
      description: 'Responsable de service, Chef de projet',
      icon: <Briefcase className="w-6 h-6" />,
    },
    'Tous les acteurs impliqués dans la collaboration': {
      label: 'Tous les Acteurs',
      description: 'Tous les acteurs impliqués dans la collaboration',
      icon: <Users className="w-6 h-6" />,
    },
  };

  // Filtrer les postes selon l'entreprise sélectionnée
  const filteredJobTitles = userInfo.company
    ? jobTitles.filter((j) => j.company === userInfo.company)
    : [];

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!userInfo.company) newErrors.company = "Veuillez sélectionner une entreprise.";
    if (!userInfo.firstName.trim()) newErrors.firstName = "Le prénom est requis.";
    if (!userInfo.lastName.trim()) newErrors.lastName = "Le nom est requis.";
    if (!selectedJobTitle) newErrors.jobTitle = "Veuillez sélectionner votre poste.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = () => {
    if (validate()) {
      onConfirm();
    }
  };

  const isFormComplete =
    userInfo.company !== null &&
    userInfo.firstName.trim() !== '' &&
    userInfo.lastName.trim() !== '' &&
    selectedJobTitle !== '';

  return (
    <div className="w-full space-y-10">

      {/* ── Section 1 : Informations personnelles ── */}
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-1 flex items-center gap-2">
            <User className="w-6 h-6 text-primary" />
            Vos informations
          </h2>
          <p className="text-muted-foreground">
            Renseignez votre entreprise, votre prénom et votre nom avant de commencer.
          </p>
        </div>

        {/* Entreprise */}
        <div className="mb-6">
          <span className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary" />
            Entreprise <span className="text-destructive">*</span>
          </span>
          <div className="flex gap-3 mt-2">
            {/* Prodeval */}
            <button
              type="button"
              onClick={() => {
                onUpdateUserInfo({ ...userInfo, company: 'Prodeval' });
                setSelectedJobTitle(''); // Reset job title when company changes
                setErrors((e) => ({ ...e, company: '', jobTitle: '' }));
              }}
              className={`relative flex-1 py-4 px-5 rounded-lg border-2 transition-all duration-200 flex flex-col items-center justify-center gap-2 ${
                userInfo.company === 'Prodeval'
                  ? 'border-primary bg-primary/5 shadow-md ring-2 ring-primary/20'
                  : 'border-border bg-card hover:border-primary/50 hover:bg-primary/5'
              }`}
            >
              <div className="h-16 w-48 flex items-center justify-center">
                <img
                  src="/AIMM_assessment/logo-prodeval.png"
                  alt="Prodeval"
                  className="object-contain"
                />
              </div>
              {userInfo.company === 'Prodeval' && (
                <CheckCircle2 className="w-4 h-4 text-primary absolute top-2 right-2" />
              )}
            </button>

            {/* Aventech */}
            <button
              type="button"
              onClick={() => {
                onUpdateUserInfo({ ...userInfo, company: 'Aventech' });
                setSelectedJobTitle(''); // Reset job title when company changes
                setErrors((e) => ({ ...e, company: '', jobTitle: '' }));
              }}
              className={`relative flex-1 py-4 px-5 rounded-lg border-2 transition-all duration-200 flex flex-col items-center justify-center gap-2 ${
                userInfo.company === 'Aventech'
                  ? 'border-primary bg-primary/5 shadow-md ring-2 ring-primary/20'
                  : 'border-border bg-card hover:border-primary/50 hover:bg-primary/5'
              }`}
            >
              <div className="h-14 w-40 flex items-center justify-center">
                <img
                  src="/AIMM_assessment/logo-aventech.png"
                  alt="Aventech"
                  className="object-contain"
                />
              </div>
              {userInfo.company === 'Aventech' && (
                <CheckCircle2 className="w-4 h-4 text-primary absolute top-2 right-2" />
              )}
            </button>
          </div>
          {errors.company && (
            <p className="text-destructive text-xs mt-1">{errors.company}</p>
          )}
        </div>

        {/* Prénom & Nom */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="space-y-1">
            <Label htmlFor="firstName" className="text-sm font-semibold text-foreground">
              Prénom <span className="text-destructive">*</span>
            </Label>
            <Input
              id="firstName"
              placeholder="Votre prénom"
              value={userInfo.firstName}
              onChange={(e) => {
                onUpdateUserInfo({ ...userInfo, firstName: e.target.value });
                setErrors((err) => ({ ...err, firstName: '' }));
              }}
              className={errors.firstName ? 'border-destructive' : ''}
            />
            {errors.firstName && (
              <p className="text-destructive text-xs">{errors.firstName}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="lastName" className="text-sm font-semibold text-foreground">
              Nom <span className="text-destructive">*</span>
            </Label>
            <Input
              id="lastName"
              placeholder="Votre nom de famille"
              value={userInfo.lastName}
              onChange={(e) => {
                onUpdateUserInfo({ ...userInfo, lastName: e.target.value });
                setErrors((err) => ({ ...err, lastName: '' }));
              }}
              className={errors.lastName ? 'border-destructive' : ''}
            />
            {errors.lastName && (
              <p className="text-destructive text-xs">{errors.lastName}</p>
            )}
          </div>
        </div>

        {/* Poste / Fonction */}
        <div className="space-y-1 mt-4">
          <label htmlFor="jobTitle" className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-primary" />
            Poste / Fonction <span className="text-destructive">*</span>
          </label>
          <select
            id="jobTitle"
            value={selectedJobTitle}
            onChange={(e) => {
              const title = e.target.value;
              setSelectedJobTitle(title);
              onUpdateUserInfo({ ...userInfo, jobTitle: title });
              setErrors((err) => ({ ...err, jobTitle: '' }));
              // Auto-déterminer le rôle à partir du champ role dans jobTitles
              const job = jobTitles.find(
                (j) => j.title === title && j.company === userInfo.company
              );
              const role = job?.role === 'strategique'
                ? 'Stratégique: un responsable de service, chef de projet'
                : 'Tous les acteurs impliqués dans la collaboration';
              onSelectRole(role);
            }}
            disabled={!userInfo.company}
            className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
              errors.jobTitle ? 'border-destructive' : 'border-input'
            } ${!userInfo.company ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <option value="">
              {userInfo.company
                ? 'Sélectionnez votre poste'
                : "Sélectionnez d'abord une entreprise"}
            </option>
            {filteredJobTitles.map((job, idx) => (
              <option key={`${job.title}-${idx}`} value={job.title}>
                {job.title}
              </option>
            ))}
          </select>
          {errors.jobTitle && (
            <p className="text-destructive text-xs mt-1">{errors.jobTitle}</p>
          )}

          {/* Option : poste non trouvé */}
          {userInfo.company && (
            <div className="mt-2">
              {!showCustomInput ? (
                <button
                  type="button"
                  onClick={() => setShowCustomInput(true)}
                  className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  Mon poste n'est pas dans la liste
                </button>
              ) : (
                <div className="flex gap-2 mt-1">
                  <Input
                    placeholder="Saisissez votre poste..."
                    value={customJobTitle}
                    onChange={(e) => setCustomJobTitle(e.target.value)}
                    className="text-sm"
                  />
                  <Button
                    type="button"
                    size="sm"
                    disabled={!customJobTitle.trim()}
                    onClick={() => {
                      const newJob: JobTitle = {
                        title: customJobTitle.trim(),
                        company: userInfo.company!,
                        role: 'operationnel',
                      };
                      setJobTitles((prev) => {
                        const updated = [...prev, newJob];
                        const custom = updated.filter(j => !INITIAL_jobTitles.some(i => i.title === j.title && i.company === j.company));
                        localStorage.setItem('customJobTitles', JSON.stringify(custom));
                        return updated;
                      });
                      setSelectedJobTitle(newJob.title);
                      onUpdateUserInfo({ ...userInfo, jobTitle: newJob.title });
                      onSelectRole('Tous les acteurs impliqués dans la collaboration');
                      setErrors((err) => ({ ...err, jobTitle: '' }));
                      setCustomJobTitle('');
                      setShowCustomInput(false);
                    }}
                  >
                    Ajouter
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => { setShowCustomInput(false); setCustomJobTitle(''); }}
                  >
                    Annuler
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Section 2 : Sélection du rôle (hidden - auto-déterminé par le poste) ── */}
      <div className="hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roles.map((role) => {
            const config = roleConfig[role] || {
              label: role,
              description: '',
              icon: <Users className="w-6 h-6" />,
            };
            const isSelected = selectedRole === role;

            return (
              <Card
                key={role}
                className={`p-6 cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'ring-2 ring-primary bg-primary/5 border-primary'
                    : 'hover:border-primary/50 hover:shadow-md'
                }`}
                onClick={() => {
                  onSelectRole(role);
                  setErrors((e) => ({ ...e, role: '' }));
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div
                      className={`p-3 rounded-lg ${
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {config.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground text-lg">
                        {config.label}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {config.description}
                      </p>
                    </div>
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 ml-2" />
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* ── Récapitulatif & Bouton de confirmation ── */}
      {isFormComplete && (
        <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg space-y-1">
          <p className="text-sm text-primary font-semibold">Récapitulatif</p>
          <p className="text-sm text-foreground">
            <span className="font-medium">Entreprise :</span> {userInfo.company}
          </p>
          <p className="text-sm text-foreground">
            <span className="font-medium">Nom :</span> {userInfo.firstName} {userInfo.lastName}
          </p>
          <p className="text-sm text-foreground">
            <span className="font-medium">Poste :</span> {selectedJobTitle}
          </p>
     
        </div>
      )}

      <Button
        onClick={handleConfirm}
        className="w-full"
        size="lg"
        disabled={!isFormComplete}
      >
        Commencer le questionnaire
      </Button>
    </div>
  );
}