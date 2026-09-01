import { companies, getCompanyById, jobs } from '@/src/data/mockData';
import { DEMO_ACCOUNTS } from '@/src/domain/constants';
import { useAppStore } from '@/src/store/useAppStore';

const NETWORK_DELAY = 220;

function respond(value, delay = NETWORK_DELAY) {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(value), delay);
  });
}

function normalise(value = '') {
  return value.trim().toLocaleLowerCase();
}

function availableJobs() {
  const localJobs = useAppStore.getState().recruiterDrafts.filter((job) => job.status === 'Published');
  const merged = new Map(jobs.map((job) => [job.id, job]));
  localJobs.forEach((job) => merged.set(job.id, job));
  return [...merged.values()];
}

export const catalogService = {
  async listJobs(filters = {}) {
    const keyword = normalise(filters.keyword);
    const location = normalise(filters.location);
    const selectedTypes = filters.types || [];
    const selectedModes = filters.modes || [];

    const result = availableJobs().filter((job) => {
      const company = getCompanyById(job.companyId);
      const searchable = [job.title, company?.name, job.summary, ...job.skills].join(' ').toLocaleLowerCase();
      const matchesKeyword = !keyword || searchable.includes(keyword);
      const matchesLocation = !location || normalise(job.location).includes(location) || normalise(job.workMode).includes(location);
      const matchesExperience = !filters.experience || job.experience === filters.experience;
      const matchesType = !selectedTypes.length || selectedTypes.includes(job.employmentType);
      const matchesMode = !selectedModes.length || selectedModes.includes(job.workMode);
      return matchesKeyword && matchesLocation && matchesExperience && matchesType && matchesMode;
    });

    return respond(result);
  },

  async getJob(jobId) {
    return respond(availableJobs().find((job) => job.id === jobId) || null);
  },

  async listCompanies() {
    return respond(companies);
  },

  async getCompany(companyId) {
    return respond(companies.find((company) => company.id === companyId) || null);
  },
};

export const authService = {
  async login(email, password) {
    const account = DEMO_ACCOUNTS.find(
      (item) => item.email.toLocaleLowerCase() === email.trim().toLocaleLowerCase() && item.password === password,
    );
    if (!account) {
      await respond(null, 360);
      throw new Error('Email or password is incorrect. Try one of the demo accounts.');
    }
    return respond({
      id: `demo-${account.role}`,
      email: account.email,
      role: account.role,
      name: account.role === 'applicant' ? 'Ananya Rao' : account.role === 'recruiter' ? 'Rohan Mehta' : 'Platform Admin',
    }, 360);
  },
};
