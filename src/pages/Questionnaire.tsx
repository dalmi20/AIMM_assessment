import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
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
  Download,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Menu,
  FileText,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { generatePDF } from '@/lib/pdfExport';

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
  } = useQuestionnaire();

  // Whether the user has confirmed their info & role and entered the questionnaire
  const [questionnaireStarted, setQuestionnaireStarted] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [navigationError, setNavigationError] = useState('');

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

  const handleExportJSON = () => {
    const jsonData = exportAnswers();
    const element = document.createElement('a');
    element.setAttribute(
      'href',
      'data:text/json;charset=utf-8,' + encodeURIComponent(jsonData)
    );
    const safeName = `${userInfo.lastName || 'export'}_${userInfo.firstName || ''}`.replace(/\s+/g, '_');
    element.setAttribute(
      'download',
      `questionnaire-${safeName}-${new Date().toISOString().split('T')[0]}.json`
    );
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleExportPDF = () => {
    generatePDF({
      userInfo,
      role: selectedRole || '',
      answers,
      totalQuestions: filteredQuestions.length,
      completionPercentage: progress,
    });
  };

  const handleReset = () => {
    reset();
    setQuestionnaireStarted(false);
    setShowResetDialog(false);
    setNavigationError('');
  };

  const handleChangeRole = () => {
    setSelectedRole(null);
    setQuestionnaireStarted(false);
    setNavigationError('');
  };

  const handleNavigateToPrevious = () => {
    setNavigationError('');
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
            onConfirm={() => setQuestionnaireStarted(true)}
          />
        </div>
      </div>
    );
  }

  const roleLabel =
    selectedRole === 'Stratégique: un responsable de service, chef de projet'
      ? 'Rôle Stratégique'
      : 'Tous les Acteurs';

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
            <div className="sticky top-24 space-y-6">
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
                  Rôle actif
                </p>
                <p className="text-sm font-medium text-foreground">
                  {roleLabel}
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
                {!isQuestionnaireComplete && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700">
                      Veuillez répondre à toutes les questions ({answers.length}/{filteredQuestions.length}) pour activer l'export.
                    </p>
                  </div>
                )}
                <Button
                  onClick={handleExportJSON}
                  disabled={!isQuestionnaireComplete}
                  className="w-full gap-2"
                  variant="default"
                >
                  <Download className="w-4 h-4" />
                  Exporter JSON
                </Button>
                <Button
                  onClick={handleExportPDF}
                  disabled={!isQuestionnaireComplete}
                  className="w-full gap-2"
                  variant="outline"
                >
                  <FileText className="w-4 h-4" />
                  Exporter PDF
                </Button>
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
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-3xl font-bold text-foreground">
                  {currentDimensionName}
                </h2>
                {isCurrentDimensionComplete() && (
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 flex-shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Progress
                    value={getDimensionProgress(currentDimensionName)}
                    className="h-2"
                  />
                </div>
                <span className="text-sm font-medium text-muted-foreground">
                  {getDimensionProgress(currentDimensionName)}%
                </span>
              </div>
            </div>

            {/* Questions */}
            <div className="space-y-6 mb-8">
              {currentDimensionQuestions.map((question, index) => {
                const answer = getAnswer(
                  question.dimension,
                  question.indicator,
                  question.question
                );

                return (
                  <QuestionCard
                    key={index}
                    dimension={question.dimension}
                    indicator={question.indicator}
                    question={question.question}
                    options={question.options}
                    selectedOption={answer?.selectedOption}
                    onSelectOption={(optionIndex) => {
                      answerQuestion(
                        question.dimension,
                        question.indicator,
                        question.question,
                        optionIndex,
                        question.options[optionIndex]
                      );
                      setNavigationError('');
                    }}
                  />
                );
              })}
            </div>

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
                  Vous avez répondu à toutes les questions. Vous pouvez maintenant
                  exporter vos réponses en JSON ou PDF.
                </p>
                <div className="flex gap-2">
                  <Button onClick={handleExportJSON} className="gap-2 flex-1">
                    <Download className="w-4 h-4" />
                    Exporter JSON
                  </Button>
                  <Button onClick={handleExportPDF} variant="outline" className="gap-2 flex-1">
                    <FileText className="w-4 h-4" />
                    Exporter PDF
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

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