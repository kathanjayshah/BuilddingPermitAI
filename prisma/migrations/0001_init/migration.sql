-- Enable pgvector for future RAG embeddings (same Postgres DB).
CREATE EXTENSION IF NOT EXISTS vector;

-- CreateEnum
CREATE TYPE "NormSource" AS ENUM ('upload', 'paste', 'web_stub', 'web');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permits" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_size" BIGINT NOT NULL,
    "mime_type" TEXT NOT NULL DEFAULT 'application/pdf',
    "storage_key" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "permits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "norm_docs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "source" "NormSource" NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "file_name" TEXT,
    "source_url" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "norm_docs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_runs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "permit_id" UUID NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'queued',
    "note" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_run_norms" (
    "review_run_id" UUID NOT NULL,
    "norm_doc_id" UUID NOT NULL,

    CONSTRAINT "review_run_norms_pkey" PRIMARY KEY ("review_run_id","norm_doc_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "idx_permits_user_id" ON "permits"("user_id");

-- CreateIndex
CREATE INDEX "idx_permits_created_at" ON "permits"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_norm_docs_user_id" ON "norm_docs"("user_id");

-- CreateIndex
CREATE INDEX "idx_norm_docs_created_at" ON "norm_docs"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_review_runs_user_id" ON "review_runs"("user_id");

-- CreateIndex
CREATE INDEX "idx_review_runs_permit_id" ON "review_runs"("permit_id");

-- CreateIndex
CREATE INDEX "idx_review_runs_created_at" ON "review_runs"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_review_run_norms_norm_doc_id" ON "review_run_norms"("norm_doc_id");

-- AddForeignKey
ALTER TABLE "permits" ADD CONSTRAINT "permits_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "norm_docs" ADD CONSTRAINT "norm_docs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_runs" ADD CONSTRAINT "review_runs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_runs" ADD CONSTRAINT "review_runs_permit_id_fkey" FOREIGN KEY ("permit_id") REFERENCES "permits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_run_norms" ADD CONSTRAINT "review_run_norms_review_run_id_fkey" FOREIGN KEY ("review_run_id") REFERENCES "review_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_run_norms" ADD CONSTRAINT "review_run_norms_norm_doc_id_fkey" FOREIGN KEY ("norm_doc_id") REFERENCES "norm_docs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
