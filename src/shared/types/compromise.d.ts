declare module 'compromise' {
  interface NlpDoc {
    out(method: 'array'): string[];
    out(method: 'text'): string;
    out(method: 'json'): any;

    normalize(): NlpDoc;
    terms(): NlpDoc;
  }

  interface Nlp {
    (text: string): NlpDoc;
  }

  const nlp: Nlp;
  export = nlp;
}
