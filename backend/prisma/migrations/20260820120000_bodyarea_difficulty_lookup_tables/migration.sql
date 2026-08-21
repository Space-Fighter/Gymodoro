-- Catalog is reseeded from prisma/exercise-seed-data.json, so it's simplest
-- to clear it rather than backfill string values into new lookup rows.
TRUNCATE TABLE "Exercise" CASCADE;

-- CreateTable
CREATE TABLE "Difficulty" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Difficulty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BodyArea" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "BodyArea_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Difficulty_name_key" ON "Difficulty"("name");

-- CreateIndex
CREATE UNIQUE INDEX "BodyArea_name_key" ON "BodyArea"("name");

-- AlterTable
ALTER TABLE "Exercise"
  DROP COLUMN "difficulty",
  DROP COLUMN "bodyArea",
  ADD COLUMN "difficultyId" TEXT NOT NULL,
  ADD COLUMN "bodyAreaId" TEXT;

-- AddForeignKey
ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_difficultyId_fkey" FOREIGN KEY ("difficultyId") REFERENCES "Difficulty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_bodyAreaId_fkey" FOREIGN KEY ("bodyAreaId") REFERENCES "BodyArea"("id") ON DELETE SET NULL ON UPDATE CASCADE;
