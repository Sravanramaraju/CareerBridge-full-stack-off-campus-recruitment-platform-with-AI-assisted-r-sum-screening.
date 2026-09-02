import { z } from 'zod';

export const jobSchema = z.object({
  title: z.string().min(3, 'Enter a clear job title.'),
  department: z.string().min(2, 'Enter a department.'),
  category: z.string().min(2, 'Choose a role category.'),
  employmentType: z.string().min(1, 'Choose an employment type.'),
  workMode: z.string().min(1, 'Choose a work mode.'),
  location: z.string().min(2, 'Enter at least one location.'),
  openings: z.coerce.number().min(1, 'At least one opening is required.').max(50),
  experienceMin: z.coerce.number().min(0).max(20),
  experienceMax: z.coerce.number().min(0).max(20),
  salaryMin: z.coerce.number().min(0),
  salaryMax: z.coerce.number().min(0),
  hideSalary: z.boolean(),
  qualification: z.string().min(2, 'Add a minimum qualification.'),
  requiredSkills: z.string().min(2, 'Add at least one required skill.'),
  preferredSkills: z.string(),
  description: z.string().min(80, 'Write at least 80 characters about the role.'),
  responsibilities: z.string().min(40, 'Add a few core responsibilities.'),
  deadline: z.string().min(1, 'Choose an application deadline.'),
  contactVisible: z.boolean(),
  screeningQuestions: z.string(),
}).refine((values) => values.experienceMax >= values.experienceMin, { message: 'Maximum must be greater than minimum.', path: ['experienceMax'] })
  .refine((values) => values.hideSalary || values.salaryMax >= values.salaryMin, { message: 'Maximum must be greater than minimum.', path: ['salaryMax'] })
  .refine((values) => values.screeningQuestions.split('\n').filter((question) => question.trim()).length <= 5, { message: 'Add no more than five screening questions.', path: ['screeningQuestions'] });

export const jobStepFields = [
  ['title', 'department', 'category', 'employmentType', 'workMode', 'location', 'openings'],
  ['experienceMin', 'experienceMax', 'salaryMin', 'salaryMax', 'qualification', 'requiredSkills', 'description', 'responsibilities'],
];
