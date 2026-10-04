-- Add generic permit type categories.

CREATE TYPE "PermitType" AS ENUM (
  'residential',
  'commercial',
  'industrial',
  'renovation',
  'demolition',
  'electrical',
  'plumbing',
  'mechanical',
  'occupancy',
  'zoning',
  'other'
);

ALTER TABLE "permits"
ADD COLUMN "type" "PermitType" NOT NULL DEFAULT 'other';

CREATE INDEX "idx_permits_type" ON "permits"("type");
