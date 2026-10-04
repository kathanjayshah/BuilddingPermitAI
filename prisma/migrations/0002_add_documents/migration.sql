-- Decouple file uploads from permits into documents (pdf / image).

CREATE TYPE "DocumentKind" AS ENUM ('pdf', 'image');

-- Permit becomes a case container with a title.
ALTER TABLE "permits" ADD COLUMN "title" TEXT;

UPDATE "permits"
SET "title" = "file_name"
WHERE "title" IS NULL;

ALTER TABLE "permits" ALTER COLUMN "title" SET NOT NULL;

CREATE TABLE "documents" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "permit_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "kind" "DocumentKind" NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_size" BIGINT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "storage_key" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- Move existing permit file rows into one document each.
INSERT INTO "documents" ("permit_id", "user_id", "kind", "file_name", "file_size", "mime_type", "storage_key", "created_at")
SELECT
  "id",
  "user_id",
  CASE
    WHEN lower("mime_type") LIKE 'image/%' THEN 'image'::"DocumentKind"
    ELSE 'pdf'::"DocumentKind"
  END,
  "file_name",
  "file_size",
  "mime_type",
  "storage_key",
  "created_at"
FROM "permits";

ALTER TABLE "permits" DROP COLUMN "file_name";
ALTER TABLE "permits" DROP COLUMN "file_size";
ALTER TABLE "permits" DROP COLUMN "mime_type";
ALTER TABLE "permits" DROP COLUMN "storage_key";

CREATE INDEX "idx_documents_permit_id" ON "documents"("permit_id");
CREATE INDEX "idx_documents_user_id" ON "documents"("user_id");
CREATE INDEX "idx_documents_created_at" ON "documents"("created_at" DESC);

ALTER TABLE "documents" ADD CONSTRAINT "documents_permit_id_fkey" FOREIGN KEY ("permit_id") REFERENCES "permits"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "documents" ADD CONSTRAINT "documents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
