import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ChevronRight, CheckCircle2 } from 'lucide-react';

interface DimensionNavProps {
  dimensions: [string, any[]][];
  currentDimensionIndex: number;
  onSelectDimension: (index: number) => void;
  getDimensionProgress: (dimensionName: string) => number;
}

export function DimensionNav({
  dimensions,
  currentDimensionIndex,
  onSelectDimension,
  getDimensionProgress,
}: DimensionNavProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-4">
        Dimensions
      </h3>
      <div className="space-y-2">
        {dimensions.map((dimension, index) => {
          const [dimensionName] = dimension;
          const progress = getDimensionProgress(dimensionName);
          const isActive = index === currentDimensionIndex;
          const isComplete = progress === 100;

          return (
            <Button
              key={dimensionName}
              variant={isActive ? 'default' : 'ghost'}
              className={`w-full justify-start text-left h-auto py-3 px-4 ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              }`}
              onClick={() => onSelectDimension(index)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  {isComplete && (
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-500" />
                  )}
                  <span className="font-medium truncate">{dimensionName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={progress} className="flex-1 h-1.5" />
                  <span className="text-xs font-medium flex-shrink-0 w-8 text-right">
                    {progress}%
                  </span>
                </div>
              </div>
              {isActive && <ChevronRight className="w-4 h-4 flex-shrink-0 ml-2" />}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
