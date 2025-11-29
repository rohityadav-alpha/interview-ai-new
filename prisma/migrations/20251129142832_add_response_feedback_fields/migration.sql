-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "clerk_user_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "username" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interviews" (
    "id" SERIAL NOT NULL,
    "clerk_user_id" TEXT NOT NULL,
    "user_email" TEXT NOT NULL,
    "user_first_name" TEXT,
    "user_last_name" TEXT,
    "user_username" TEXT,
    "skill" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL DEFAULT 'medium',
    "total_score" INTEGER NOT NULL DEFAULT 0,
    "avg_score" DECIMAL(4,2) NOT NULL DEFAULT 0,
    "questions_attempted" INTEGER NOT NULL DEFAULT 0,
    "interview_duration" INTEGER NOT NULL DEFAULT 0,
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "improvements" TEXT,
    "confidence_tips" TEXT,
    "strengths" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interview_responses" (
    "id" SERIAL NOT NULL,
    "interview_id" INTEGER NOT NULL,
    "question_number" INTEGER NOT NULL,
    "question" TEXT NOT NULL,
    "user_answer" TEXT,
    "ai_score" INTEGER,
    "ai_feedback" TEXT,
    "strengths" TEXT,
    "improvements" TEXT,
    "confidence_tips" TEXT,
    "time_taken" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interview_responses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_clerk_user_id_key" ON "users"("clerk_user_id");

-- CreateIndex
CREATE INDEX "interviews_clerk_user_id_idx" ON "interviews"("clerk_user_id");

-- CreateIndex
CREATE INDEX "interviews_is_completed_idx" ON "interviews"("is_completed");

-- CreateIndex
CREATE INDEX "interview_responses_interview_id_idx" ON "interview_responses"("interview_id");

-- AddForeignKey
ALTER TABLE "interview_responses" ADD CONSTRAINT "interview_responses_interview_id_fkey" FOREIGN KEY ("interview_id") REFERENCES "interviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;
