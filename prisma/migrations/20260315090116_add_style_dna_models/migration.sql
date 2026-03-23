-- CreateTable
CREATE TABLE "StyleProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dna" JSONB NOT NULL,
    "feedbackCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StyleProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatternFeedback" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "patternHash" TEXT NOT NULL,
    "genre" TEXT NOT NULL,
    "songPart" TEXT NOT NULL,
    "artistDna" TEXT,
    "liked" BOOLEAN NOT NULL,
    "patternData" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PatternFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StyleProfile_userId_key" ON "StyleProfile"("userId");

-- CreateIndex
CREATE INDEX "StyleProfile_userId_idx" ON "StyleProfile"("userId");

-- CreateIndex
CREATE INDEX "PatternFeedback_userId_idx" ON "PatternFeedback"("userId");

-- CreateIndex
CREATE INDEX "PatternFeedback_patternHash_idx" ON "PatternFeedback"("patternHash");

-- AddForeignKey
ALTER TABLE "StyleProfile" ADD CONSTRAINT "StyleProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatternFeedback" ADD CONSTRAINT "PatternFeedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
