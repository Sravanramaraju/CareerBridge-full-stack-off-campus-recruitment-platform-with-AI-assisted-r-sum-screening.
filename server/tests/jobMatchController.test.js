import { describe, expect, it, vi } from 'vitest';
import { createGetJobMatchHandler } from '../src/modules/jobs/job.controller.js';

describe('job match controller', () => {
  it('forwards authenticated applicant identity and the validated job identifier', async () => {
    const result = { job: { id: 'job-1' }, match: { overallScore: 82 } };
    const getMatch = vi.fn().mockResolvedValue(result);
    const response = { json: vi.fn((value) => value) };
    await createGetJobMatchHandler({ getMatch })({
      auth: { user: { id: 'applicant-1' } },
      validated: { params: { jobId: 'graduate-engineer' } },
    }, response, vi.fn());
    expect(getMatch).toHaveBeenCalledWith('applicant-1', 'graduate-engineer');
    expect(response.json).toHaveBeenCalledWith({ data: result });
  });
});
