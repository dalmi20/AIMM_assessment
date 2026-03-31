import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { CheckCircle2, AlertCircle, Zap, Info, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';

interface QuestionCardProps {
  dimension: string;
  indicator: string;
  question: string;
  options: string[];
  selectedOption: number | undefined;
  onSelectOption: (optionIndex: number) => void;
  isActive?: boolean;
  isLocked?: boolean;
  definition?: string;
}

export function QuestionCard({
  dimension,
  indicator,
  question,
  options,
  selectedOption,
  onSelectOption,
  isActive = false,
  isLocked = false,
  definition,
}: QuestionCardProps) {
  const isAnswered = selectedOption !== undefined;
  const cardRef = useRef<HTMLDivElement>(null);
  const [showDefinition, setShowDefinition] = useState(false);

  useEffect(() => {
    if (isActive && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isActive]);

  /* ── Status badge ── */
  const StatusBadge = () => {
    if (isLocked) {
      return (
        <span className="inline-flex items-center gap-1.5 text-slate-400 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full text-xs font-medium">
          <Lock className="w-3.5 h-3.5" />
          Verrouillé
        </span>
      );
    }
    if (isAnswered) {
      return (
        <span className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full text-xs font-medium">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Répondu
        </span>
      );
    }
    if (isActive) {
      return (
        <span className="inline-flex items-center gap-1.5 text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full text-xs font-semibold animate-pulse">
          <Zap className="w-3.5 h-3.5" />
          Actuelle
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 text-slate-400 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-full text-xs font-medium">
        <AlertCircle className="w-3.5 h-3.5" />
        Attente
      </span>
    );
  };

  return (
    <Card
      ref={cardRef}
      className={cn(
        'p-6 mb-5 transition-all duration-300 relative overflow-hidden',
        isLocked
          ? 'border border-slate-200 bg-slate-50/50 opacity-50 pointer-events-none select-none'
          : isActive
            ? 'border-2 border-blue-400 shadow-lg shadow-blue-100/50 bg-gradient-to-br from-blue-50/60 to-white ring-1 ring-blue-200/50'
            : isAnswered
              ? 'border border-emerald-200 shadow-sm bg-gradient-to-br from-emerald-50/30 to-white'
              : 'border border-slate-200 shadow-sm bg-white hover:shadow-md hover:border-slate-300'
      )}
    >
      {/* ── Barre latérale colorée ── */}
      <div
        className={cn(
          'absolute left-0 top-0 bottom-0 w-1 transition-colors duration-300',
          isActive
            ? 'bg-blue-400'
            : isAnswered
              ? 'bg-emerald-400'
              : 'bg-slate-200'
        )}
      />

      {/* ── En-tête ── */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1 min-w-0">
          {/* Indicateur */}
          <p
            className={cn(
              'text-xs font-semibold uppercase tracking-wider',
              isActive ? 'text-blue-600' : 'text-primary/70'
            )}
          >
            {indicator}
          </p>

          {/* Définition (toggle) */}
          {definition && (
            <button
              type="button"
              onClick={() => setShowDefinition((v) => !v)}
              className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Info className="w-3 h-3" />
              <span className="underline decoration-dotted underline-offset-2">
                {showDefinition ? 'Masquer la définition' : 'Voir la définition'}
              </span>
            </button>
          )}
          {definition && showDefinition && (
            <p className="mt-1.5 text-xs text-muted-foreground italic leading-relaxed bg-slate-50 border border-slate-100 rounded-md px-3 py-2">
              {definition}
            </p>
          )}

          {/* Question */}
          <h3
            className={cn(
              'font-semibold mt-3 text-base leading-snug whitespace-pre-line',
              isActive ? 'text-blue-900' : 'text-foreground'
            )}
          >
            {question}
          </h3>
        </div>

        <div className="flex-shrink-0 pt-0.5">
          <StatusBadge />
        </div>
      </div>

      {/* ── Options ── */}
      <RadioGroup
        value={selectedOption !== undefined ? String(selectedOption) : ''}
        onValueChange={(value) => onSelectOption(parseInt(value))}
        className="space-y-2"
      >
        {options.map((option, index) => {
          const isSelected = selectedOption === index;

          return (
            <div
              key={index}
              onClick={() => onSelectOption(index)}
              className={cn(
                'group flex items-center gap-3 px-4 py-3 rounded-lg border transition-all duration-200 cursor-pointer',
                isSelected
                  ? 'border-emerald-400 bg-emerald-50 shadow-sm'
                  : isActive
                    ? 'border-blue-200 bg-blue-50/50 hover:border-blue-300 hover:bg-blue-50'
                    : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-50'
              )}
            >
              <RadioGroupItem
                value={String(index)}
                id={`${indicator}-${index}`}
                className={cn(
                  'flex-shrink-0',
                  isSelected && 'border-emerald-500 text-emerald-500'
                )}
              />
              <Label
                htmlFor={`${indicator}-${index}`}
                className={cn(
                  'flex-1 cursor-pointer text-sm leading-relaxed',
                  isSelected
                    ? 'text-emerald-800 font-medium'
                    : isActive
                      ? 'text-blue-900'
                      : 'text-foreground/80 group-hover:text-foreground'
                )}
              >
                {option}
              </Label>
              {isSelected && (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              )}
            </div>
          );
        })}
      </RadioGroup>
    </Card>
  );
}