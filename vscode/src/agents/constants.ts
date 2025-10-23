export const DIAGNOSTIC_COLLECTION_NAME = 'pacy-devtools';

export type PromptRequest = {
  prompt: string;
  files?: string[];
  images?: string[];
};
