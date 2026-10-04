import type { PermitType } from "@/lib/types";

export const PERMIT_TYPES: readonly PermitType[] = [
  "residential",
  "commercial",
  "industrial",
  "renovation",
  "demolition",
  "electrical",
  "plumbing",
  "mechanical",
  "occupancy",
  "zoning",
  "other",
] as const;

export const PERMIT_TYPE_LABELS: Record<PermitType, string> = {
  residential: "Residential",
  commercial: "Commercial",
  industrial: "Industrial",
  renovation: "Renovation / alteration",
  demolition: "Demolition",
  electrical: "Electrical",
  plumbing: "Plumbing",
  mechanical: "Mechanical",
  occupancy: "Occupancy / use",
  zoning: "Zoning / land use",
  other: "Other",
};

export function isPermitType(value: string): value is PermitType {
  return (PERMIT_TYPES as readonly string[]).includes(value);
}

export function labelPermitType(type: PermitType): string {
  return PERMIT_TYPE_LABELS[type];
}
