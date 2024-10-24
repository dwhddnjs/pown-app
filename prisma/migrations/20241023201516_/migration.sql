-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "auth";

-- CreateEnum
CREATE TYPE "auth"."Gender" AS ENUM ('male', 'female');

-- CreateEnum
CREATE TYPE "auth"."AuthType" AS ENUM ('email', 'google', 'apple');

-- CreateTable
CREATE TABLE "auth"."User" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "provider" "auth"."AuthType" NOT NULL DEFAULT 'email',
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),
    "name" TEXT NOT NULL,
    "gender" "auth"."Gender",

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "auth"."User"("email");
