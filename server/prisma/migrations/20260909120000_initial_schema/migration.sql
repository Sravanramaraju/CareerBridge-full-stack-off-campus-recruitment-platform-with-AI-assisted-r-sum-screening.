-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CareerBridge uses pgvector for optional semantic job and resume matching.
CREATE EXTENSION IF NOT EXISTS vector;

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('APPLICANT', 'RECRUITER', 'ADMIN');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'DEACTIVATED');

-- CreateEnum
CREATE TYPE "SkillProficiency" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT');

-- CreateEnum
CREATE TYPE "CompanyVerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'NEEDS_CHANGES', 'REJECTED');

-- CreateEnum
CREATE TYPE "CompanyMemberRole" AS ENUM ('OWNER', 'RECRUITER');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CLOSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "JobModerationStatus" AS ENUM ('PENDING', 'CLEARED', 'FLAGGED', 'DEACTIVATED');

-- CreateEnum
CREATE TYPE "WorkMode" AS ENUM ('ON_SITE', 'HYBRID', 'REMOTE');

-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'CONTRACT');

-- CreateEnum
CREATE TYPE "SkillRequirement" AS ENUM ('REQUIRED', 'PREFERRED');

-- CreateEnum
CREATE TYPE "StorageProvider" AS ENUM ('LOCAL', 'S3');

-- CreateEnum
CREATE TYPE "ResumeParseStatus" AS ENUM ('PENDING', 'PROCESSING', 'READY', 'FAILED');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'OFFERED', 'REJECTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('APPLICATION_SUBMITTED', 'APPLICATION_RECEIVED', 'APPLICATION_STATUS_CHANGED', 'COMPANY_VERIFICATION_CHANGED', 'JOB_MODERATION_CHANGED', 'JOB_PUBLISHED', 'SECURITY');

-- CreateEnum
CREATE TYPE "EmailOutboxStatus" AS ENUM ('PENDING', 'PROCESSING', 'SENT', 'FAILED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userAgent" TEXT,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "applicationUpdates" BOOLEAN NOT NULL DEFAULT true,
    "jobRecommendations" BOOLEAN NOT NULL DEFAULT true,
    "careerResources" BOOLEAN NOT NULL DEFAULT false,
    "newApplications" BOOLEAN NOT NULL DEFAULT true,
    "candidateReminders" BOOLEAN NOT NULL DEFAULT true,
    "jobExpiryReminders" BOOLEAN NOT NULL DEFAULT true,
    "weeklySummary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicantEducation" (
    "id" TEXT NOT NULL,
    "applicantProfileId" TEXT NOT NULL,
    "institution" TEXT NOT NULL,
    "qualification" TEXT NOT NULL,
    "fieldOfStudy" TEXT,
    "startYear" INTEGER,
    "endYear" INTEGER,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "grade" TEXT,
    "description" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApplicantEducation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicantProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "headline" TEXT,
    "phone" TEXT,
    "location" TEXT,
    "summary" TEXT,
    "preferredLocations" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "preferredJobTypes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "preferredWorkModes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApplicantProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicantExperience" (
    "id" TEXT NOT NULL,
    "applicantProfileId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "organization" TEXT NOT NULL,
    "location" TEXT,
    "employmentType" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApplicantExperience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicantProject" (
    "id" TEXT NOT NULL,
    "applicantProfileId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "projectUrl" TEXT,
    "repositoryUrl" TEXT,
    "technologies" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApplicantProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicantCertification" (
    "id" TEXT NOT NULL,
    "applicantProfileId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "issuer" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "credentialId" TEXT,
    "credentialUrl" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApplicantCertification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Skill" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "normalizedName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicantSkill" (
    "applicantProfileId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "proficiency" "SkillProficiency",
    "yearsExperience" DECIMAL(4,1),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApplicantSkill_pkey" PRIMARY KEY ("applicantProfileId","skillId")
);

-- CreateTable
CREATE TABLE "RecruiterProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT,
    "phone" TEXT,
    "bio" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecruiterProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "website" TEXT,
    "industry" TEXT,
    "companyType" TEXT,
    "size" TEXT,
    "foundedYear" INTEGER,
    "headquarters" TEXT,
    "locations" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "benefits" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "logoUrl" TEXT,
    "logoStorageKey" TEXT,
    "brandInitials" TEXT,
    "brandColor" TEXT,
    "verificationStatus" "CompanyVerificationStatus" NOT NULL DEFAULT 'PENDING',
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyMember" (
    "companyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "CompanyMemberRole" NOT NULL DEFAULT 'RECRUITER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompanyMember_pkey" PRIMARY KEY ("companyId","userId")
);

-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdByUserId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "department" TEXT,
    "category" TEXT,
    "location" TEXT NOT NULL,
    "workMode" "WorkMode" NOT NULL,
    "employmentType" "EmploymentType" NOT NULL,
    "openings" INTEGER NOT NULL DEFAULT 1,
    "experienceMin" INTEGER NOT NULL DEFAULT 0,
    "experienceMax" INTEGER NOT NULL DEFAULT 0,
    "salaryMin" DECIMAL(12,2),
    "salaryMax" DECIMAL(12,2),
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "hideSalary" BOOLEAN NOT NULL DEFAULT false,
    "summary" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "responsibilities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "qualification" TEXT NOT NULL,
    "contactVisible" BOOLEAN NOT NULL DEFAULT true,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "status" "JobStatus" NOT NULL DEFAULT 'DRAFT',
    "moderationStatus" "JobModerationStatus" NOT NULL DEFAULT 'PENDING',
    "deadline" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobSkill" (
    "jobId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "requirement" "SkillRequirement" NOT NULL DEFAULT 'REQUIRED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobSkill_pkey" PRIMARY KEY ("jobId","skillId")
);

-- CreateTable
CREATE TABLE "JobScreeningQuestion" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobScreeningQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Resume" (
    "id" TEXT NOT NULL,
    "applicantProfileId" TEXT NOT NULL,
    "originalFileName" TEXT NOT NULL,
    "storageProvider" "StorageProvider" NOT NULL DEFAULT 'LOCAL',
    "storageKey" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "parseStatus" "ResumeParseStatus" NOT NULL DEFAULT 'PENDING',
    "extractedText" TEXT,
    "parsedData" JSONB,
    "parseError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Resume_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedJob" (
    "applicantId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedJob_pkey" PRIMARY KEY ("applicantId","jobId")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "coverNote" TEXT,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'APPLIED',
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicationScreeningAnswer" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "questionSnapshot" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApplicationScreeningAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicationStatusHistory" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "previousStatus" "ApplicationStatus",
    "newStatus" "ApplicationStatus" NOT NULL,
    "changedByUserId" TEXT,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApplicationStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicationMatch" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "overallScore" INTEGER NOT NULL,
    "requiredSkillScore" INTEGER NOT NULL,
    "preferredSkillScore" INTEGER NOT NULL,
    "experienceScore" INTEGER NOT NULL,
    "preferenceScore" INTEGER NOT NULL,
    "semanticScore" INTEGER,
    "semanticAvailable" BOOLEAN NOT NULL DEFAULT false,
    "requiredSkillsMatched" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "requiredSkillsMissing" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "preferredSkillsMatched" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "explanation" JSONB NOT NULL,
    "modelVersion" TEXT,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApplicationMatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecruiterNote" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "authorUserId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecruiterNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailOutbox" (
    "id" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "template" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" "EmailOutboxStatus" NOT NULL DEFAULT 'PENDING',
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lockedAt" TIMESTAMP(3),
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sentAt" TIMESTAMP(3),

    CONSTRAINT "EmailOutbox_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorUserId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "metadata" JSONB,
    "requestId" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_embeddings" (
    "jobId" TEXT NOT NULL,
    "embedding" vector(384) NOT NULL,
    "modelName" TEXT NOT NULL,
    "textHash" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_embeddings_pkey" PRIMARY KEY ("jobId")
);

-- CreateTable
CREATE TABLE "resume_embeddings" (
    "resumeId" TEXT NOT NULL,
    "embedding" vector(384) NOT NULL,
    "modelName" TEXT NOT NULL,
    "textHash" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resume_embeddings_pkey" PRIMARY KEY ("resumeId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_tokenHash_key" ON "PasswordResetToken"("tokenHash");

-- CreateIndex
CREATE INDEX "PasswordResetToken_userId_idx" ON "PasswordResetToken"("userId");

-- CreateIndex
CREATE INDEX "PasswordResetToken_expiresAt_idx" ON "PasswordResetToken"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserPreference_userId_key" ON "UserPreference"("userId");

-- CreateIndex
CREATE INDEX "ApplicantEducation_applicantProfileId_displayOrder_idx" ON "ApplicantEducation"("applicantProfileId", "displayOrder");

-- CreateIndex
CREATE UNIQUE INDEX "ApplicantProfile_userId_key" ON "ApplicantProfile"("userId");

-- CreateIndex
CREATE INDEX "ApplicantExperience_applicantProfileId_displayOrder_idx" ON "ApplicantExperience"("applicantProfileId", "displayOrder");

-- CreateIndex
CREATE INDEX "ApplicantProject_applicantProfileId_displayOrder_idx" ON "ApplicantProject"("applicantProfileId", "displayOrder");

-- CreateIndex
CREATE INDEX "ApplicantCertification_applicantProfileId_displayOrder_idx" ON "ApplicantCertification"("applicantProfileId", "displayOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Skill_normalizedName_key" ON "Skill"("normalizedName");

-- CreateIndex
CREATE INDEX "Skill_name_idx" ON "Skill"("name");

-- CreateIndex
CREATE INDEX "ApplicantSkill_skillId_idx" ON "ApplicantSkill"("skillId");

-- CreateIndex
CREATE UNIQUE INDEX "RecruiterProfile_userId_key" ON "RecruiterProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Company_slug_key" ON "Company"("slug");

-- CreateIndex
CREATE INDEX "Company_industry_idx" ON "Company"("industry");

-- CreateIndex
CREATE INDEX "Company_companyType_idx" ON "Company"("companyType");

-- CreateIndex
CREATE INDEX "Company_verificationStatus_idx" ON "Company"("verificationStatus");

-- CreateIndex
CREATE INDEX "Company_createdAt_idx" ON "Company"("createdAt");

-- CreateIndex
CREATE INDEX "CompanyMember_userId_idx" ON "CompanyMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Job_slug_key" ON "Job"("slug");

-- CreateIndex
CREATE INDEX "Job_companyId_idx" ON "Job"("companyId");

-- CreateIndex
CREATE INDEX "Job_createdByUserId_idx" ON "Job"("createdByUserId");

-- CreateIndex
CREATE INDEX "Job_status_idx" ON "Job"("status");

-- CreateIndex
CREATE INDEX "Job_moderationStatus_idx" ON "Job"("moderationStatus");

-- CreateIndex
CREATE INDEX "Job_publishedAt_idx" ON "Job"("publishedAt");

-- CreateIndex
CREATE INDEX "Job_createdAt_idx" ON "Job"("createdAt");

-- CreateIndex
CREATE INDEX "Job_deadline_idx" ON "Job"("deadline");

-- CreateIndex
CREATE INDEX "JobSkill_skillId_idx" ON "JobSkill"("skillId");

-- CreateIndex
CREATE INDEX "JobSkill_requirement_idx" ON "JobSkill"("requirement");

-- CreateIndex
CREATE INDEX "JobScreeningQuestion_jobId_idx" ON "JobScreeningQuestion"("jobId");

-- CreateIndex
CREATE UNIQUE INDEX "JobScreeningQuestion_jobId_sortOrder_key" ON "JobScreeningQuestion"("jobId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Resume_storageKey_key" ON "Resume"("storageKey");

-- CreateIndex
CREATE INDEX "Resume_applicantProfileId_idx" ON "Resume"("applicantProfileId");

-- CreateIndex
CREATE INDEX "Resume_applicantProfileId_isPrimary_idx" ON "Resume"("applicantProfileId", "isPrimary");

-- CreateIndex
CREATE INDEX "Resume_parseStatus_idx" ON "Resume"("parseStatus");

-- CreateIndex
CREATE INDEX "Resume_deletedAt_idx" ON "Resume"("deletedAt");

-- CreateIndex
CREATE INDEX "SavedJob_applicantId_createdAt_idx" ON "SavedJob"("applicantId", "createdAt");

-- CreateIndex
CREATE INDEX "SavedJob_jobId_idx" ON "SavedJob"("jobId");

-- CreateIndex
CREATE INDEX "Application_applicantId_idx" ON "Application"("applicantId");

-- CreateIndex
CREATE INDEX "Application_jobId_idx" ON "Application"("jobId");

-- CreateIndex
CREATE INDEX "Application_resumeId_idx" ON "Application"("resumeId");

-- CreateIndex
CREATE INDEX "Application_status_idx" ON "Application"("status");

-- CreateIndex
CREATE INDEX "Application_appliedAt_idx" ON "Application"("appliedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Application_applicantId_jobId_key" ON "Application"("applicantId", "jobId");

-- CreateIndex
CREATE INDEX "ApplicationScreeningAnswer_questionId_idx" ON "ApplicationScreeningAnswer"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "ApplicationScreeningAnswer_applicationId_questionId_key" ON "ApplicationScreeningAnswer"("applicationId", "questionId");

-- CreateIndex
CREATE INDEX "ApplicationStatusHistory_applicationId_createdAt_idx" ON "ApplicationStatusHistory"("applicationId", "createdAt");

-- CreateIndex
CREATE INDEX "ApplicationStatusHistory_changedByUserId_idx" ON "ApplicationStatusHistory"("changedByUserId");

-- CreateIndex
CREATE UNIQUE INDEX "ApplicationMatch_applicationId_key" ON "ApplicationMatch"("applicationId");

-- CreateIndex
CREATE INDEX "ApplicationMatch_overallScore_idx" ON "ApplicationMatch"("overallScore");

-- CreateIndex
CREATE INDEX "ApplicationMatch_calculatedAt_idx" ON "ApplicationMatch"("calculatedAt");

-- CreateIndex
CREATE INDEX "RecruiterNote_applicationId_createdAt_idx" ON "RecruiterNote"("applicationId", "createdAt");

-- CreateIndex
CREATE INDEX "RecruiterNote_authorUserId_idx" ON "RecruiterNote"("authorUserId");

-- CreateIndex
CREATE INDEX "Notification_userId_readAt_idx" ON "Notification"("userId", "readAt");

-- CreateIndex
CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_entityType_entityId_idx" ON "Notification"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "EmailOutbox_status_nextAttemptAt_idx" ON "EmailOutbox"("status", "nextAttemptAt");

-- CreateIndex
CREATE INDEX "EmailOutbox_createdAt_idx" ON "EmailOutbox"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_actorUserId_idx" ON "AuditLog"("actorUserId");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "job_embeddings_textHash_idx" ON "job_embeddings"("textHash");

-- CreateIndex
CREATE INDEX "resume_embeddings_textHash_idx" ON "resume_embeddings"("textHash");

-- CreateIndex
CREATE INDEX "job_embeddings_embedding_cosine_idx" ON "job_embeddings" USING hnsw ("embedding" vector_cosine_ops);

-- CreateIndex
CREATE INDEX "resume_embeddings_embedding_cosine_idx" ON "resume_embeddings" USING hnsw ("embedding" vector_cosine_ops);

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPreference" ADD CONSTRAINT "UserPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicantEducation" ADD CONSTRAINT "ApplicantEducation_applicantProfileId_fkey" FOREIGN KEY ("applicantProfileId") REFERENCES "ApplicantProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicantProfile" ADD CONSTRAINT "ApplicantProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicantExperience" ADD CONSTRAINT "ApplicantExperience_applicantProfileId_fkey" FOREIGN KEY ("applicantProfileId") REFERENCES "ApplicantProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicantProject" ADD CONSTRAINT "ApplicantProject_applicantProfileId_fkey" FOREIGN KEY ("applicantProfileId") REFERENCES "ApplicantProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicantCertification" ADD CONSTRAINT "ApplicantCertification_applicantProfileId_fkey" FOREIGN KEY ("applicantProfileId") REFERENCES "ApplicantProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicantSkill" ADD CONSTRAINT "ApplicantSkill_applicantProfileId_fkey" FOREIGN KEY ("applicantProfileId") REFERENCES "ApplicantProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicantSkill" ADD CONSTRAINT "ApplicantSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecruiterProfile" ADD CONSTRAINT "RecruiterProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyMember" ADD CONSTRAINT "CompanyMember_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyMember" ADD CONSTRAINT "CompanyMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSkill" ADD CONSTRAINT "JobSkill_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSkill" ADD CONSTRAINT "JobSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobScreeningQuestion" ADD CONSTRAINT "JobScreeningQuestion_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resume" ADD CONSTRAINT "Resume_applicantProfileId_fkey" FOREIGN KEY ("applicantProfileId") REFERENCES "ApplicantProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedJob" ADD CONSTRAINT "SavedJob_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedJob" ADD CONSTRAINT "SavedJob_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationScreeningAnswer" ADD CONSTRAINT "ApplicationScreeningAnswer_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationScreeningAnswer" ADD CONSTRAINT "ApplicationScreeningAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "JobScreeningQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationStatusHistory" ADD CONSTRAINT "ApplicationStatusHistory_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationStatusHistory" ADD CONSTRAINT "ApplicationStatusHistory_changedByUserId_fkey" FOREIGN KEY ("changedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationMatch" ADD CONSTRAINT "ApplicationMatch_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecruiterNote" ADD CONSTRAINT "RecruiterNote_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecruiterNote" ADD CONSTRAINT "RecruiterNote_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_embeddings" ADD CONSTRAINT "job_embeddings_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resume_embeddings" ADD CONSTRAINT "resume_embeddings_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;
