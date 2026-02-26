import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

interface QuestionCardProps {
  dimension: string;
  indicator: string;
  question: string;
  options: string[];
  selectedOption: number | undefined;
  onSelectOption: (optionIndex: number) => void;
}

export function QuestionCard({
  dimension,
  indicator,
  question,
  options,
  selectedOption,
  onSelectOption,
}: QuestionCardProps) {
  return (
    <Card className="p-6 mb-6 border-l-4 border-l-primary hover:shadow-md transition-shadow">
      <div className="mb-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <p className="text-xs font-semibold text-primary uppercase tracking-wide">
              {indicator}
            </p>
            <h3 className="text-lg font-semibold text-foreground mt-2">
              {question}
            </h3>
          </div>
          {selectedOption !== undefined && (
            <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 ml-2" />
          )}
        </div>
      </div>

      <RadioGroup
        value={selectedOption !== undefined ? String(selectedOption) : ''}
        onValueChange={(value) => onSelectOption(parseInt(value))}
      >
        <div className="space-y-3">
          {options.map((option, index) => (
            <div key={index} className="flex items-start space-x-3">
              <RadioGroupItem
                value={String(index)}
                id={`${indicator}-option-${index}`}
                className="mt-1"
              />
              <Label
                htmlFor={`${indicator}-option-${index}`}
                className="flex-1 cursor-pointer text-sm text-foreground hover:text-primary transition-colors py-2"
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
