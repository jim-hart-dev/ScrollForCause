const steps = ['Account', 'Profile', 'Interests'];

interface StepIndicatorProps {
  currentStep: number;
}

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((label, index) => {
        const stepNum = index + 1;
        const isCompleted = stepNum < currentStep;
        const isCurrent = stepNum === currentStep;

        return (
          <div key={label} className="flex items-center gap-2">
            {index > 0 && (
              <div
                className={`h-px w-8 ${isCompleted ? 'bg-coral' : 'bg-navy/20'}`}
              />
            )}
            <div className="flex items-center gap-1.5">
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                  isCompleted
                    ? 'bg-coral text-white'
                    : isCurrent
                      ? 'border-2 border-coral text-coral'
                      : 'border-2 border-navy/20 text-navy/40'
                }`}
              >
                {isCompleted ? '\u2713' : stepNum}
              </div>
              <span
                className={`text-xs font-body ${isCurrent ? 'text-navy font-semibold' : 'text-navy/40'}`}
              >
                {label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
