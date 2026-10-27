import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SearchForm } from './SearchForm';

const push = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));

const initial = { origin: 'DXB', departDate: '2026-12-01', returnDate: '2026-12-08' };

describe('SearchForm', () => {
  beforeEach(() => push.mockReset());

  it('picks a destination from the airport list and navigates to results', async () => {
    const user = userEvent.setup();
    render(<SearchForm today="2026-11-01" initial={initial} />);

    await user.type(screen.getByRole('combobox', { name: 'To' }), 'lon');
    await user.click(screen.getByRole('option', { name: /London/ }));
    await user.click(screen.getByRole('button', { name: 'Search' }));

    expect(push).toHaveBeenCalledWith(
      '/flights?from=DXB&to=LHR&depart=2026-12-01&return=2026-12-08&adults=1&cabin=economy',
    );
  });

  it('supports choosing an airport with the keyboard', async () => {
    const user = userEvent.setup();
    render(<SearchForm today="2026-11-01" initial={initial} />);

    await user.type(screen.getByRole('combobox', { name: 'To' }), 'united states');
    await user.keyboard('{ArrowDown}{Enter}');
    expect(screen.getByRole('combobox', { name: 'To' })).toHaveValue('Miami (MIA)');
  });

  it('shows an error instead of navigating when the destination is missing', async () => {
    const user = userEvent.setup();
    render(<SearchForm today="2026-11-01" initial={initial} />);

    await user.click(screen.getByRole('button', { name: 'Search' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Choose both airports from the list.');
    expect(push).not.toHaveBeenCalled();
  });

  it('swaps origin and destination', async () => {
    const user = userEvent.setup();
    render(<SearchForm today="2026-11-01" initial={{ ...initial, destination: 'SIN' }} />);

    await user.click(screen.getByRole('button', { name: 'Swap origin and destination' }));
    expect(screen.getByRole('combobox', { name: 'From' })).toHaveValue('Singapore (SIN)');
    expect(screen.getByRole('combobox', { name: 'To' })).toHaveValue('Dubai (DXB)');
  });

  it('drops the return date for one-way trips', async () => {
    const user = userEvent.setup();
    render(<SearchForm today="2026-11-01" initial={{ ...initial, destination: 'LHR' }} />);

    await user.click(screen.getByRole('radio', { name: 'One way' }));
    await user.click(screen.getByRole('button', { name: 'Search' }));
    expect(push).toHaveBeenCalledWith(
      '/flights?from=DXB&to=LHR&depart=2026-12-01&adults=1&cabin=economy',
    );
  });
});
