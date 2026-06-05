-- CreateTable
CREATE TABLE "LibraryFavorites" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "blocks" TEXT NOT NULL DEFAULT '[]',
    "pages" TEXT NOT NULL DEFAULT '[]',
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "LibraryFavorites_shop_key" ON "LibraryFavorites"("shop");
