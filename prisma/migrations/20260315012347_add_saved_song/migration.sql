-- CreateTable
CREATE TABLE "SavedSong" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "blocks" JSONB NOT NULL,
    "loop" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SavedSong_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SavedSong_userId_idx" ON "SavedSong"("userId");

-- AddForeignKey
ALTER TABLE "SavedSong" ADD CONSTRAINT "SavedSong_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
