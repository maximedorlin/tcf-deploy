"use client";
import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Timer } from "@/components/Timer";
import { HeaderForm } from "@/components/HeaderForm";
import { AnswerTable } from "@/components/AnswerTable";
import { ScoreDisplay } from "@/components/ScoreDisplay";
import { ExportButtons } from "@/components/ExportButtons";
import { AnswerRow, ScoreResult, SubTotal } from "@/utils/types";
import { INITIAL_ANSWERS, EXAM_DURATION } from "@/utils/constants";
import { calculateScores } from "@/utils/calculations";

export default function Home() {
  const [title, setTitle] = useState("");
  const [nom, setNom] = useState("");
  const [answers, setAnswers] = useState<AnswerRow[]>(INITIAL_ANSWERS);
  const [score, setScore] = useState<ScoreResult | null>(null);
  const [subTotals, setSubTotals] = useState<Record<string, SubTotal>>({});
  const [isLocked, setIsLocked] = useState(false);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [timeLeft, setTimeLeft] = useState(EXAM_DURATION);
  const [timerActive, setTimerActive] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

  // Gestion du chronomètre
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerActive) {
      setTimerActive(false);
      setIsTimeUp(true);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, timeLeft]);

  const startTimer = () => setTimerActive(true);

  const updateSelection = (rowIndex: number, option: string) => {
    if (isTimeUp || isLocked) return;
    setAnswers(prev => prev.map((row, i) => 
      i === rowIndex ? { ...row, selected: option } : row
    ));
  };

  const updateCorrect = (rowIndex: number, correct: string) => {
    setAnswers(prev => prev.map((row, i) => 
      i === rowIndex ? { ...row, correct } : row
    ));
  };
  const handleCalculate = () => {
    const { total, totalMax, subtotals } = calculateScores(answers);
    setSubTotals(subtotals);
    setScore({ obtained: total, max: totalMax });
    setIsLocked(true);
  };

  const handleToggleLock = () => setIsLocked(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-25 to-gray-25 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* En-tête */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            🎯 Calculateur de Score TCF
          </h1>
          <p className="text-lg text-gray-600">
            Outil professionnel pour l&apos;évaluation et l&apos;analyse des résultats TCF
          </p>
        </div>

        {/* Chronomètre */}
        <Timer 
          timeLeft={timeLeft}
          timerActive={timerActive}
          isTimeUp={isTimeUp}
          onStartTimer={startTimer}
        />

        {/* Formulaire en-tête */}
        <HeaderForm 
          nom={nom}
          title={title}
          onNomChange={setNom}
          onTitleChange={setTitle}
        />

        {/* Contenu principal */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Grille de réponses */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6" ref={pdfRef}>
                {nom && title && (
                  <div className="text-center mb-6 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                    <h2 className="text-xl font-semibold text-blue-900">
                      {nom} - {title}
                    </h2>
                  </div>
                )}
                
                <AnswerTable
                  answers={answers}
                  isLocked={isLocked}
                  isTimeUp={isTimeUp}
                  onUpdateSelection={updateSelection}
                  onUpdateCorrect={updateCorrect}
                />
              </CardContent>
            </Card>
          </div>

          {/* Résultats et actions */}
          <div className="space-y-6">
            <ScoreDisplay score={score} subTotals={subTotals} />
            
            <Card>
              <CardContent className="p-6">
                <ExportButtons
                  nom={nom}
                  title={title}
                  answers={answers}
                  onCalculate={handleCalculate}
                  isLocked={isLocked}
                  onToggleLock={handleToggleLock}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
