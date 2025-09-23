import { AnswerRow, SubTotal, GroupRange } from './types';
import { GROUP_RANGES } from './constants';

export const calculateWeight = (index: number): number => {
  if (index >= 1 && index <= 4) return 3;
  if (index >= 5 && index <= 10) return 9;
  if (index >= 11 && index <= 19) return 15;
  if (index >= 20 && index <= 29) return 21;
  if (index >= 30 && index <= 35) return 26;
  if (index >= 36 && index <= 39) return 33;
  return 0;
};

export const calculateScores = (answers: AnswerRow[]) => {
  let total = 0;
  let totalMax = 0;
  const subtotals: Record<string, SubTotal> = {};

  GROUP_RANGES.forEach((group: GroupRange) => {
    let groupScore = 0;
    let groupMax = 0;

    for (let num = group.start; num <= group.end; num++) {
      const weight = calculateWeight(num);
      groupMax += weight;
      const answer = answers.find(a => a.number === num);
      if (answer && answer.correct && answer.selected === answer.correct) {
        groupScore += weight;
      }
    }

    subtotals[group.label] = { score: groupScore, max: groupMax };
    total += groupScore;
    totalMax += groupMax;
  });

  return { total, totalMax, subtotals };
};

export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};