-- CreateEnum
CREATE TYPE "GalleryCategory" AS ENUM ('GALLERY', 'PRESS');

-- AlterTable
ALTER TABLE "Gallery" ADD COLUMN     "category" "GalleryCategory" NOT NULL DEFAULT 'PRESS';
