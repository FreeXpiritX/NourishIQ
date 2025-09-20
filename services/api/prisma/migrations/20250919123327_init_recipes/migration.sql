-- CreateTable
CREATE TABLE "public"."Recipe" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "minutes" INTEGER,
    "ingredients" TEXT[],
    "steps" TEXT[],
    "tags" TEXT[],
    "kcal" INTEGER,
    "macros" JSONB,
    "costTier" TEXT,

    CONSTRAINT "Recipe_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Recipe_slug_key" ON "public"."Recipe"("slug");

-- CreateIndex
CREATE INDEX "Recipe_slug_idx" ON "public"."Recipe"("slug");
