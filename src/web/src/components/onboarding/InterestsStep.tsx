import { useState } from 'react';
import { useCategories } from '../../hooks/useCategories';

const CATEGORY_EMOJIS: Record<string, string> = {
  environment: '\uD83C\uDF3F',
  education: '\uD83D\uDCDA',
  health: '\u2764\uFE0F',
  animals: '\uD83D\uDC3E',
  seniors: '\uD83D\uDC74',
  youth: '\u2B50',
  'disaster-relief': '\uD83D\uDEE1\uFE0F',
  'arts-culture': '\uD83C\uDFA8',
  'food-security': '\uD83C\uDF72',
  housing: '\uD83C\uDFE0',
};

interface InterestsStepProps {
  onSubmit: (categoryIds: string[]) => void;
  onSkip: () => void;
  isSubmitting: boolean;
}

export default function InterestsStep({ onSubmit, onSkip, isSubmitting }: InterestsStepProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const { data: categories, isLoading } = useCategories();

  const toggleCategory = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSubmit = () => {
    onSubmit([...selected]);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-coral border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <h1 className="font-display text-2xl text-navy text-center mb-2">What interests you?</h1>
      <p className="font-body text-navy/60 text-center text-sm mb-6">
        Pick causes you care about. You can change these later.
      </p>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {categories?.map((category) => {
          const isSelected = selected.has(category.categoryId);
          return (
            <button
              key={category.categoryId}
              type="button"
              onClick={() => toggleCategory(category.categoryId)}
              className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 p-4 transition-all min-h-[80px] ${
                isSelected
                  ? 'border-coral bg-coral/10 shadow-sm'
                  : 'border-navy/10 bg-white hover:border-navy/20'
              }`}
            >
              <span className="text-2xl">{CATEGORY_EMOJIS[category.slug] ?? '\uD83D\uDCCC'}</span>
              <span
                className={`text-xs font-body font-medium ${isSelected ? 'text-coral' : 'text-navy/70'}`}
              >
                {category.name}
              </span>
            </button>
          );
        })}
      </div>

      {selected.size > 0 && (
        <p className="text-center text-xs font-body text-navy/50 mb-4">
          {selected.size} selected
        </p>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full rounded-lg bg-coral py-3 font-body font-semibold text-white transition-colors hover:bg-coral/90 disabled:opacity-50"
      >
        {isSubmitting
          ? 'Creating profile...'
          : selected.size > 0
            ? 'Continue'
            : 'Continue without selecting'}
      </button>

      <button
        type="button"
        onClick={onSkip}
        disabled={isSubmitting}
        className="mt-2 w-full rounded-lg py-2.5 font-body text-sm text-navy/50 hover:text-navy/70 transition-colors disabled:opacity-50"
      >
        Skip for now
      </button>
    </div>
  );
}
