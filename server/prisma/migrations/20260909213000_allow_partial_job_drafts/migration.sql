-- Draft jobs may be saved before the recruiter completes every publish-required field.
-- Publication is guarded in the service layer, while public queries already exclude
-- null deadlines and require PUBLISHED/CLEARED lifecycle state.
ALTER TABLE "Job"
  ALTER COLUMN "location" DROP NOT NULL,
  ALTER COLUMN "workMode" DROP NOT NULL,
  ALTER COLUMN "employmentType" DROP NOT NULL,
  ALTER COLUMN "summary" DROP NOT NULL,
  ALTER COLUMN "description" DROP NOT NULL,
  ALTER COLUMN "qualification" DROP NOT NULL,
  ALTER COLUMN "deadline" DROP NOT NULL;
