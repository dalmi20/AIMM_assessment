import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { CheckCircle2, AlertCircle, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useRef } from 'react';

interface QuestionCardProps {
  dimension: string;
  indicator: string;
  question: string;
  options: string[];
  selectedOption: number | undefined;
  onSelectOption: (optionIndex: number) => void;
  isActive?: boolean; // Nouvelle prop pour indiquer si c'est la question active
}

export function QuestionCard({
  dimension,
  indicator,
  question,
  options,
  selectedOption,
  onSelectOption,
  isActive = false,
}: QuestionCardProps) {
  const isAnswered = selectedOption !== undefined;
  const cardRef = useRef<HTMLDivElement>(null);

  // Auto-scroll vers la question active
  useEffect(() => {
    if (isActive && cardRef.current) {
      cardRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [isActive]);

  return (
    <Card
      ref={cardRef}
      className={cn(
        "p-6 mb-6 transition-all duration-500 relative",
        isActive
          ? "border-2 border-blue-400 shadow-lg bg-blue-50/40 ring-2 ring-blue-200"
          : isAnswered
          ? "border-l-4 border-l-emerald-500 shadow-md bg-emerald-50/10"
          : "border-l-4 border-l-slate-300 shadow-sm bg-slate-50/30"
      )}
    >
      {/* Indicateur d'activité */}
      {isActive && (
        <div className="absolute top-3 right-3 flex items-center gap-1.5 text-blue-600 bg-blue-100 px-2.5 py-1 rounded-full text-xs font-bold animate-pulse">
          <Zap className="w-3.5 h-3.5" />
          <span>Actuelle</span>
        </div>
      )}

      <div className="mb-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 pr-24">
            <p className={cn(
              "text-xs font-semibold uppercase tracking-wide transition-colors",
              isActive ? "text-blue-600" : "text-primary"
            )}>
              {indicator}
            </p>
            <h3 className={cn(
              "font-semibold mt-2 transition-colors",
              isActive ? "text-lg text-blue-900" : "text-lg text-foreground"
            )}>
              {question}
            </h3>
          </div>
          <div className="flex items-center gap-2 ml-4 flex-shrink-0">
            {isAnswered ? (
              <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-100 px-2 py-1 rounded text-xs font-medium">
                <CheckCircle2 className="w-4 h-4" />
                <span>Répondu</span>
              </div>
            ) : isActive ? (
              <div className="flex items-center gap-1.5 text-blue-600 bg-blue-100 px-2 py-1 rounded text-xs font-medium animate-pulse">
                <AlertCircle className="w-4 h-4" />
                <span>Répondez</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-slate-500 bg-slate-100 px-2 py-1 rounded text-xs font-medium">
                <AlertCircle className="w-4 h-4" />
                <span>Attente</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <RadioGroup
        value={selectedOption !== undefined ? String(selectedOption) : ''}
        onValueChange={(value) => onSelectOption(parseInt(value))}
      >
        <div className="space-y-3">
          {options.map((option, index) => (
            <div
              key={index}
              className={cn(
                "flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer",
                selectedOption === index
                  ? "border-emerald-500 bg-emerald-50 shadow-md"
                  : isActive
                  ? "border-blue-300 bg-blue-50 hover:border-blue-400 hover:bg-blue-100"
                  : "border-slate-200 bg-slate-50 hover:border-slate-300"
              )}
              onClick={() => onSelectOption(index)}
            >
              <RadioGroupItem
                value={String(index)}
                id={`${indicator}-option-${index}`}
                className="mt-0.5"
              />
              <Label
                htmlFor={`${indicator}-option-${index}`}
                className={cn(
                  "flex-1 cursor-pointer text-sm transition-colors py-1",
                  selectedOption === index
                    ? "text-emerald-700 font-medium"
                    : isActive
                    ? "text-blue-900 font-medium"
                    : "text-foreground"
                )}
              >
                {option}
              </Label>
            </div>
          ))}
        </div>
      </RadioGroup>
    </Card>
  );
}