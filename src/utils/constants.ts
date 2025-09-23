// constants.ts
import { AnswerRow, GroupRange } from './types';

export const OPTIONS = ["A", "B", "C", "D"] as const;
export const TOTAL_QUESTIONS = 39;
export const EXAM_DURATION = 35 * 60; // 35 minutes en secondes

export const GROUP_RANGES: GroupRange[] = [
  { label: "1-4", start: 1, end: 4, points: 3 },
  { label: "5-10", start: 5, end: 10, points: 9 },
  { label: "11-19", start: 11, end: 19, points: 15 },
  { label: "20-29", start: 20, end: 29, points: 21 },
  { label: "30-35", start: 30, end: 35, points: 26 },
  { label: "36-39", start: 36, end: 39, points: 33 },
];

export const INITIAL_ANSWERS: AnswerRow[] = Array.from({ length: TOTAL_QUESTIONS }, (_, i) => ({
  selected: "",
  correct: "",
  number: i + 1
}));