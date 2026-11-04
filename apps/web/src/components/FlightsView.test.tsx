import { addDays } from '@flyt/flight-api';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { todayIso } from '@/lib/dates';
import { FlightsView } from './FlightsView';

let search = '';
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(search),
}));

const depart = addDays(todayIso(), 30);

describe('FlightsView', () => {
  beforeEach(() => {
    search = '';
  });

  it('shows the search form when the URL has no search', () => {
    render(<FlightsView />);
    expect(screen.getByRole('heading', { name: 'Search flights' })).toBeInTheDocument();
  });

  it('explains what is missing from an incomplete search', () => {
    search = 'from=DXB';
    render(<FlightsView />);
    expect(screen.getByRole('alert')).toHaveTextContent('Choose where you are flying to.');
  });

  it('runs the search from the URL in the browser', async () => {
    search = `from=DXB&to=LHR&depart=${depart}`;
    render(<FlightsView />);
    expect(screen.getByRole('status')).toHaveTextContent('Searching fares');
    expect(await screen.findByRole('heading', { name: 'Dubai to London' })).toBeInTheDocument();
    expect(screen.getByText(/\d+ of \d+ results/)).toBeInTheDocument();
  });
});
