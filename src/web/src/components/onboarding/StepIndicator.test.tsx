import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import StepIndicator from './StepIndicator';

describe('StepIndicator', () => {
  it('renders all 3 step labels', () => {
    render(<StepIndicator currentStep={1} />);
    expect(screen.getByText('Account')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Interests')).toBeInTheDocument();
  });

  it('highlights the current step with font-semibold', () => {
    render(<StepIndicator currentStep={2} />);
    const profileLabel = screen.getByText('Profile');
    expect(profileLabel).toHaveClass('font-semibold');

    const accountLabel = screen.getByText('Account');
    expect(accountLabel).not.toHaveClass('font-semibold');

    const interestsLabel = screen.getByText('Interests');
    expect(interestsLabel).not.toHaveClass('font-semibold');
  });

  it('shows checkmarks for completed steps', () => {
    render(<StepIndicator currentStep={3} />);
    // Steps 1 and 2 are completed (before currentStep=3), so they show checkmarks
    const checkmarks = screen.getAllByText('\u2713');
    expect(checkmarks).toHaveLength(2);

    // Step 3 (current) shows its number
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('shows step numbers for non-completed, non-current steps', () => {
    render(<StepIndicator currentStep={1} />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });
});
