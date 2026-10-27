import { MAX_TRAVELLERS } from '@flyt/flight-api';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Help',
  description: 'Answers to common questions about searching and booking flights through Flyt.',
};

const FAQS = [
  {
    question: 'Did I book with Flyt?',
    answer:
      'No. Flyt only compares prices. Your booking, payment and ticket are with the airline or travel agent you chose, and their confirmation email has your booking reference.',
  },
  {
    question: 'How do I change or cancel a booking?',
    answer:
      'Contact the partner you booked with. Only they can change your ticket, and their fare rules decide whether a change or refund is possible.',
  },
  {
    question: 'Why is the price on the partner site different?',
    answer:
      'Some prices are cached for a short time. If seats sell in the meantime, the partner will show the current price before you pay. Check that baggage and seat options match what you expected too.',
  },
  {
    question: 'Does Flyt add booking fees?',
    answer: 'No. Partners pay us a referral fee, so the price you see is what the partner charges.',
  },
  {
    question: 'How many people can I search for?',
    answer: `Up to ${MAX_TRAVELLERS} travellers per booking, the limit most airlines use. Infants under 2 travel on an adult's lap, so you can add one infant per adult. For bigger groups, split the search or contact an airline's group desk.`,
  },
  {
    question: 'Are the prices for one person or everyone?',
    answer:
      'Prices on the results page are totals for everyone in your search, including the return flight on a return trip.',
  },
  {
    question: 'Why do I not see real airlines?',
    answer:
      'Flyt is a portfolio project. It runs on a mock data provider with made-up airlines and agents, so no prices are real and no bookings are made.',
  },
];

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold sm:text-4xl">Help</h1>
      <p className="mt-2 text-ink-300">
        Quick answers about searching and booking. For how we work and make money, see{' '}
        <Link href="/how-it-works" className="text-amber-300 hover:underline">
          How it works
        </Link>
        .
      </p>
      <div className="mt-8 divide-y divide-ink-800 border-y border-ink-800">
        {FAQS.map((faq) => (
          <details key={faq.question} className="group py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
              {faq.question}
              <span aria-hidden className="text-amber-300 transition group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-3 text-ink-300">{faq.answer}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
