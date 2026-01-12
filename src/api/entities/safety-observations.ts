import { dateSchema } from '@/utilities/date';
import { z } from 'zod';

// Enums
export const ObservationStatus = z.enum(['open', 'in_progress', 'resolved', 'closed']);

export const ObservationType = z.enum([
  'safe_act', // Tindakan Aman
  'unsafe_act', // Tindakan Tidak Aman
  'safe_condition', // Kondisi Aman
  'unsafe_condition', // Kondisi Tidak Aman
  'near_miss', // Near Miss / Hampir Celaka
  'improvement_suggestion', // Usulan Perbaikan
]);

export const ObservationCategory = z.enum([
  'worker_behavior', // Perilaku / Tindakan Pekerja
  'equipment_machinery', // Peralatan / Mesin
  'work_environment', // Lingkungan Kerja
  'procedure_work_method', // Prosedur / Metode Kerja
  'ppe', // APD (Alat Pelindung Diri)
  'housekeeping', // Housekeeping
  'other', // Lainnya
]);

export const PotentialImpact = z.enum([
  'minor_injury', // Cedera Ringan
  'serious_injury', // Cedera Berat
  'equipment_damage', // Kerusakan Alat
  'environmental_damage', // Kerusakan Lingkungan
  'fatality', // Fatality
  'no_impact', // Tidak Ada Dampak
]);

// Main entity
export const SafetyObservation = z.object({
  id: z.string().uuid().optional().nullable(),
  
  // A. General Information
  observation_date: z.coerce.date(),
  observation_time: z.string(),
  location_area: z.string().optional().nullable(),
  department_unit: z.string().optional().nullable(),
  facility_id: z.string().uuid().optional().nullable(),
  facility_name: z.string().optional().nullable(),

  // B. Reporter Data
  observer_id: z.string().uuid(),
  observer_name: z.string().optional().nullable(),
  contact_info: z.string().optional().nullable(),

  // C. Observation Type
  observation_types: z.array(z.string()).optional().nullable(),

  // D. Observation Category
  observation_categories: z.array(z.string()).optional().nullable(),
  category_other: z.string().optional().nullable(),

  // E. Observation Description
  observation_description: z.string(),

  // F. Potential Risk/Impact
  potential_impacts: z.array(z.string()).optional().nullable(),
  impact_explanation: z.string().optional().nullable(),

  // G. Suggested Corrective Action
  suggested_corrective_action: z.string().optional().nullable(),

  // H. Immediate Action
  immediate_action_done: z.string().optional().nullable(),
  immediate_action_description: z.string().optional().nullable(),

  // I. Supporting Evidence
  photo_file_ids: z.array(z.string().uuid()).optional().nullable(),
  has_supporting_evidence: z.string().optional().nullable(),

  // Status
  status: ObservationStatus,

  // Resolution Information
  resolved_by_id: z.string().uuid().optional().nullable(),
  resolved_by_name: z.string().optional().nullable(),
  resolved_at: z.coerce.date().optional().nullable(),
  resolution_notes: z.string().optional().nullable(),

  // Close Information
  closed_by_id: z.string().uuid().optional().nullable(),
  closed_by_name: z.string().optional().nullable(),
  closed_at: z.coerce.date().optional().nullable(),
  close_reason: z.string().optional().nullable(),

  // Metadata
  created_at: z.coerce.date().optional().nullable(),
  updated_at: z.coerce.date().optional().nullable(),
});

// Create schema
export const SafetyObservationCreate = z.object({
  // A. General Information
  observation_date: dateSchema,
  observation_time: z.string(),
  location_area: z.string().optional().nullable(),
  department_unit: z.string().optional().nullable(),
  facility_id: z.string().uuid().optional().nullable(),

  // B. Reporter Data
  contact_info: z.string().optional().nullable(),

  // C. Observation Type
  observation_types: z.array(ObservationType).optional().nullable(),

  // D. Observation Category
  observation_categories: z.array(ObservationCategory).optional().nullable(),
  category_other: z.string().optional().nullable(),

  // E. Observation Description
  observation_description: z.string().min(10),

  // F. Potential Risk/Impact
  potential_impacts: z.array(PotentialImpact).optional().nullable(),
  impact_explanation: z.string().optional().nullable(),

  // G. Suggested Corrective Action
  suggested_corrective_action: z.string().optional().nullable(),

  // H. Immediate Action
  immediate_action_done: z.string().optional().nullable(),
  immediate_action_description: z.string().optional().nullable(),

  // I. Supporting Evidence
  photo_file_ids: z.array(z.string().uuid()).optional().nullable(),
  has_supporting_evidence: z.string().optional().nullable(),
});

// Update schema
export const SafetyObservationUpdate = z.object({
  observation_date: dateSchema.optional(),
  observation_time: z.string().optional(),
  location_area: z.string().optional().nullable(),
  department_unit: z.string().optional().nullable(),
  facility_id: z.string().uuid().optional().nullable(),
  contact_info: z.string().optional().nullable(),
  observation_types: z.array(ObservationType).optional().nullable(),
  observation_categories: z.array(ObservationCategory).optional().nullable(),
  category_other: z.string().optional().nullable(),
  observation_description: z.string().optional(),
  potential_impacts: z.array(PotentialImpact).optional().nullable(),
  impact_explanation: z.string().optional().nullable(),
  suggested_corrective_action: z.string().optional().nullable(),
  immediate_action_done: z.string().optional().nullable(),
  immediate_action_description: z.string().optional().nullable(),
  photo_file_ids: z.array(z.string().uuid()).optional().nullable(),
  has_supporting_evidence: z.string().optional().nullable(),
  status: ObservationStatus.optional(),
});

// Resolve schema
export const SafetyObservationResolve = z.object({
  resolution_notes: z.string().min(10),
});

// Close schema
export const SafetyObservationClose = z.object({
  close_reason: z.string().min(5),
});

// Type exports
export type SafetyObservationType = z.infer<typeof SafetyObservation>;
export type SafetyObservationCreateType = z.infer<typeof SafetyObservationCreate>;
export type SafetyObservationUpdateType = z.infer<typeof SafetyObservationUpdate>;
export type SafetyObservationResolveType = z.infer<typeof SafetyObservationResolve>;
export type SafetyObservationCloseType = z.infer<typeof SafetyObservationClose>;
export type ObservationStatusType = z.infer<typeof ObservationStatus>;
export type ObservationTypeType = z.infer<typeof ObservationType>;
export type ObservationCategoryType = z.infer<typeof ObservationCategory>;
export type PotentialImpactType = z.infer<typeof PotentialImpact>;
