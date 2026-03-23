-- CreateTable
CREATE TABLE "CollabSession" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "genre" TEXT NOT NULL DEFAULT 'rock',
    "songPart" TEXT NOT NULL DEFAULT 'verse',
    "emotion" TEXT,
    "bpm" INTEGER NOT NULL DEFAULT 120,
    "patternLength" INTEGER NOT NULL DEFAULT 16,
    "visibility" TEXT NOT NULL DEFAULT 'private',
    "inviteCode" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "patternData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CollabSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CollabParticipant" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'collaborator',
    "assignedInstruments" JSONB,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP(3),

    CONSTRAINT "CollabParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CollabRecording" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "duration" INTEGER NOT NULL DEFAULT 0,
    "events" JSONB NOT NULL,
    "startBpm" INTEGER NOT NULL,
    "startGenre" TEXT NOT NULL,
    "startPart" TEXT NOT NULL,
    "startPattern" JSONB NOT NULL,
    "participants" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CollabRecording_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CollabSession_inviteCode_key" ON "CollabSession"("inviteCode");

-- CreateIndex
CREATE INDEX "CollabSession_hostId_idx" ON "CollabSession"("hostId");

-- CreateIndex
CREATE INDEX "CollabSession_inviteCode_idx" ON "CollabSession"("inviteCode");

-- CreateIndex
CREATE INDEX "CollabSession_isActive_idx" ON "CollabSession"("isActive");

-- CreateIndex
CREATE INDEX "CollabParticipant_sessionId_idx" ON "CollabParticipant"("sessionId");

-- CreateIndex
CREATE INDEX "CollabParticipant_userId_idx" ON "CollabParticipant"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CollabParticipant_sessionId_userId_key" ON "CollabParticipant"("sessionId", "userId");

-- CreateIndex
CREATE INDEX "CollabRecording_sessionId_idx" ON "CollabRecording"("sessionId");

-- AddForeignKey
ALTER TABLE "CollabSession" ADD CONSTRAINT "CollabSession_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollabParticipant" ADD CONSTRAINT "CollabParticipant_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "CollabSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollabParticipant" ADD CONSTRAINT "CollabParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollabRecording" ADD CONSTRAINT "CollabRecording_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "CollabSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
