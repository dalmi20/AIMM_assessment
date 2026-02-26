import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle2, Users, Briefcase, Building2, User } from 'lucide-react';
import type { UserInfo } from '@/hooks/useQuestionnaire';

interface RoleSelectorProps {
  roles: string[];
  selectedRole: string | null;
  onSelectRole: (role: string) => void;
  userInfo: UserInfo;
  onUpdateUserInfo: (info: UserInfo) => void;
  onConfirm: () => void;
}

const COMPANIES: Array<'Prodeval' | 'Aventech'> = ['Prodeval', 'Aventech'];

export function RoleSelector({
  roles,
  selectedRole,
  onSelectRole,
  userInfo,
  onUpdateUserInfo,
  onConfirm,
}: RoleSelectorProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!userInfo.company) newErrors.company = "Veuillez sélectionner une entreprise.";
    if (!userInfo.firstName.trim()) newErrors.firstName = "Le prénom est requis.";
    if (!userInfo.lastName.trim()) newErrors.lastName = "Le nom est requis.";
    if (!selectedRole) newErrors.role = "Veuillez sélectionner un rôle.";
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
    selectedRole !== null;

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
          <Label className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary" />
            Entreprise <span className="text-destructive">*</span>
          </Label>
          <div className="flex gap-3 mt-2">
            {COMPANIES.map((company) => {
              const isSelected = userInfo.company === company;
              return (
                <button
                  key={company}
                  type="button"
                  onClick={() => {
                    onUpdateUserInfo({ ...userInfo, company });
                    setErrors((e) => ({ ...e, company: '' }));
                  }}
                  className={`flex-1 py-3 px-5 rounded-lg border-2 font-semibold text-sm transition-all duration-200 ${
                    isSelected
                      ? 'border-primary bg-primary text-primary-foreground shadow-md'
                      : 'border-border bg-card text-foreground hover:border-primary/50 hover:bg-primary/5'
                  }`}
                >
                  {company}
                </button>
              );
            })}
          </div>
          {errors.company && (
            <p className="text-destructive text-xs mt-1">{errors.company}</p>
          )}
        </div>

        {/* Prénom & Nom */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
      </div>

      {/* ── Section 2 : Sélection du rôle ── */}
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-1 flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-primary" />
            Sélectionnez votre rôle
          </h2>
          <p className="text-muted-foreground">
            Choisissez le rôle qui correspond le mieux à votre position pour voir
            les questions pertinentes.
          </p>
        </div>

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
        {errors.role && (
          <p className="text-destructive text-xs mt-2">{errors.role}</p>
        )}
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
            <span className="font-medium">Rôle :</span>{' '}
            {roleConfig[selectedRole!]?.label || selectedRole}
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