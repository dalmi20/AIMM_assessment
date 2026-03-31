import { Progress } from '@/components/ui/progress';
import { CheckCircle2 } from 'lucide-react';

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

      <div className="flex gap-3">
        {/* Vertical stepper track */}
        <div className="relative flex flex-col items-center flex-shrink-0" style={{ width: 16 }}>
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-border rounded-full" />
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 bg-primary rounded-full transition-all duration-500"
            style={{
              height: `${(currentDimensionIndex / Math.max(dimensions.length - 1, 1)) * 100}%`,
            }}
          />
          {dimensions.map((dimension, index) => {
            const [name] = dimension;
            const progress = getDimensionProgress(name);
            const isActive = index === currentDimensionIndex;
            const isComplete = progress === 100;
            return (
              <div
                key={name}
                className="relative z-10 flex items-center justify-center"
                style={{ minHeight: 52 }}
              >
                <button
                  onClick={() => onSelectDimension(index)}
                  className={`w-3 h-3 rounded-full border-2 transition-all duration-300 ${
                    isComplete
                      ? 'bg-emerald-500 border-emerald-500'
                      : isActive
                      ? 'bg-primary border-primary scale-125'
                      : 'bg-background border-border hover:border-primary'
                  }`}
                />
              </div>
            );
          })}
        </div>

        {/* Dimension buttons */}
        <div className="flex-1 space-y-1">
          {dimensions.map((dimension, index) => {
            const [dimensionName] = dimension;
            const progress = getDimensionProgress(dimensionName);
            const isActive = index === currentDimensionIndex;
            const isComplete = progress === 100;

            return (
              <button
                key={dimensionName}
                onClick={() => onSelectDimension(index)}
                className={`w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'hover:bg-muted text-foreground'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {isComplete && (
                    <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 text-emerald-600" />
                  )}
                  <span className="text-xs font-medium truncate">{dimensionName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={progress} className="flex-1 h-1" />
                  <span className="text-xs flex-shrink-0 w-7 text-right opacity-70">
                    {progress}%
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
