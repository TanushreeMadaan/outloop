-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('ACTIVE', 'COMPLETED');

-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "actualReturnDate" TIMESTAMP(3),
ADD COLUMN     "expectedReturnDate" TIMESTAMP(3),
ADD COLUMN     "status" "TransactionStatus" NOT NULL DEFAULT 'COMPLETED';
