import { useState } from 'react';
import { useGeolocation } from '../../hooks/useGeolocation';

interface ProfileStepProps {
  onSubmit: (data: { displayName: string; city: string; state: string }) => void;
}

export default function ProfileStep({ onSubmit }: ProfileStepProps) {
  const [displayName, setDisplayName] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const {
    detect: detectGeo,
    isLoading: geoLoading,
    error: geoError,
  } = useGeolocation();

  const detect = () => {
    detectGeo((result) => {
      setCity(result.city);
      setState(result.state);
    });
  };

  const isValid = displayName.trim() !== '' && city.trim() !== '' && state.trim() !== '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    onSubmit({ displayName: displayName.trim(), city: city.trim(), state: state.trim() });
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm mx-auto">
      <h1 className="font-display text-2xl text-navy text-center mb-2">
        Welcome to SwipeForCause
      </h1>
      <p className="font-body text-navy/60 text-center text-sm mb-6">
        Tell us a bit about yourself
      </p>

      <div className="space-y-4">
        <div>
          <label htmlFor="displayName" className="block text-sm font-body font-medium text-navy mb-1">
            Display Name
          </label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="How should we call you?"
            maxLength={100}
            className="w-full rounded-lg border border-navy/20 bg-white px-4 py-3 font-body text-navy placeholder:text-navy/40 focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral"
            required
          />
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label htmlFor="city" className="block text-sm font-body font-medium text-navy mb-1">
              City
            </label>
            <input
              id="city"
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="City"
              maxLength={100}
              className="w-full rounded-lg border border-navy/20 bg-white px-4 py-3 font-body text-navy placeholder:text-navy/40 focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral"
              required
            />
          </div>
          <div className="w-24">
            <label htmlFor="state" className="block text-sm font-body font-medium text-navy mb-1">
              State
            </label>
            <input
              id="state"
              type="text"
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder="ST"
              maxLength={50}
              className="w-full rounded-lg border border-navy/20 bg-white px-4 py-3 font-body text-navy placeholder:text-navy/40 focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral"
              required
            />
          </div>
        </div>

        <button
          type="button"
          onClick={detect}
          disabled={geoLoading}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-teal/30 bg-teal/5 px-4 py-2.5 font-body text-sm text-teal hover:bg-teal/10 transition-colors disabled:opacity-50"
        >
          {geoLoading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-teal border-t-transparent" />
              Detecting...
            </>
          ) : (
            'Use my location'
          )}
        </button>
        {geoError && <p className="text-xs text-red-500 font-body">{geoError}</p>}
      </div>

      <button
        type="submit"
        disabled={!isValid}
        className="mt-6 w-full rounded-lg bg-coral py-3 font-body font-semibold text-white transition-colors hover:bg-coral/90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Continue
      </button>
    </form>
  );
}
