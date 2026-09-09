import mammoth from 'mammoth';
import { PDFParse } from 'pdf-parse';

const PDF_MIME = 'application/pdf';
const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const MAX_EXTRACTED_CHARACTERS = 200_000;

export function normalizeExtractedText(text) {
  return String(text || '')
    .replace(/\0/g, '')
    .replace(/\r\n?/g, '\n')
    .replace(/[\t ]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, MAX_EXTRACTED_CHARACTERS);
}

export async function extractPdfText(buffer, { createParser } = {}) {
  const parser = createParser ? createParser(buffer) : new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    return result.text;
  } finally {
    await parser.destroy();
  }
}

export async function extractDocxText(buffer) {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

export async function extractResumeText(
  buffer,
  mimeType,
  { readPdf = extractPdfText, readDocx = extractDocxText } = {},
) {
  let text;
  if (mimeType === PDF_MIME) text = await readPdf(buffer);
  else if (mimeType === DOCX_MIME) text = await readDocx(buffer);
  else throw new Error('Unsupported résumé MIME type.');
  return normalizeExtractedText(text);
}
