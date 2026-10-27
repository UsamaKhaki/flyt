import { z } from 'zod';

export const IataCodeSchema = z
  .string()
  .regex(/^[A-Z]{3}$/, 'Expected a three-letter IATA airport code');

export const CABIN_CLASSES = ['economy', 'premium_economy', 'business', 'first'] as const;
export const CabinClassSchema = z.enum(CABIN_CLASSES);

// Airline rules: at most 9 seats per booking, and every infant travels on an adult's lap.
export const MAX_TRAVELLERS = 9;

export const TravellersSchema = z
  .object({
    adults: z.number().int().min(1).max(MAX_TRAVELLERS),
    children: z
      .number()
      .int()
      .min(0)
      .max(MAX_TRAVELLERS - 1),
    infants: z
      .number()
      .int()
      .min(0)
      .max(MAX_TRAVELLERS - 1),
  })
  .refine((t) => t.adults + t.children + t.infants <= MAX_TRAVELLERS, {
    message: `No more than ${MAX_TRAVELLERS} travellers per booking`,
  })
  .refine((t) => t.infants <= t.adults, {
    message: 'Each infant must travel with an adult',
    path: ['infants'],
  });

export const SearchQuerySchema = z
  .object({
    origin: IataCodeSchema,
    destination: IataCodeSchema,
    departDate: z.iso.date(),
    returnDate: z.iso.date().optional(),
    travellers: TravellersSchema,
    cabin: CabinClassSchema,
  })
  .refine((q) => q.origin !== q.destination, {
    message: 'Origin and destination must be different',
    path: ['destination'],
  })
  // ISO dates compare correctly as strings.
  .refine((q) => q.returnDate === undefined || q.returnDate >= q.departDate, {
    message: 'Return date must be on or after the departure date',
    path: ['returnDate'],
  });

// Amounts are integers in minor units (cents) so totals never pick up float rounding.
export const PriceSchema = z.object({
  amount: z.number().int().nonnegative(),
  currency: z.string().length(3),
});

export const CarrierSchema = z.object({
  code: z.string().regex(/^[A-Z0-9]{2}$/),
  name: z.string().min(1),
});

// Departure and arrival times are local to their airport, as printed on a ticket.
export const SegmentSchema = z.object({
  carrier: CarrierSchema,
  flightNumber: z.string().min(1),
  from: IataCodeSchema,
  to: IataCodeSchema,
  departAt: z.iso.datetime({ local: true }),
  arriveAt: z.iso.datetime({ local: true }),
  durationMinutes: z.number().int().positive(),
});

export const LegSchema = z.object({
  segments: z.array(SegmentSchema).min(1),
  durationMinutes: z.number().int().positive(),
  stops: z.number().int().min(0),
});

export const AgentSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
});

export const OfferSchema = z.object({
  id: z.string().min(1),
  outbound: LegSchema,
  inbound: LegSchema.optional(),
  price: PriceSchema,
  agent: AgentSchema,
  deepLink: z.url(),
});

export const DealSchema = z.object({
  id: z.string().min(1),
  origin: IataCodeSchema,
  destination: IataCodeSchema,
  departDate: z.iso.date(),
  returnDate: z.iso.date().optional(),
  price: PriceSchema,
});

export const AirportSchema = z.object({
  iata: IataCodeSchema,
  name: z.string(),
  city: z.string(),
  country: z.string(),
  lat: z.number(),
  lon: z.number(),
  utcOffsetMinutes: z.number().int(),
});

export type IataCode = z.infer<typeof IataCodeSchema>;
export type CabinClass = z.infer<typeof CabinClassSchema>;
export type Travellers = z.infer<typeof TravellersSchema>;
export type SearchQuery = z.infer<typeof SearchQuerySchema>;
export type Price = z.infer<typeof PriceSchema>;
export type Carrier = z.infer<typeof CarrierSchema>;
export type Segment = z.infer<typeof SegmentSchema>;
export type Leg = z.infer<typeof LegSchema>;
export type Agent = z.infer<typeof AgentSchema>;
export type Offer = z.infer<typeof OfferSchema>;
export type Deal = z.infer<typeof DealSchema>;
export type Airport = z.infer<typeof AirportSchema>;
