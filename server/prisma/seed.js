import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/password.js';
import {
  candidateProfiles,
  companies,
  demoAccounts,
  jobs,
} from './seedData.js';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const DEMO_PASSWORD = 'demo1234';
const resumeRoot = fileURLToPath(
  new URL('../storage/uploads/', import.meta.url),
);

function normalizeSkill(name) {
  return name.trim().toLocaleLowerCase('en-US').replace(/\s+/g, ' ');
}

function createSimplePdf(lines) {
  const escaped = lines.map((line) =>
    line.replaceAll('\\', '\\\\').replaceAll('(', '\\(').replaceAll(')', '\\)'),
  );
  const text = escaped
    .map(
      (line, index) => `BT /F1 12 Tf 72 ${740 - index * 22} Td (${line}) Tj ET`,
    )
    .join('\n');
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>',
    `<< /Length ${Buffer.byteLength(text)} >>\nstream\n${text}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];
  let document = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(document));
    document += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = Buffer.byteLength(document);
  document += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  document += offsets
    .slice(1)
    .map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`)
    .join('');
  document += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(document);
}

async function seedUser(account, passwordHash) {
  return prisma.user.upsert({
    where: { email: account.email },
    update: {
      name: account.name,
      passwordHash,
      role: account.role,
      status: 'ACTIVE',
    },
    create: { ...account, passwordHash, status: 'ACTIVE' },
  });
}

async function seedApplicantProfile(user, details) {
  return prisma.applicantProfile.upsert({
    where: { userId: user.id },
    update: {
      headline: details.headline,
      location: details.location,
      summary: details.summary,
      preferredLocations: details.preferredLocations || [],
      preferredJobTypes: details.preferredJobTypes || ['Full-time'],
      preferredWorkModes: details.preferredWorkModes || ['Hybrid'],
    },
    create: {
      id: `profile-${user.id}`,
      userId: user.id,
      headline: details.headline,
      location: details.location,
      summary: details.summary,
      preferredLocations: details.preferredLocations || [],
      preferredJobTypes: details.preferredJobTypes || ['Full-time'],
      preferredWorkModes: details.preferredWorkModes || ['Hybrid'],
    },
  });
}

async function attachSkills(profileId, skillNames) {
  await prisma.applicantSkill.deleteMany({
    where: { applicantProfileId: profileId },
  });
  await prisma.applicantSkill.createMany({
    data: skillNames.map((name, index) => ({
      applicantProfileId: profileId,
      skillId: `skill-${normalizeSkill(name).replaceAll(/[^a-z0-9]+/g, '-')}`,
      proficiency: index < 2 ? 'ADVANCED' : 'INTERMEDIATE',
      yearsExperience: index < 2 ? 1.5 : 1,
    })),
  });
}

async function seedResume(profile, user, index) {
  const uuid = `00000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`;
  const storageKey = `resumes/2026/09/${uuid}.pdf`;
  const filePath = fileURLToPath(
    new URL(`../storage/uploads/${storageKey}`, import.meta.url),
  );
  const pdf = createSimplePdf([
    `${user.name} — CareerBridge demonstration resume`,
    profile.headline || 'Early-career professional',
    `Location: ${profile.location || 'India'}`,
    'This generated seed document contains fictional portfolio data.',
  ]);
  await mkdir(resumeRoot, { recursive: true });
  await mkdir(
    fileURLToPath(
      new URL(`../storage/uploads/resumes/2026/09/`, import.meta.url),
    ),
    { recursive: true },
  );
  await writeFile(filePath, pdf);
  return prisma.resume.upsert({
    where: { storageKey },
    update: {
      originalFileName: `${user.name.replaceAll(' ', '-')}-Resume.pdf`,
      mimeType: 'application/pdf',
      fileSize: pdf.length,
      isPrimary: true,
      parseStatus: 'READY',
    },
    create: {
      id: `resume-${user.id}`,
      applicantProfileId: profile.id,
      originalFileName: `${user.name.replaceAll(' ', '-')}-Resume.pdf`,
      storageProvider: 'LOCAL',
      storageKey,
      mimeType: 'application/pdf',
      fileSize: pdf.length,
      isPrimary: true,
      parseStatus: 'READY',
      extractedText: `${user.name}. ${profile.headline}. Demonstrated skills and project evidence.`,
      parsedData: { source: 'development-seed', reviewed: true },
    },
  });
}

async function seedCatalog(recruiterId) {
  const allSkillNames = [
    ...new Set(
      jobs.flatMap((job) => [...job.requiredSkills, ...job.preferredSkills]),
    ),
  ];
  await Promise.all(
    allSkillNames.map((name) =>
      prisma.skill.upsert({
        where: { normalizedName: normalizeSkill(name) },
        update: { name },
        create: {
          id: `skill-${normalizeSkill(name).replaceAll(/[^a-z0-9]+/g, '-')}`,
          name,
          normalizedName: normalizeSkill(name),
        },
      }),
    ),
  );

  for (const company of companies) {
    await prisma.company.upsert({
      where: { id: company.id },
      update: { ...company, verifiedAt: new Date('2026-08-01T09:00:00.000Z') },
      create: { ...company, verifiedAt: new Date('2026-08-01T09:00:00.000Z') },
    });
  }

  await prisma.companyMember.upsert({
    where: {
      companyId_userId: { companyId: 'northstar-labs', userId: recruiterId },
    },
    update: { role: 'OWNER' },
    create: { companyId: 'northstar-labs', userId: recruiterId, role: 'OWNER' },
  });

  for (const job of jobs) {
    const { requiredSkills, preferredSkills, ...jobData } = job;
    await prisma.job.upsert({
      where: { id: job.id },
      update: { ...jobData, createdByUserId: recruiterId },
      create: { ...jobData, createdByUserId: recruiterId },
    });
    await prisma.jobSkill.deleteMany({ where: { jobId: job.id } });
    await prisma.jobSkill.createMany({
      data: [
        ...requiredSkills.map((name) => ({
          jobId: job.id,
          skillId: `skill-${normalizeSkill(name).replaceAll(/[^a-z0-9]+/g, '-')}`,
          requirement: 'REQUIRED',
        })),
        ...preferredSkills.map((name) => ({
          jobId: job.id,
          skillId: `skill-${normalizeSkill(name).replaceAll(/[^a-z0-9]+/g, '-')}`,
          requirement: 'PREFERRED',
        })),
      ],
    });
    await prisma.jobScreeningQuestion.deleteMany({ where: { jobId: job.id } });
    await prisma.jobScreeningQuestion.createMany({
      data: [
        {
          id: `question-${job.id}-1`,
          jobId: job.id,
          sortOrder: 0,
          required: true,
          question: 'What evidence best demonstrates your fit for this role?',
        },
        {
          id: `question-${job.id}-2`,
          jobId: job.id,
          sortOrder: 1,
          required: false,
          question: 'When would you be available to start?',
        },
      ],
    });
  }
}

async function seedApplication({
  id,
  applicantId,
  jobId,
  resumeId,
  status,
  score,
  actorId,
}) {
  const application = await prisma.application.upsert({
    where: { applicantId_jobId: { applicantId, jobId } },
    update: {
      resumeId,
      status,
      coverNote:
        'I am excited to contribute relevant project evidence and continue learning with this team.',
    },
    create: {
      id,
      applicantId,
      jobId,
      resumeId,
      status,
      coverNote:
        'I am excited to contribute relevant project evidence and continue learning with this team.',
    },
  });
  await prisma.applicationStatusHistory.deleteMany({
    where: { applicationId: application.id },
  });
  await prisma.applicationStatusHistory.createMany({
    data: [
      {
        applicationId: application.id,
        previousStatus: null,
        newStatus: 'APPLIED',
        changedByUserId: applicantId,
        reason: 'Application submitted.',
      },
      ...(status === 'APPLIED'
        ? []
        : [
            {
              applicationId: application.id,
              previousStatus: 'APPLIED',
              newStatus: status,
              changedByUserId: actorId,
              reason: 'Updated during demonstration review.',
            },
          ]),
    ],
  });
  await prisma.applicationMatch.upsert({
    where: { applicationId: application.id },
    update: {
      overallScore: score,
      requiredSkillScore: score,
      preferredSkillScore: Math.max(score - 8, 0),
      experienceScore: 75,
      preferenceScore: 100,
      semanticAvailable: false,
      requiredSkillsMatched: [],
      requiredSkillsMissing: [],
      preferredSkillsMatched: [],
      explanation: {
        summary: 'Transparent structured seed score for demonstration only.',
      },
    },
    create: {
      applicationId: application.id,
      overallScore: score,
      requiredSkillScore: score,
      preferredSkillScore: Math.max(score - 8, 0),
      experienceScore: 75,
      preferenceScore: 100,
      semanticAvailable: false,
      requiredSkillsMatched: [],
      requiredSkillsMissing: [],
      preferredSkillsMatched: [],
      explanation: {
        summary: 'Transparent structured seed score for demonstration only.',
      },
    },
  });
  return application;
}

async function main() {
  const passwordHash = await hashPassword(DEMO_PASSWORD);
  const applicant = await seedUser(demoAccounts.applicant, passwordHash);
  const recruiter = await seedUser(demoAccounts.recruiter, passwordHash);
  const admin = await seedUser(demoAccounts.admin, passwordHash);

  await prisma.userPreference.upsert({
    where: { userId: applicant.id },
    update: {},
    create: { userId: applicant.id },
  });
  await prisma.userPreference.upsert({
    where: { userId: recruiter.id },
    update: {},
    create: { userId: recruiter.id },
  });
  await prisma.recruiterProfile.upsert({
    where: { userId: recruiter.id },
    update: {
      title: 'University Hiring Lead',
      bio: 'Building fair, skills-first early-career hiring programmes.',
    },
    create: {
      id: 'profile-demo-recruiter',
      userId: recruiter.id,
      title: 'University Hiring Lead',
      bio: 'Building fair, skills-first early-career hiring programmes.',
    },
  });

  await seedCatalog(recruiter.id);

  const applicantProfile = await seedApplicantProfile(applicant, {
    headline: 'Graduate frontend developer focused on accessible products',
    location: 'Hyderabad, Telangana',
    summary:
      'Computer science graduate who enjoys translating user needs into reliable, accessible web experiences.',
    preferredLocations: [
      'Hyderabad, Telangana',
      'Bengaluru, Karnataka',
      'Remote, India',
    ],
    preferredWorkModes: ['Hybrid', 'Remote'],
  });
  await attachSkills(applicantProfile.id, [
    'React',
    'JavaScript',
    'CSS',
    'Git',
    'REST APIs',
    'SQL',
  ]);
  await prisma.applicantEducation.upsert({
    where: { id: 'education-demo-applicant' },
    update: {
      institution: 'Jawaharlal Nehru Technological University',
      qualification: 'B.Tech',
      fieldOfStudy: 'Computer Science',
      startYear: 2022,
      endYear: 2026,
    },
    create: {
      id: 'education-demo-applicant',
      applicantProfileId: applicantProfile.id,
      institution: 'Jawaharlal Nehru Technological University',
      qualification: 'B.Tech',
      fieldOfStudy: 'Computer Science',
      startYear: 2022,
      endYear: 2026,
    },
  });
  await prisma.applicantProject.upsert({
    where: { id: 'project-demo-careerbridge' },
    update: {
      name: 'CareerBridge recruitment platform',
      description:
        'Built an accessible full-stack recruitment workflow with transparent candidate matching.',
      technologies: ['React', 'Node.js', 'PostgreSQL'],
    },
    create: {
      id: 'project-demo-careerbridge',
      applicantProfileId: applicantProfile.id,
      name: 'CareerBridge recruitment platform',
      description:
        'Built an accessible full-stack recruitment workflow with transparent candidate matching.',
      technologies: ['React', 'Node.js', 'PostgreSQL'],
    },
  });
  const applicantResume = await seedResume(applicantProfile, applicant, 0);

  const demoApplications = [
    ['application-demo-1', 'frontend-engineer-northstar', 'UNDER_REVIEW', 88],
    ['application-demo-2', 'data-analyst-meridian', 'INTERVIEW', 81],
    ['application-demo-3', 'business-analyst-greenroute', 'SHORTLISTED', 78],
  ];
  for (const [id, jobId, status, score] of demoApplications) {
    await seedApplication({
      id,
      applicantId: applicant.id,
      jobId,
      resumeId: applicantResume.id,
      status,
      score,
      actorId: recruiter.id,
    });
  }
  await prisma.savedJob.createMany({
    data: [
      'qa-engineer-northstar',
      'backend-engineer-clinivo',
      'product-design-intern-paperplane',
    ].map((jobId) => ({ applicantId: applicant.id, jobId })),
    skipDuplicates: true,
  });

  for (const [index, candidate] of candidateProfiles.entries()) {
    const user = await seedUser(
      {
        id: candidate.id,
        email: candidate.email,
        name: candidate.name,
        role: 'APPLICANT',
      },
      passwordHash,
    );
    const profile = await seedApplicantProfile(user, {
      headline: candidate.headline,
      location: candidate.location,
      summary: `${candidate.name} is a fictional demonstration candidate with relevant project and learning evidence.`,
      preferredLocations: [candidate.location],
    });
    await attachSkills(profile.id, candidate.skills);
    const resume = await seedResume(profile, user, index + 1);
    await seedApplication({
      id: `application-${candidate.id}`,
      applicantId: user.id,
      jobId: candidate.jobId,
      resumeId: resume.id,
      status: candidate.status,
      score: 92 - index * 3,
      actorId: recruiter.id,
    });
  }

  await prisma.notification.deleteMany({
    where: { id: { startsWith: 'seed-notification-' } },
  });
  await prisma.notification.createMany({
    data: [
      {
        id: 'seed-notification-applicant-1',
        userId: applicant.id,
        type: 'APPLICATION_STATUS_CHANGED',
        title: 'Application moved to interview',
        message: 'Meridian Fintech would like to continue the conversation.',
        entityType: 'application',
        entityId: 'application-demo-2',
      },
      {
        id: 'seed-notification-applicant-2',
        userId: applicant.id,
        type: 'JOB_PUBLISHED',
        title: 'New matching role',
        message: 'A new engineering role matches your saved preferences.',
        entityType: 'job',
        entityId: 'qa-engineer-northstar',
      },
      {
        id: 'seed-notification-recruiter-1',
        userId: recruiter.id,
        type: 'APPLICATION_RECEIVED',
        title: 'New application received',
        message: 'A candidate applied for Graduate Frontend Engineer.',
        entityType: 'job',
        entityId: 'frontend-engineer-northstar',
      },
      {
        id: 'seed-notification-admin-1',
        userId: admin.id,
        type: 'COMPANY_VERIFICATION_CHANGED',
        title: 'Platform demonstration ready',
        message:
          'Seeded companies and moderation records are available for review.',
        entityType: 'company',
        entityId: 'northstar-labs',
      },
    ],
  });

  const counts = await Promise.all([
    prisma.user.count(),
    prisma.company.count(),
    prisma.job.count(),
    prisma.application.count(),
  ]);
  console.log(
    `Seed complete: ${counts[0]} users, ${counts[1]} companies, ${counts[2]} jobs, ${counts[3]} applications.`,
  );
}

try {
  await main();
} finally {
  await prisma.$disconnect();
}
