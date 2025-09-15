export interface NlpDoc {
  normalize: (option?: string | object) => NlpDoc;
  out: (formate?: string) => string[] | string;
}
