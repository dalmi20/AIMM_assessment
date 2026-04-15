import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useQuestionnaire } from '@/hooks/useQuestionnaire';
import { RoleSelector } from '@/components/RoleSelector';
import { QuestionCard } from '@/components/QuestionCard';
import { DimensionNav } from '@/components/DimensionNav';
import {
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Menu,
  AlertCircle,
  CheckCircle2,
  Mail,
  BookOpen,
} from 'lucide-react';
import { generatePDF } from '@/lib/pdfExport';
import { uploadJsonToDrive } from '@/lib/googleDrive';

export default function Questionnaire() {
  const {
    selectedRole,
    setSelectedRole,
    userInfo,
    setUserInfo,
    answers,
    answerQuestion,
    getAnswer,
    roles,
    dimensions,
    currentDimensionIndex,
    setCurrentDimensionIndex,
    currentDimensionQuestions,
    currentDimensionName,
    progress,
    getDimensionProgress,
    reset,
    exportAnswers,
    filteredQuestions,
    removeAnswersForQuestions,
    isQuestionSkipped,
  } = useQuestionnaire();

  // Whether the user has confirmed their info & role and entered the questionnaire
  const [questionnaireStarted, setQuestionnaireStarted] = useState(false);
  const [showDimensionGlossary, setShowDimensionGlossary] = useState(false);
  const [acknowledgedDimensions, setAcknowledgedDimensions] = useState<Set<string>>(new Set());
  const [showResetDialog, setShowResetDialog] = useState(false);

  const DIMENSION_GLOSSARY: Record<string, { term: string; definition: string }[]> = {
    'Contrat de partenariat': [
      { term: 'SLA', definition: 'Service Level Agreement — engagement contractuel sur les niveaux de service (délais, qualité, disponibilité).' },
      { term: 'Accord-cadre', definition: 'Document formalisant les règles générales de la collaboration entre les deux entreprises.' },
      { term: 'RACI', definition: 'Matrice indiquant qui est Responsable, Approbateur, Consulté et Informé pour chaque tâche.' },
    ],
    'Culture et valeurs Organisationnels': [
      { term: 'Culture d\'entreprise', definition: 'Ensemble des valeurs, croyances et pratiques qui caractérisent le fonctionnement d\'une organisation.' },
      { term: 'Valeurs partagées', definition: 'Principes communs acceptés et appliqués par les deux partenaires pour guider leurs interactions.' },
    ],
    'Marché/technologie': [
      { term: 'Veille technologique', definition: 'Processus de surveillance des innovations et tendances du marché susceptibles d\'impacter la collaboration.' },
      { term: 'Co-décision', definition: 'Prise de décision stratégique conjointe entre les deux partenaires sur les orientations marché ou techniques.' },
    ],
    'Coûts / Finances': [
      { term: 'Coûts partagés', definition: 'Dépenses liées à la collaboration dont la charge est répartie entre les deux entreprises selon des règles définies.' },
      { term: 'Budget collaboratif', definition: 'Enveloppe financière dédiée aux projets communs, connue et validée par les deux parties.' },
    ],
    'Rôles et responsabilités': [
      { term: 'RACI', definition: 'Matrice indiquant qui est Responsable, Approbateur, Consulté et Informé pour chaque tâche.' },
      { term: 'Zone grise', definition: 'Périmètre d\'action non clairement attribué, source potentielle de conflits ou de redondances.' },
    ],
    'Compétences': [
      { term: 'Cartographie des compétences', definition: 'Inventaire structuré des savoir-faire disponibles au sein de chaque équipe.' },
      { term: 'Formation croisée', definition: 'Formation organisée conjointement entre les deux entreprises pour renforcer la compréhension mutuelle.' },
    ],
    'Engagement': [
      { term: 'Taux de participation', definition: 'Proportion des acteurs présents et actifs lors des réunions ou ateliers collaboratifs.' },
      { term: 'Turnover', definition: 'Taux de renouvellement des membres de l\'équipe dédiée à la collaboration.' },
    ],
    'Définition des processus métiers': [
      { term: 'Référentiel processus', definition: 'Document partagé décrivant l\'ensemble des étapes, responsables et flux d\'information du processus collaboratif.' },
      { term: 'Point de coordination', definition: 'Étape du processus nécessitant une interaction directe entre les deux entreprises.' },
      { term: 'Entrées/Sorties', definition: 'Informations ou livrables requis en entrée d\'une étape et produits en sortie.' },
    ],
    'Exécution des processus métiers': [
      { term: 'Désynchronisation', definition: 'Décalage entre les activités prévues et réalisées par les deux partenaires, générant des retards.' },
      { term: 'Itération', definition: 'Aller-retour nécessaire entre les parties pour finaliser une tâche ou valider une information.' },
    ],
    'Pilotage des processus métiers': [
      { term: 'KPI', definition: 'Key Performance Indicator — indicateur clé mesurant l\'atteinte d\'un objectif de performance.' },
      { term: 'Tableau de bord', definition: 'Outil visuel regroupant les KPI pour suivre la performance de la collaboration en temps réel.' },
      { term: 'Revue de performance', definition: 'Réunion périodique d\'analyse des indicateurs et de prise de décision corrective.' },
    ],
    'Transparence des processus métiers': [
      { term: 'Traçabilité', definition: 'Capacité à retrouver l\'historique complet d\'une action, décision ou événement dans le processus.' },
      { term: 'Visibilité partagée', definition: 'Accès des deux partenaires aux mêmes informations sur l\'avancement des activités communes.' },
    ],
    'Gestion des incidents et risques': [
      { term: 'Incident', definition: 'Événement non planifié perturbant le déroulement normal du processus collaboratif.' },
      { term: 'Risque', definition: 'Probabilité qu\'un événement négatif se produise et impacte la collaboration.' },
      { term: 'Plan de continuité', definition: 'Procédure garantissant la poursuite des opérations en cas de défaillance majeure.' },
    ],
    'Donnée de processus': [
      { term: 'EDI', definition: 'Échange de Données Informatisé — transfert automatique et structuré de données entre systèmes.' },
      { term: 'API', definition: 'Interface permettant à deux systèmes informatiques d\'échanger des données de manière automatisée.' },
      { term: 'Données opérationnelles', definition: 'Données générées quotidiennement par l\'exécution des processus (commandes, stocks, livraisons).' },
    ],
    'Données de produits': [
      { term: 'Référentiel produit', definition: 'Base de données centralisée contenant toutes les informations techniques et commerciales des produits.' },
      { term: 'Données techniques', definition: 'Informations relatives aux caractéristiques, spécifications et configurations des produits.' },
    ],
    'Ingénierie des connaissances': [
      { term: 'Capitalisation', definition: 'Processus de formalisation et de stockage des connaissances pour les rendre réutilisables.' },
      { term: 'Base de connaissances', definition: 'Système structuré regroupant les savoirs, procédures et bonnes pratiques de la collaboration.' },
    ],
    'Gestion des connaissances': [
      { term: 'REX', definition: 'Retour d\'Expérience — analyse structurée d\'un événement passé pour en tirer des enseignements.' },
      { term: 'Transfer de connaissances', definition: 'Transmission formelle des savoirs et savoir-faire entre acteurs de la collaboration.' },
    ],
  };

  const [showSidebar, setShowSidebar] = useState(false);
  const [navigationError, setNavigationError] = useState('');
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0); // Index de la question active dans la dimension

  // Show dimension glossary popup when arriving at a new unacknowledged dimension
  useEffect(() => {
    if (questionnaireStarted && currentDimensionName && !acknowledgedDimensions.has(currentDimensionName)) {
      setShowDimensionGlossary(true);
    }
  }, [currentDimensionIndex, currentDimensionName, questionnaireStarted]);

  // Reset sidebar on larger screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setShowSidebar(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Vérifier si la dimension actuelle est complète
  const isCurrentDimensionComplete = () => {
    if (currentDimensionQuestions.length === 0) return true;
    
    const answeredInCurrentDimension = answers.filter(
      (a) => a.dimension === currentDimensionName
    ).length;
    
    return answeredInCurrentDimension === currentDimensionQuestions.length;
  };

  // Vérifier si le questionnaire est complètement rempli
  const isQuestionnaireComplete = progress === 100 && answers.length === filteredQuestions.length;


  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSendByEmail = async () => {
    const safeName = `${userInfo.lastName || 'export'}_${userInfo.firstName || ''}`.replace(/\s+/g, '_');
    const date = new Date().toISOString().split('T')[0];
    const exportData = { userInfo, role: selectedRole || '', answers, totalQuestions: filteredQuestions.length, completionPercentage: progress };

    setIsSending(true);
    setSendStatus('idle');

    try {
      const jsonData = exportAnswers();
      generatePDF(exportData);

      await uploadJsonToDrive(
        `questionnaire-${safeName}-${date}`,
        jsonData
      );

      setSendStatus('success');
    } catch (err: any) {
      console.error('Submit error:', err);
      setSendStatus('error');
    } finally {
      setIsSending(false);
    }
  };

  const handleReset = () => {
    reset();
    setQuestionnaireStarted(false);
    setShowResetDialog(false);
    setNavigationError('');
    setAcknowledgedDimensions(new Set());
  };

  const handleChangeRole = () => {
    setSelectedRole(null);
    setQuestionnaireStarted(false);
    setNavigationError('');
  };

  const handleNavigateToPrevious = () => {
    setNavigationError('');
    setActiveQuestionIndex(0);
    setCurrentDimensionIndex(Math.max(0, currentDimensionIndex - 1));
  };

  const handleNavigateToNext = () => {
    if (!isCurrentDimensionComplete()) {
      const answeredCount = answers.filter(
        (a) => a.dimension === currentDimensionName
      ).length;
      setNavigationError(
        `Veuillez répondre à toutes les questions de cette dimension. ${answeredCount}/${currentDimensionQuestions.length} répondues.`
      );
      return;
    }
    setNavigationError('');
    setActiveQuestionIndex(0);
    setCurrentDimensionIndex(
      Math.min(dimensions.length - 1, currentDimensionIndex + 1)
    );
  };

  // Show role selector if questionnaire not yet started
  if (!questionnaireStarted) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Grille de Maturité
            </h1>
            <p className="text-lg text-muted-foreground">
              Collaboration Logistique
            </p>
          </div>

          <RoleSelector
            roles={roles}
            selectedRole={selectedRole}
            onSelectRole={setSelectedRole}
            userInfo={userInfo}
            onUpdateUserInfo={setUserInfo}
            onConfirm={() => { setQuestionnaireStarted(true); }}
          />
        </div>
      </div>
    );
  }

  const DIMENSION_DEFINITIONS: Record<string, string> = {
    'Contrat de partenariat': "Les accords formels et engagements contractuels entre les deux entreprises, définissant les responsabilités de chacune et les niveaux de service attendus (SLA).",
    'Culture et valeurs Organisationnels': "L'alignement des valeurs, la confiance mutuelle et la compatibilité culturelle entre les équipes des deux entreprises pour favoriser une collaboration durable.",
    'Marché/technologie': "La connaissance partagée des évolutions du marché et l'adoption des technologies pour améliorer la performance de la collaboration logistique.",
    'Coûts / Finances': "La transparence et la gestion partagée des coûts liés à la collaboration, incluant la visibilité sur les dépenses et les mécanismes de partage des gains.",
    'Rôles et responsabilités': "La clarté dans la définition des rôles et des responsabilités de chaque acteur impliqué dans les processus collaboratifs.",
    'Compétences': "Les savoir-faire, formations et niveaux d'expertise des équipes pour assurer une collaboration logistique efficace et de qualité.",
    'Engagement': "Le niveau d'implication, de motivation et d'adhésion des acteurs à la démarche collaborative et aux objectifs communs.",
    'Définition des processus métiers': "La formalisation, la documentation et la standardisation des processus logistiques communs entre les deux entreprises.",
    'Exécution des processus métiers': "La mise en œuvre opérationnelle et quotidienne des processus définis, ainsi que le respect des procédures établies.",
    'Pilotage des processus métiers': "Le suivi, la mesure et l'analyse des indicateurs de performance des processus collaboratifs pour améliorer en continu.",
    'Transparence des processus métiers': "La visibilité et le partage en temps réel des informations entre les équipes sur l'avancement et l'état des processus.",
    'Gestion des incidents et risques': "La capacité à identifier, signaler, traiter et prévenir les incidents et risques pouvant affecter la collaboration logistique.",
    'Donnée de processus': "La qualité, la disponibilité et le partage des données opérationnelles générées par les processus entre les deux entreprises.",
    'Données de produits': "La gestion, la fiabilité et le partage des informations relatives aux produits tout au long de la chaîne logistique collaborative.",
    'Ingénierie des connaissances': "La capitalisation, la structuration et la valorisation des connaissances techniques et métiers au service de la collaboration.",
    'Gestion des connaissances': "Le partage, la transmission et la mise à jour des savoirs et bonnes pratiques entre les acteurs de la collaboration.",
  };

  const partnerCompany = userInfo.company === 'Prodeval' ? 'AVENTECH' : 'PRODEVAL';
  const userCompany = userInfo.company?.toUpperCase() || '';
  const resolveQuestion = (text: string) =>
    text.replace('{PARTNER}', partnerCompany).replace('{COMPANY}', userCompany);

  // Show questionnaire
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="lg:hidden p-2 hover:bg-muted rounded-lg"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Questionnaire
                </h1>
                <p className="text-sm text-muted-foreground">
                  Collaboration Logistique
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">
                {progress}% complété
              </span>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div
            className={`${
              showSidebar ? 'block' : 'hidden'
            } lg:block lg:col-span-1`}
          >
            <div className="sticky top-24 space-y-6 max-h-[calc(100vh-7rem)] overflow-y-auto pr-1">
              {/* User Info Card */}
              <Card className="p-4 bg-primary/5 border-primary/20 space-y-2">
                <p className="text-xs font-semibold text-primary uppercase mb-1">
                  Participant
                </p>
                <p className="text-sm font-medium text-foreground">
                  {userInfo.firstName} {userInfo.lastName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {userInfo.company}
                </p>
                <Separator />
                <p className="text-xs font-semibold text-primary uppercase">
                  Poste
                </p>
                <p className="text-sm font-medium text-foreground">
                  {userInfo.jobTitle || '—'}
                </p>
              </Card>

              {/* Dimensions Navigation */}
              <DimensionNav
                dimensions={dimensions}
                currentDimensionIndex={currentDimensionIndex}
                onSelectDimension={setCurrentDimensionIndex}
                getDimensionProgress={getDimensionProgress}
              />

              {/* Action Buttons */}
              <div className="space-y-2 pt-4 border-t border-border">
                <Button
                  onClick={() => setShowResetDialog(true)}
                  variant="outline"
                  className="w-full gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Réinitialiser
                </Button>
                <Button
                  onClick={handleChangeRole}
                  variant="ghost"
                  className="w-full"
                >
                  Changer de rôle
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Dimension Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h2 className="text-3xl font-bold text-foreground">
                  {currentDimensionName}
                </h2>
                {isCurrentDimensionComplete() && (
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 flex-shrink-0" />
                )}
                {acknowledgedDimensions.has(currentDimensionName) && (
                  <button
                    onClick={() => setShowDimensionGlossary(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-violet-700 bg-violet-50 border border-violet-200 px-2.5 py-1 rounded-full hover:bg-violet-100 transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    Glossaire lu
                  </button>
                )}
              </div>
            </div>

            {/* Dimension Definition Card */}
            {DIMENSION_DEFINITIONS[currentDimensionName] && (
              <Card className="mb-6 p-5 bg-blue-50/60 border-blue-200">
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">
                  Définition
                </p>
                <p className="text-sm text-blue-900">
                  {DIMENSION_DEFINITIONS[currentDimensionName]}
                </p>
              </Card>
            )}

            {/* Questions */}
            {(() => {
              const firstQuestion = currentDimensionQuestions[0];
              const firstAnswer = firstQuestion
                ? getAnswer(firstQuestion.dimension, firstQuestion.indicator, firstQuestion.question)
                : undefined;
              const firstAnsweredOption = firstAnswer?.selectedOption;
              const isCultureDimension = currentDimensionName === 'Culture et valeurs Organisationnels';
              const isFirstOptionSelected = firstAnsweredOption === 0;
              const remainingQuestions = currentDimensionQuestions.slice(1).filter(q => !q.skipExempt);

              // Pour les dimensions non-Culture : cacher les questions si option 0 (sauf skipExempt)
              const visibleQuestions = (!isCultureDimension && isFirstOptionSelected)
                ? [firstQuestion, ...currentDimensionQuestions.slice(1).filter(q => q.skipExempt)]
                : currentDimensionQuestions;

              return (
                <div className="space-y-6 mb-8">
                  {visibleQuestions.map((question, index) => {
                    const answer = getAnswer(
                      question.dimension,
                      question.indicator,
                      question.question
                    );

                    const prevQuestion = visibleQuestions[index - 1];
                    const prevAnswer = prevQuestion
                      ? getAnswer(prevQuestion.dimension, prevQuestion.indicator, prevQuestion.question)
                      : undefined;

                    const isLocked = index > 0 && prevAnswer === undefined;

                    if (isQuestionSkipped(question)) return null;

                    return (
                      <QuestionCard
                        key={index}
                        dimension={question.dimension}
                        indicator={question.indicator}
                        question={resolveQuestion(question.question)}
                        options={question.options.map(resolveQuestion)}
                        selectedOption={answer?.selectedOption}
                        isActive={index === activeQuestionIndex}
                        isLocked={isLocked}
                        onSelectOption={(optionIndex) => {
                          answerQuestion(
                            question.dimension,
                            question.indicator,
                            question.question,
                            optionIndex,
                            question.options[optionIndex]
                          );
                          setNavigationError('');

                          // Skip logic pour dimensions non-Culture
                          if (index === 0 && !isCultureDimension) {
                            if (optionIndex === 0) {
                              remainingQuestions.forEach((q) => {
                                answerQuestion(q.dimension, q.indicator, q.question, 0, q.options[0]);
                              });
                            } else {
                              removeAnswersForQuestions(remainingQuestions);
                            }
                          }

                          // skipNextIf logic
                          if (question.skipNextIf) {
                            const nextQ = currentDimensionQuestions[index + 1];
                            if (nextQ) {
                              if (question.skipNextIf.includes(optionIndex)) {
                                answerQuestion(nextQ.dimension, nextQ.indicator, nextQ.question, 0, nextQ.options[0]);
                              } else {
                                removeAnswersForQuestions([nextQ]);
                              }
                            }
                          }

                          setTimeout(() => {
                            if (index < visibleQuestions.length - 1) {
                              setActiveQuestionIndex(index + 1);
                            }
                          }, 300);
                        }}
                      />
                    );
                  })}

                </div>
              );
            })()}

            {/* Navigation Error Alert */}
            {navigationError && (
              <Card className="mb-6 p-4 bg-red-50 border border-red-200">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 font-medium">{navigationError}</p>
                </div>
              </Card>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-8 border-t border-border">
              <Button
                onClick={handleNavigateToPrevious}
                disabled={currentDimensionIndex === 0}
                variant="outline"
                className="gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Précédent
              </Button>

              <div className="text-sm text-muted-foreground">
                Dimension {currentDimensionIndex + 1} sur {dimensions.length}
              </div>

              <Button
                onClick={handleNavigateToNext}
                disabled={currentDimensionIndex === dimensions.length - 1}
                className="gap-2"
                variant={!isCurrentDimensionComplete() ? 'destructive' : 'default'}
              >
                Suivant
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Completion Message */}
            {isQuestionnaireComplete && (
              <Card className="mt-8 p-6 bg-emerald-50 border-emerald-200">
                <h3 className="text-lg font-semibold text-emerald-900 mb-2">
                  ✓ Questionnaire complété !
                </h3>
                <p className="text-emerald-800 mb-4">
                  Vous avez répondu à toutes les questions. Cliquez sur Submit pour envoyer vos réponses.
                </p>
                <Button
                  onClick={handleSendByEmail}
                  disabled={isSending}
                  className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                  size="lg"
                >
                  <Mail className="w-5 h-5" />
                  {isSending ? 'Envoi en cours...' : 'Submit'}
                </Button>
                {sendStatus === 'success' && (
                  <p className="text-sm text-emerald-700 text-center mt-2">✓ Email envoyé avec succès !</p>
                )}
                {sendStatus === 'error' && (
                  <p className="text-sm text-amber-700 text-center mt-2">EmailJS non configuré — fichiers téléchargés localement.</p>
                )}
              </Card>
            )}
          </div>
        </div>
      </div>


      {/* Dimension Glossary Dialog */}
      <Dialog open={showDimensionGlossary} onOpenChange={setShowDimensionGlossary}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-violet-600" />
              {currentDimensionName}
            </DialogTitle>
            <DialogDescription>
              Quelques termes clés pour mieux comprendre les questions de cette dimension.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            {(DIMENSION_GLOSSARY[currentDimensionName] ?? []).map(({ term, definition }) => (
              <div key={term} className="border-l-4 border-violet-400 pl-4 py-1">
                <p className="text-sm font-semibold text-foreground">{term}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{definition}</p>
              </div>
            ))}
          </div>
          <Button
            className="w-full mt-4 bg-violet-600 hover:bg-violet-700 text-white"
            onClick={() => {
              setAcknowledgedDimensions((prev) => new Set(prev).add(currentDimensionName));
              setShowDimensionGlossary(false);
            }}
          >
            J'ai compris, continuer
          </Button>
        </DialogContent>
      </Dialog>

      {/* Reset Dialog */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogTitle>Réinitialiser le questionnaire ?</AlertDialogTitle>
          <AlertDialogDescription>
            Cette action supprimera toutes vos réponses et vous ramènera à la
            page d'identification. Cette action ne peut pas être annulée.
          </AlertDialogDescription>
          <div className="flex justify-end gap-2">
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleReset} className="bg-destructive">
              Réinitialiser
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}