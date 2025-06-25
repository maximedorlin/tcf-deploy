import React, { useState, useRef, useEffect } from "react";
import jsPDF from "jspdf";
import autoTable, { HookData, type UserOptions } from "jspdf-autotable";
import * as XLSX from "xlsx";

const weights = (index: number): number => {
  if (index >= 1 && index <= 4) return 4;
  if (index >= 5 && index <= 10) return 8;
  if (index >= 11 && index <= 19) return 15;
  if (index >= 20 && index <= 29) return 21;
  if (index >= 30 && index <= 35) return 27;
  if (index >= 36 && index <= 39) return 33;
  return 0;
};

const groupRanges = [
  { label: "1-4", start: 1, end: 4 },
  { label: "5-10", start: 5, end: 10 },
  { label: "11-19", start: 11, end: 19 },
  { label: "20-29", start: 20, end: 29 },
  { label: "30-35", start: 30, end: 35 },
  { label: "36-39", start: 36, end: 39 },
];

const options = ["A", "B", "C", "D"];

interface AnswerRow {
  selected: string;
  correct: string;
}

interface SubTotal {
  score: number;
  max: number;
}

interface AutoTable extends UserOptions {
  didDrawPage?: (data: HookData) => void;
}

const App: React.FC = () => {
  const [title, setTitle] = useState("");
  const [nom, setNom] = useState("");
  const [answers, setAnswers] = useState<AnswerRow[]>(
    Array.from({ length: 40 }, () => ({ selected: "", correct: "" }))
  );
  const [score, setScore] = useState<{ obtained: number; max: number } | null>(null);
  const [subTotals, setSubTotals] = useState<Record<string, SubTotal>>({});
  const [isLocked, setIsLocked] = useState(false);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [timeLeft, setTimeLeft] = useState(40 * 60); // 40 minutes en secondes
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = () => {
    setTimerActive(true);
  };

  const updateSelection = (rowIndex: number, option: string) => {
    if (isTimeUp || isLocked) return;
    setAnswers((prev) =>
      prev.map((row, i) => (i === rowIndex ? { ...row, selected: option } : row))
    );
  };

  const updateCorrect = (rowIndex: number, correct: string) => {
    // Toujours autorisé à modifier les bonnes réponses
    setAnswers((prev) =>
      prev.map((row, i) => (i === rowIndex ? { ...row, correct } : row))
    );
  };

  const calculate = (answers: AnswerRow[]) => {
    let total = 0;
    let totalMax = 0;
    const subtotals: Record<string, SubTotal> = {};

    groupRanges.forEach((group) => {
      let groupScore = 0;
      let groupMax = 0;

      for (let i = group.start; i <= group.end; i++) {
        const w = weights(i);
        groupMax += w;
        if (answers[i] && answers[i].correct && answers[i].selected === answers[i].correct) {
          groupScore += w;
        }
      }

      subtotals[group.label] = { score: groupScore, max: groupMax };
      total += groupScore;
      totalMax += groupMax;
    });

    return { total, totalMax, subtotals };
  };

  const handleCalculate = () => {
    setIsLocked(true);
    calculateScore();
  };

  const handleExportPDF = () => {
    exportPDF();
  };

  const handleExportExcel = () => {
    exportExcel();
  };

  const calculateScore = () => {
    const { total, totalMax, subtotals } = calculate(answers);
    setSubTotals(subtotals);
    setScore({ obtained: total, max: totalMax });
  };

  const exportPDF = () => {
    const { total, totalMax, subtotals } = calculate(answers);
    const doc = new jsPDF("p", "mm", "a4");

    // Titre
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(`${nom} - ${title}` || "Note-TCF", 105, 15, { align: "center" });

    // Tableau des réponses
    const headers: string[][] = [["N°", "A", "B", "C", "D", "Bonne réponse"]];
    const data: (string | number)[][] = answers.map((row, index) => [
      index,
      row.selected === "A" ? `A${index}` : "",
      row.selected === "B" ? `B${index}` : "",
      row.selected === "C" ? `C${index}` : "",
      row.selected === "D" ? `D${index}` : "",
      row.correct
    ]);

    const tableConfig: AutoTable = {
      head: headers,
      body: data,
      startY: 25,
      styles: {
        fontSize: 10,
        cellPadding: 4,
        valign: "middle",
        halign: "center",
        lineWidth: 0.1,
        lineColor: [100, 100, 100]
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: "bold",
        lineWidth: 0.2,
        halign: "center"
      },
      bodyStyles: {
        halign: "center"
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      columnStyles: {
        0: { cellWidth: 15, lineWidth: 0.3 },
        1: { cellWidth: 20, lineWidth: 0.3 },
        2: { cellWidth: 20, lineWidth: 0.3 },
        3: { cellWidth: 20, lineWidth: 0.3 },
        4: { cellWidth: 20, lineWidth: 0.3 },
        5: { cellWidth: 30, lineWidth: 0.3 }
      },
      tableLineWidth: 0.2,
      tableLineColor: [50, 50, 50],
      didDrawPage: (_data: HookData) => {
        // CORRECTION: Utilisation de la méthode officielle
        const pageCount = doc.getNumberOfPages();
        doc.setFontSize(10);
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.text(`Page ${i}/${pageCount}`, 105, 287, { align: "center" });
        }
      }

    };

    autoTable(doc, tableConfig);

    // Résultats
    const finalY = (doc as any).lastAutoTable.finalY as number;
    const yPos = finalY + 10;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("RÉSULTATS", 105, yPos, { align: "center" });

    let currentY = yPos + 7;
    doc.setFont("helvetica", "normal");
    Object.entries(subtotals).forEach(([range, val]) => {
      doc.text(`✅ Sous-total lignes ${range} : ${val.score} / ${val.max} points`, 15, currentY);
      currentY += 7;
    });

    doc.setFont("helvetica", "bold");
    doc.text(`🏁 Note totale : ${total} / ${totalMax} points`, 15, currentY + 5);

    doc.save(`${nom}-${title || "note-tcf"}.pdf`);
  };

  const exportExcel = () => {
    const { total, totalMax, subtotals } = calculate(answers);
    const workbook = XLSX.utils.book_new();

    // Feuille des réponses
    const answerData = answers.map((row, index) => ({
      "N°": index,
      "Réponse A": row.selected === "A" ? `A${index}` : "",
      "Réponse B": row.selected === "B" ? `B${index}` : "",
      "Réponse C": row.selected === "C" ? `C${index}` : "",
      "Réponse D": row.selected === "D" ? `D${index}` : "",
      "Bonne réponse": row.correct
    }));

    const answerSheet = XLSX.utils.json_to_sheet(answerData);

    // Ajout des bordures et centrage
    const range = XLSX.utils.decode_range(answerSheet['!ref']!);
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cell_address = { c: C, r: R };
        const cell_ref = XLSX.utils.encode_cell(cell_address);

        if (!answerSheet[cell_ref]) continue;

        answerSheet[cell_ref].s = {
          alignment: { horizontal: "center", vertical: "center" },
          border: {
            top: { style: "thin", color: { rgb: "000000" } },
            bottom: { style: "thin", color: { rgb: "000000" } },
            left: { style: "thin", color: { rgb: "000000" } },
            right: { style: "thin", color: { rgb: "000000" } }
          }
        };
      }
    }

    XLSX.utils.book_append_sheet(workbook, answerSheet, "Réponses");

    // Feuille des résultats avec centrage
    const resultData: (string | number)[][] = [
      ["RÉSULTATS", "", "", "", ""],
      ["Groupe", "Score", "Max", "Pourcentage", ""]
    ];

    Object.entries(subtotals).forEach(([range, val]) => {
      const percentage = ((val.score / val.max) * 100).toFixed(1);
      resultData.push([
        `Lignes ${range}`,
        val.score,
        val.max,
        `${percentage}%`,
        val.score === val.max ? "✅" : ""
      ]);
    });

    resultData.push([]);
    const totalPercentage = ((total / totalMax) * 100).toFixed(1);
    resultData.push([
      "TOTAL",
      total,
      totalMax,
      `${totalPercentage}%`,
      total === totalMax ? "✅" : ""
    ]);

    const resultSheet = XLSX.utils.aoa_to_sheet(resultData);

    // Appliquer le centrage aux résultats
    const resultRange = XLSX.utils.decode_range(resultSheet['!ref']!);
    for (let R = resultRange.s.r; R <= resultRange.e.r; ++R) {
      for (let C = resultRange.s.c; C <= resultRange.e.c; ++C) {
        const cell_ref = XLSX.utils.encode_cell({ r: R, c: C });
        if (resultSheet[cell_ref]) {
          resultSheet[cell_ref].s = resultSheet[cell_ref].s || {};
          resultSheet[cell_ref].s.alignment = {
            horizontal: "center",
            vertical: "center"
          };
        }
      }
    }

    XLSX.utils.book_append_sheet(workbook, resultSheet, "Résultats");

    // Ajustement des largeurs de colonnes
    const wscols = [
      { wch: 8 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
      { wch: 15 }
    ];
    answerSheet["!cols"] = wscols;

    const resultCols = [
      { wch: 18 },
      { wch: 10 },
      { wch: 10 },
      { wch: 15 },
      { wch: 8 }
    ];
    resultSheet["!cols"] = resultCols;

    XLSX.writeFile(workbook, `${nom}-${title || "Note"}-tcf.xlsx`);
  };

  return (
    <div className="max-w-screen-lg mx-auto p-4 sm:p-6 font-sans bg-gray-50 min-h-screen flex flex-col items-center">
      <div className="w-full max-w-4xl">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-blue-700">Calculatrice de Score TCF</h1>

        {/* Chronomètre et bouton Start */}
        <div className="mb-4 text-center">
          <div className="text-xl font-bold text-red-600 mb-2">
            Temps restant: {formatTime(timeLeft)}
          </div>
          {!timerActive && timeLeft > 0 && (
            <button
              onClick={startTimer}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 sm:px-5 sm:py-3 text-sm sm:text-base rounded-lg shadow transition duration-300"
            >
              Démarrer le chronomètre
            </button>
          )}
          {isTimeUp && (
            <div className="text-red-700 font-bold mt-2">
              Temps écoulé ! Veuillez entrer les bonnes réponses et calculer votre score.
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6">
            <div>
              <label className="block text-sm sm:text-base text-gray-700 font-medium mb-1 sm:mb-2">
                Nom du candidat
              </label>
              <input
                type="text"
                placeholder="Entrez votre nom"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                className="w-full p-2 sm:p-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              />
            </div>

            <div>
              <label className="block text-sm sm:text-base text-gray-700 font-medium mb-1 sm:mb-2">
                Titre de l'épreuve
              </label>
              <input
                type="text"
                placeholder="Ex: TCF Expression Orale"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 sm:p-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              />
            </div>
          </div>

          <div ref={pdfRef} id="pdf-content" className="bg-white p-3 sm:p-6 rounded-lg border border-gray-200">
            {nom && title && (
              <h2 className="text-lg sm:text-xl font-semibold text-center mb-4 text-gray-800">
                {nom} - {title}
              </h2>
            )}

            <div className="overflow-x-auto">
              <table className="w-full border-collapse mb-4 text-center text-xs sm:text-sm">
                <thead className="bg-blue-600 text-white">
                  <tr>
                    <th className="border border-blue-800 px-2 py-2 sm:px-4 sm:py-3">N°</th>
                    {options.map((opt) => (
                      <th key={opt} className="border border-blue-800 px-2 py-2 sm:px-4 sm:py-3">
                        {opt}
                      </th>
                    ))}
                    <th className="border border-blue-800 px-2 py-2 sm:px-4 sm:py-3">Bonne réponse</th>
                  </tr>
                </thead>
                <tbody>
                  {answers.map((row, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className={isLocked ? "bg-gray-200" : (rowIndex % 2 === 0 ? "bg-gray-50" : "bg-white")}
                    >
                      <td className="border border-gray-300 px-2 py-2 sm:px-4 sm:py-3 font-semibold">
                        {rowIndex}
                      </td>
                      {options.map((opt) => (
                        <td
                          key={opt}
                          className={`border border-gray-300 px-1 py-1 sm:px-2 sm:py-2 ${isTimeUp ? "bg-gray-100" : ""
                            }`}
                        >
                          <div className="flex justify-center">
                            <input
                              type="radio"
                              name={`row-${rowIndex}`}
                              value={opt}
                              checked={row.selected === opt}
                              onChange={() => updateSelection(rowIndex, opt)}
                              className={`w-4 h-4 sm:w-5 sm:h-5 text-blue-600 ${isTimeUp ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                              disabled={isTimeUp}
                            />
                          </div>
                        </td>
                      ))}
                      <td className="border border-gray-300 px-1 py-1 sm:px-2 sm:py-2">
                        <select
                          value={row.correct}
                          onChange={(e) => updateCorrect(rowIndex, e.target.value)}
                          className="w-full p-1 sm:p-2 text-xs sm:text-sm border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">--</option>
                          {options.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-2 sm:space-y-4 mt-6">
              {Object.entries(subTotals).map(([range, val]) => (
                <div key={range} className="text-xs sm:text-sm font-medium bg-blue-50 p-2 sm:p-3 rounded-lg border border-blue-200">
                  ✅ Sous-total lignes {range} : {val.score} / {val.max} points
                </div>
              ))}
            </div>

            {score !== null && (
              <div className="mt-6 p-3 sm:p-4 bg-green-100 rounded-lg sm:rounded-xl text-base sm:text-lg font-bold text-center border border-green-300 sm:border-2">
                🏁 Note totale : {score.obtained} / {score.max} points
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-2 sm:gap-3 mt-6 print:hidden">
            <button
              onClick={handleCalculate}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 sm:px-5 sm:py-3 text-sm sm:text-base rounded-lg shadow transition duration-300"
            >
              Calculer la note
            </button>
            <button
              onClick={handleExportPDF}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 sm:px-5 sm:py-3 text-sm sm:text-base rounded-lg shadow transition duration-300"
            >
              Télécharger PDF
            </button>
            <button
              onClick={handleExportExcel}
              className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 sm:px-5 sm:py-3 text-sm sm:text-base rounded-lg shadow transition duration-300"
            >
              Exporter Excel
            </button>

            {isLocked && (
              <button
                onClick={() => setIsLocked(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 sm:px-5 sm:py-3 text-sm sm:text-base rounded-lg shadow transition duration-300"
              >
                Modifier
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;