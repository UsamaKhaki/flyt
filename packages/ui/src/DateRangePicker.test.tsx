import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import {
  DateRangePicker,
  formatIsoDate,
  isoToLocalDate,
  localDateToIso,
  type IsoDateRange,
} from './DateRangePicker';

interface HarnessProps {
  oneWay?: boolean;
  minDate?: string;
  initialFrom?: string;
}

function Harness({
  oneWay = false,
  minDate = '2026-11-20',
  initialFrom = '2026-12-01',
}: HarnessProps) {
  const [value, setValue] = useState<IsoDateRange>({ from: initialFrom });
  return (
    <>
      <DateRangePicker value={value} onChange={setValue} oneWay={oneWay} minDate={minDate} />
      <p data-testid="value">{JSON.stringify(value)}</p>
    </>
  );
}

describe('date conversion', () => {
  it('round-trips an ISO date through a local Date', () => {
    expect(localDateToIso(isoToLocalDate('2026-03-29'))).toBe('2026-03-29');
    expect(isoToLocalDate('2026-03-29').getDate()).toBe(29);
  });

  it('formats a date for display', () => {
    expect(formatIsoDate('2026-12-01')).toBe('Tue 1 Dec');
  });
});

describe('DateRangePicker', () => {
  it('selects a return date after the departure date', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole('button', { name: 'Tue 1 Dec → Return' }));
    await user.click(screen.getByRole('button', { name: /December 8th, 2026/ }));
    expect(screen.getByTestId('value')).toHaveTextContent(
      '{"from":"2026-12-01","to":"2026-12-08"}',
    );
  });

  it('disables days before the minimum date', async () => {
    const user = userEvent.setup();
    render(<Harness minDate="2026-12-03" initialFrom="2026-12-05" />);
    await user.click(screen.getByRole('button', { name: /Return/ }));
    expect(screen.getByRole('button', { name: /December 2nd, 2026/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: /December 3rd, 2026/ })).toBeEnabled();
  });

  it('closes after picking a single date in one-way mode', async () => {
    const user = userEvent.setup();
    render(<Harness oneWay />);
    await user.click(screen.getByRole('button', { name: 'Tue 1 Dec' }));
    await user.click(screen.getByRole('button', { name: /December 5th, 2026/ }));
    expect(screen.getByTestId('value')).toHaveTextContent('{"from":"2026-12-05"}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
