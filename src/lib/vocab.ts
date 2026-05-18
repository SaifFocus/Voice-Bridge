// Word vocabularies for ASL/BSL (labels differ slightly per the spec)
export const VOCAB = {
  ASL: [
    "Hello", "Yes", "No", "Thank you", "Help", "Please",
    "Doctor", "Pain", "Medicine", "Water", "I need", "Repeat", "Stop",
  ],
  BSL: [
    "Hello", "Yes", "No", "Cheers", "Help", "Please",
    "Doctor", "Sore", "Tablet", "Water", "I need", "Again", "Stop",
  ],
} as const;

export type SignWord = (typeof VOCAB)["ASL"][number] | (typeof VOCAB)["BSL"][number];
