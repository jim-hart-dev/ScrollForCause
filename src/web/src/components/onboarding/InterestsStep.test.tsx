import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import InterestsStep from './InterestsStep';

vi.mock('../../hooks/useCategories', () => ({
  useCategories: () => ({
    data: [
      { categoryId: 'cat-1', name: 'Environment', slug: 'environment', icon: null },
      { categoryId: 'cat-2', name: 'Education', slug: 'education', icon: null },
      { categoryId: 'cat-3', name: 'Health', slug: 'health', icon: null },
    ],
    isLoading: false,
  }),
}));

describe('InterestsStep', () => {
  const defaultProps = {
    onSubmit: vi.fn(),
    onSkip: vi.fn(),
    isSubmitting: false,
  };

  it('renders category tiles', () => {
    render(<InterestsStep {...defaultProps} />);
    expect(screen.getByText('Environment')).toBeInTheDocument();
    expect(screen.getByText('Education')).toBeInTheDocument();
    expect(screen.getByText('Health')).toBeInTheDocument();
  });

  it('toggles category selection on click and shows selected count', async () => {
    const user = userEvent.setup();
    render(<InterestsStep {...defaultProps} />);

    await user.click(screen.getByText('Environment'));
    expect(screen.getByText('1 selected')).toBeInTheDocument();

    await user.click(screen.getByText('Education'));
    expect(screen.getByText('2 selected')).toBeInTheDocument();

    // Deselect one
    await user.click(screen.getByText('Environment'));
    expect(screen.getByText('1 selected')).toBeInTheDocument();
  });

  it('calls onSubmit with selected category IDs when Continue clicked', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<InterestsStep {...defaultProps} onSubmit={onSubmit} />);

    await user.click(screen.getByText('Environment'));
    await user.click(screen.getByText('Health'));

    await user.click(screen.getByRole('button', { name: 'Continue' }));
    expect(onSubmit).toHaveBeenCalledWith(expect.arrayContaining(['cat-1', 'cat-3']));
    expect(onSubmit.mock.calls[0][0]).toHaveLength(2);
  });

  it('calls onSkip when "Skip for now" is clicked', async () => {
    const user = userEvent.setup();
    const onSkip = vi.fn();
    render(<InterestsStep {...defaultProps} onSkip={onSkip} />);

    await user.click(screen.getByRole('button', { name: 'Skip for now' }));
    expect(onSkip).toHaveBeenCalledOnce();
  });

  it('shows "Creating profile..." when isSubmitting is true', () => {
    render(<InterestsStep {...defaultProps} isSubmitting={true} />);
    expect(screen.getByText('Creating profile...')).toBeInTheDocument();
  });

  it('shows "Continue without selecting" when nothing is selected', () => {
    render(<InterestsStep {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Continue without selecting' })).toBeInTheDocument();
  });
});
