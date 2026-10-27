import type { CabinClass, Travellers } from '@flyt/flight-api';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { stepperBounds, summarizeTravellers, TravellerSelector } from './TravellerSelector';

function Harness({ initial }: { initial: Travellers }) {
  const [value, setValue] = useState(initial);
  const [cabin, setCabin] = useState<CabinClass>('economy');
  return (
    <TravellerSelector value={value} cabin={cabin} onChange={setValue} onCabinChange={setCabin} />
  );
}

describe('stepperBounds', () => {
  it('keeps at least one adult, and never fewer adults than infants', () => {
    expect(stepperBounds({ adults: 1, children: 0, infants: 0 }, 'adults').min).toBe(1);
    expect(stepperBounds({ adults: 3, children: 0, infants: 2 }, 'adults').min).toBe(2);
  });

  it('caps infants at the number of adults', () => {
    expect(stepperBounds({ adults: 2, children: 0, infants: 2 }, 'infants').max).toBe(2);
  });

  it('caps every row so the total stays at nine', () => {
    const full = { adults: 4, children: 4, infants: 1 };
    expect(stepperBounds(full, 'adults').max).toBe(4);
    expect(stepperBounds(full, 'children').max).toBe(4);
    expect(stepperBounds(full, 'infants').max).toBe(1);
  });
});

describe('summarizeTravellers', () => {
  it('pluralises and names the cabin', () => {
    expect(summarizeTravellers({ adults: 1, children: 0, infants: 0 }, 'economy')).toBe(
      '1 traveller, Economy',
    );
    expect(summarizeTravellers({ adults: 2, children: 1, infants: 0 }, 'business')).toBe(
      '3 travellers, Business',
    );
  });
});

describe('TravellerSelector', () => {
  it('opens a panel and updates counts with the steppers', async () => {
    const user = userEvent.setup();
    render(<Harness initial={{ adults: 1, children: 0, infants: 0 }} />);

    await user.click(screen.getByRole('button', { name: '1 traveller, Economy' }));
    expect(screen.getByRole('dialog', { name: 'Travellers and cabin class' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remove one adults' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Add one adults' }));
    await user.click(screen.getByRole('button', { name: 'Add one children' }));
    expect(screen.getByRole('button', { name: '3 travellers, Economy' })).toBeInTheDocument();
  });

  it('blocks adding an infant beyond the number of adults', async () => {
    const user = userEvent.setup();
    render(<Harness initial={{ adults: 1, children: 0, infants: 0 }} />);
    await user.click(screen.getByRole('button', { name: /traveller/ }));

    const addInfant = screen.getByRole('button', { name: 'Add one infants' });
    await user.click(addInfant);
    expect(addInfant).toBeDisabled();
  });

  it('changes cabin class', async () => {
    const user = userEvent.setup();
    render(<Harness initial={{ adults: 2, children: 0, infants: 0 }} />);
    await user.click(screen.getByRole('button', { name: /travellers/ }));
    await user.click(screen.getByRole('radio', { name: 'First' }));
    expect(screen.getByRole('button', { name: '2 travellers, First' })).toBeInTheDocument();
  });

  it('closes on Escape and returns focus to the trigger', async () => {
    const user = userEvent.setup();
    render(<Harness initial={{ adults: 1, children: 0, infants: 0 }} />);
    const trigger = screen.getByRole('button', { name: /traveller/ });
    await user.click(trigger);
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes when clicking outside', async () => {
    const user = userEvent.setup();
    render(
      <>
        <Harness initial={{ adults: 1, children: 0, infants: 0 }} />
        <p>Outside</p>
      </>,
    );
    await user.click(screen.getByRole('button', { name: /traveller/ }));
    await user.click(screen.getByText('Outside'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
