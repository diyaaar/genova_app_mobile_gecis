import {pdf, wave} from './090-managed-media.mjs';
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScL/nwAAAABJRU5ErkJggg==', 'base64');
export function bytesFor(mime) {
  if (mime === 'application/pdf') return pdf();
  if (mime === 'audio/wav') return wave();
  if (mime === 'image/png') return Buffer.from(png);
  throw Error('Unknown synthetic media refused');
}
