-- CreateTable
CREATE TABLE "DeadlineReminder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "deadlineId" TEXT NOT NULL,
    "daysBefore" INTEGER NOT NULL,
    "message" TEXT,
    "notified" BOOLEAN NOT NULL DEFAULT false,
    "notifiedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DeadlineReminder_deadlineId_fkey" FOREIGN KEY ("deadlineId") REFERENCES "DeadlineInstance" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "DeadlineReminder_deadlineId_idx" ON "DeadlineReminder"("deadlineId");

-- CreateIndex
CREATE INDEX "DeadlineReminder_notified_idx" ON "DeadlineReminder"("notified");
