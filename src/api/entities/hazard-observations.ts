import { dateSchema } from '@/utilities/date';
import { z } from 'zod';

// Enums
export const ObservationStatus = z.enum(['open', 'in_progress', 'resolved', 'closed']);

export const HazardType = z.enum([
  'physical', // Fisik (Kebisingan, Radiasi, Terkena Suhu yang Ekstrim)
  'chemical', // Kimia (Mudah Terbakar, Meledak, Korosi, Reaktif, Kecucuan)
  'biological', // Biologi (Virus, Bakteri, Jamur, Hewan)
  'ergonomic', // Ergonomi (Desain Kerja, Layout Maupun Aktivitas yang Buruk)
  'psychosocial', // Psikososial (Stress, Jam Kerja yang Panjang)
]);

export const PotentialRisk = z.enum([
  'hit_by_object', // Menabrak/Ditabrak Sesuatu
  'slip_trip_fall', // Terpeleset/Tersandung/Terjatuh
  'short_circuit_burn', // Arus Pendek/Terbakar
  'contact_hazard', // Kontak Dengan Permukaan Panas/Listrik/Bahan Kimia
  'environmental_pollution', // Pencemaran Lingkungan
  'other', // Lain-Lain
]);

export const UnsafeReason = z.enum([
  'inadequate_equipment', // Peralatan yang Tidak Memadai
  'lack_of_knowledge', // Kurangnya Pengetahuan
  'incorrect_ppe_use', // Penggunaan APD yang Tidak Tepat
  'procedure_violation', // Melanggar Prosedur
  'no_loto_socialization', // Tidak ada Sosialisasi Lock Out Tag Out
  'other', // Lain-Lain
]);

export const ControlMeasure = z.enum([
  'elimination', // Eliminasi
  'substitution', // Substitusi
  'minimization', // Minimalisasi
  'training', // Pelatihan
  'ppe', // Alat Pelindung Diri (APD)
  'other', // Lain-Lain
]);

// Main entity
export const HazardObservation = z.object({
  id: z.string().uuid().optional().nullable(),
  observer_id: z.string().uuid(),
  observer_name: z.string().optional().nullable(),
  facility_id: z.string().uuid(),
  facility_name: z.string().optional().nullable(),
  observation_date: z.coerce.date(),
  observation_time: z.string(), // Time stored as string "HH:MM:SS"
  unsafe_action_condition: z.string(),
  hazard_types: z.array(z.string()).optional().nullable(),
  potential_risks: z.array(z.string()).optional().nullable(),
  potential_risk_other: z.string().optional().nullable(),
  unsafe_reasons: z.array(z.string()).optional().nullable(),
  unsafe_reason_other: z.string().optional().nullable(),
  control_measures: z.array(z.string()).optional().nullable(),
  control_measure_other: z.string().optional().nullable(),
  corrective_action: z.string().optional().nullable(),
  status: ObservationStatus,
  resolved_by_id: z.string().uuid().optional().nullable(),
  resolved_by_name: z.string().optional().nullable(),
  resolved_at: z.coerce.date().optional().nullable(),
  resolution_notes: z.string().optional().nullable(),
  created_at: z.coerce.date().optional().nullable(),
  updated_at: z.coerce.date().optional().nullable(),
});

// Create schema
export const HazardObservationCreate = z.object({
  facility_id: z.string().uuid(),
  observation_date: dateSchema,
  observation_time: z.string(),
  unsafe_action_condition: z.string().min(10),
  hazard_types: z.array(HazardType).optional().nullable(),
  potential_risks: z.array(PotentialRisk).optional().nullable(),
  potential_risk_other: z.string().optional().nullable(),
  unsafe_reasons: z.array(UnsafeReason).optional().nullable(),
  unsafe_reason_other: z.string().optional().nullable(),
  control_measures: z.array(ControlMeasure).optional().nullable(),
  control_measure_other: z.string().optional().nullable(),
  corrective_action: z.string().optional().nullable(),
});

// Update schema
export const HazardObservationUpdate = z.object({
  facility_id: z.string().uuid().optional(),
  observation_date: dateSchema.optional(),
  observation_time: z.string().optional(),
  unsafe_action_condition: z.string().optional(),
  hazard_types: z.array(HazardType).optional().nullable(),
  potential_risks: z.array(PotentialRisk).optional().nullable(),
  potential_risk_other: z.string().optional().nullable(),
  unsafe_reasons: z.array(UnsafeReason).optional().nullable(),
  unsafe_reason_other: z.string().optional().nullable(),
  control_measures: z.array(ControlMeasure).optional().nullable(),
  control_measure_other: z.string().optional().nullable(),
  corrective_action: z.string().optional().nullable(),
  status: ObservationStatus.optional(),
});

// Resolve schema
export const HazardObservationResolve = z.object({
  resolution_notes: z.string().min(10),
});

// Type exports
export type HazardObservationType = z.infer<typeof HazardObservation>;
export type HazardObservationCreateType = z.infer<typeof HazardObservationCreate>;
export type HazardObservationUpdateType = z.infer<typeof HazardObservationUpdate>;
export type HazardObservationResolveType = z.infer<typeof HazardObservationResolve>;
export type ObservationStatusType = z.infer<typeof ObservationStatus>;
export type HazardTypeType = z.infer<typeof HazardType>;
export type PotentialRiskType = z.infer<typeof PotentialRisk>;
export type UnsafeReasonType = z.infer<typeof UnsafeReason>;
export type ControlMeasureType = z.infer<typeof ControlMeasure>;
