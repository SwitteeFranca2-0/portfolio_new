-- AlterTable
ALTER TABLE "Bio" ADD COLUMN     "backgroundStyle" TEXT NOT NULL DEFAULT 'laptop',
ADD COLUMN     "demoMode" BOOLEAN NOT NULL DEFAULT false;
