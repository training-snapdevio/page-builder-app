/*
  Warnings:

  - You are about to drop the `LibraryFavorites` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "LibraryFavorites";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "GlobalLayout" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "data" TEXT NOT NULL DEFAULT '{}',
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "GlobalLayout_shop_type_key" ON "GlobalLayout"("shop", "type");
