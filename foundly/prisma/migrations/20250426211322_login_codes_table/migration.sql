-- CreateTable
CREATE TABLE "LoginCodes" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "isValid" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LoginCodes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LoginCodes_code_key" ON "LoginCodes"("code");

-- AddForeignKey
ALTER TABLE "LoginCodes" ADD CONSTRAINT "LoginCodes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
