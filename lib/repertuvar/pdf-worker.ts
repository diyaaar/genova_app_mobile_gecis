import { pdfjs } from 'react-pdf';

let repertoirePdfWorker: InstanceType<typeof pdfjs.PDFWorker> | undefined;

/** One document-independent worker per browser page, not a private-byte cache.
 * Passing an owned worker prevents PDF.js from destroying/re-fetching its script
 * every time a verified URL switches to/from downloaded offline bytes. Individual
 * loading tasks still destroy their document data. Cold offline launch is not
 * guaranteed: the page must have initialized its worker while online first.
 */
export function getRepertoirePdfWorker() {
  if (typeof window === 'undefined') return undefined;
  if (!repertoirePdfWorker || repertoirePdfWorker.destroyed) {
    repertoirePdfWorker = pdfjs.PDFWorker.create({ name: 'genova-repertoire' });
  }
  return repertoirePdfWorker;
}
