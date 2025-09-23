// types.ts
export interface AnswerRow {
  selected: string;
  correct: string;
  number: number;
}

export interface SubTotal {
  score: number;
  max: number;
}

export interface ScoreResult {
  obtained: number;
  max: number;
}

export interface GroupRange {
  label: string;
  start: number;
  end: number;
  points: number;
}