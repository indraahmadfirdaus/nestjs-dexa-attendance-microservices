-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AttendanceStatus" ADD VALUE 'LATE';
ALTER TYPE "AttendanceStatus" ADD VALUE 'HALF_DAY';

-- AlterTable
ALTER TABLE "attendances" ADD COLUMN     "clock_in_address" TEXT,
ADD COLUMN     "clock_in_latitude" DOUBLE PRECISION,
ADD COLUMN     "clock_in_longitude" DOUBLE PRECISION,
ADD COLUMN     "clock_out_address" TEXT,
ADD COLUMN     "clock_out_latitude" DOUBLE PRECISION,
ADD COLUMN     "clock_out_longitude" DOUBLE PRECISION,
ADD COLUMN     "notes" TEXT;
