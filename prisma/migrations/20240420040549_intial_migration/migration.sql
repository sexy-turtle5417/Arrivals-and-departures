-- CreateEnum
CREATE TYPE "Sex" AS ENUM ('male', 'female');

-- CreateTable
CREATE TABLE "Person" (
    "id" SERIAL NOT NULL,
    "firstname" TEXT NOT NULL,
    "middlename" TEXT,
    "lastname" TEXT NOT NULL,
    "sex" "Sex" NOT NULL,
    "profileImageURL" TEXT NOT NULL,

    CONSTRAINT "Person_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Guard" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "admin" BOOLEAN NOT NULL DEFAULT false,
    "disabled" BOOLEAN NOT NULL DEFAULT false,
    "personId" INTEGER NOT NULL,
    "timeRegistered" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Guard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Guard_email_key" ON "Guard"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Guard_personId_key" ON "Guard"("personId");

-- AddForeignKey
ALTER TABLE "Guard" ADD CONSTRAINT "Guard_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;
