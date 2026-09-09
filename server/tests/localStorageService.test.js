import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createLocalStorageService } from '../src/modules/resumes/localStorage.service.js';

describe('local résumé storage service', () => {
  let rootDirectory;
  let storage;

  beforeEach(async () => {
    rootDirectory = await mkdtemp(path.join(os.tmpdir(), 'careerbridge-storage-'));
    storage = createLocalStorageService({ rootDirectory });
  });

  afterEach(async () => {
    await rm(rootDirectory, { recursive: true, force: true });
  });

  it('stores private bytes under a random internal key', async () => {
    const buffer = Buffer.from('resume contents');
    const saved = await storage.save(buffer, {
      extension: '.pdf',
      now: new Date('2026-09-09T00:00:00.000Z'),
    });

    expect(saved.storageProvider).toBe('local');
    expect(saved.storageKey).toMatch(/^resumes\/2026\/09\/[0-9a-f-]+\.pdf$/);
    expect(await readFile(path.join(rootDirectory, ...saved.storageKey.split('/')))).toEqual(buffer);
    await expect(storage.open(saved.storageKey)).resolves.toEqual(buffer);
  });

  it('rejects traversal and arbitrary storage paths', async () => {
    await expect(storage.open('../private.txt')).rejects.toThrow('Invalid résumé storage key.');
    await expect(storage.delete('resumes/not-valid.pdf')).rejects.toThrow(
      'Invalid résumé storage key.',
    );
  });

  it('deletes stored bytes idempotently', async () => {
    const saved = await storage.save(Buffer.from('resume'), {
      extension: '.docx',
      now: new Date('2026-09-09T00:00:00.000Z'),
    });

    await expect(storage.delete(saved.storageKey)).resolves.toEqual({ deleted: true });
    await expect(storage.delete(saved.storageKey)).resolves.toEqual({ deleted: false });
  });
});
