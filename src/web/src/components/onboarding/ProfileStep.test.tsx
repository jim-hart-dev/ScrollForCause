import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import ProfileStep from './ProfileStep';

vi.mock('../../hooks/useGeolocation', () => ({
  useGeolocation: () => ({
    detect: vi.fn(),
    isLoading: false,
    error: null,
  }),
}));

describe('ProfileStep', () => {
  it('renders all form fields', () => {
    render(<ProfileStep onSubmit={vi.fn()} />);
    expect(screen.getByLabelText('Display Name')).toBeInTheDocument();
    expect(screen.getByLabelText('City')).toBeInTheDocument();
    expect(screen.getByLabelText('State')).toBeInTheDocument();
  });

  it('renders the "Use my location" button', () => {
    render(<ProfileStep onSubmit={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Use my location' })).toBeInTheDocument();
  });

  it('has Continue button disabled when fields are empty', () => {
    render(<ProfileStep onSubmit={vi.fn()} />);
    const continueBtn = screen.getByRole('button', { name: 'Continue' });
    expect(continueBtn).toBeDisabled();
  });

  it('calls onSubmit with trimmed values when form is valid', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ProfileStep onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText('Display Name'), '  Jane Doe  ');
    await user.type(screen.getByLabelText('City'), '  Portland  ');
    await user.type(screen.getByLabelText('State'), '  OR  ');

    const continueBtn = screen.getByRole('button', { name: 'Continue' });
    expect(continueBtn).toBeEnabled();

    await user.click(continueBtn);

    expect(onSubmit).toHaveBeenCalledWith({
      displayName: 'Jane Doe',
      city: 'Portland',
      state: 'OR',
    });
  });

  it('does not call onSubmit when fields contain only whitespace', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ProfileStep onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText('Display Name'), '   ');
    await user.type(screen.getByLabelText('City'), '   ');
    await user.type(screen.getByLabelText('State'), '   ');

    const continueBtn = screen.getByRole('button', { name: 'Continue' });
    expect(continueBtn).toBeDisabled();
  });
});
