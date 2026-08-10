-- AlterTable
ALTER TABLE "Experience" ADD COLUMN "showOnHomepage" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "SkillItem" ADD COLUMN "showInHero" BOOLEAN NOT NULL DEFAULT false;
