export class PrivateScoreContentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PrivateScoreContentError';
  }
}

export interface PrivateScoreFileStore {
  download(input: {
    url: string;
    choirId: string;
    fileId: string;
    signal: AbortSignal;
  }): Promise<{ uri: string; size: number }>;
  remove(uri: string): Promise<void>;
  clear(): Promise<void>;
}
