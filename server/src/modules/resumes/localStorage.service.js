import { randomUUID } from 'node:crypto';
import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const defaultRoot = fileURLToPath(new URL('../../../storage/uploads/', import.meta.url));
const storageKeyPattern = /^resumes\/\d{4}\/\d{2}\/[0-9a-f-]+\.(pdf|docx)$/;

function resolveStoragePath(rootDirectory, storageKey) {
  if (!storageKeyPattern.test(storageKey)) throw new Error('Invalid résumé storage key.');
  return path.join(rootDirectory, ...storageKey.split('/'));
}

export function createLocalStorageService({ rootDirectory = defaultRoot } = {}) {
  const root = path.resolve(rootDirectory);

  return Object.freeze({
    async save(buffer, { extension, now = new Date() }) {
      const year = String(now.getUTCFullYear());
      const month = String(now.getUTCMonth() + 1).padStart(2, '0');
      const storageKey = `resumes/${year}/${month}/${randomUUID()}${extension}`;
      const target = resolveStoragePath(root, storageKey);
      await mkdir(path.dirname(target), { recursive: true });
      await writeFile(target, buffer, { flag: 'wx', mode: 0o600 });
      return { storageProvider: 'local', storageKey };
    },

    async open(storageKey) {
      return readFile(resolveStoragePath(root, storageKey));
    },

    async delete(storageKey) {
      try {
        await unlink(resolveStoragePath(root, storageKey));
        return { deleted: true };
      } catch (error) {
        if (error.code === 'ENOENT') return { deleted: false };
        throw error;
      }
    },
  });
}

export const localStorageService = createLocalStorageService();
