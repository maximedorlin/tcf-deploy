import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { AnswerRow, SubTotal } from './types';
import { calculateScores } from './calculations';

export class PDFExporter {
  static export(nom: string, title: string, answers: AnswerRow[]) {
    const { total, totalMax, subtotals } = calculateScores(answers);
    const doc = new jsPDF("p", "mm", "a4");

    // En-tête stylisé
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(41, 128, 185);
    doc.text(`${nom} - ${title}` || "Note-TCF", 105, 20, { align: "center" });

    // Tableau des réponses avec design amélioré
    const headers = [["N°", "A", "B", "C", "D", "Bonne réponse"]];
    const data = answers.map((row) => [
      row.number,
      row.selected === "A" ? "●" : "",
      row.selected === "B" ? "●" : "",
      row.selected === "C" ? "●" : "",
      row.selected === "D" ? "●" : "",
      row.correct
    ]);

    autoTable(doc, {
      head: headers,
      body: data,
      startY: 30,
      styles: {
        fontSize: 9,
        cellPadding: 4,
        valign: "middle",
        halign: "center",
        lineWidth: 0.1,
        lineColor: [200, 200, 200]
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
        fillColor: [248, 250, 252]
      },
      columnStyles: {
        0: { cellWidth: 15, fillColor: [241, 245, 249] },
        1: { cellWidth: 25 },
        2: { cellWidth: 25 },
        3: { cellWidth: 25 },
        4: { cellWidth: 25 },
        5: { cellWidth: 40, fillColor: [254, 252, 232] }
      },
    });

    // Section résultats avec design amélioré
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.setTextColor(41, 128, 185);
    doc.text("RÉSULTATS DÉTAILLÉS", 105, finalY, { align: "center" });

    let currentY = finalY + 10;
    doc.setFontSize(10);
    doc.setTextColor(75, 85, 99);

    Object.entries(subtotals).forEach(([range, val]) => {
      const percentage = ((val.score / val.max) * 100).toFixed(1);
      doc.text(`✅ Section ${range} : ${val.score}/${val.max} points (${percentage}%)`, 20, currentY);
      currentY += 6;
    });

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(21, 128, 61);
    doc.text(`🏅 SCORE FINAL : ${total} / ${totalMax} points`, 20, currentY + 8);

    doc.save(`${nom}-${title || 'tcf'}-results.pdf`);
  }
}

export class ExcelExporter {
  static export(nom: string, title: string, answers: AnswerRow[]) {
    const { total, totalMax, subtotals } = calculateScores(answers);
    const workbook = XLSX.utils.book_new();

    // Feuille des réponses avec style amélioré
    const answerData = answers.map((row) => ({
      "N°": row.number,
      "Réponse A": row.selected === "A" ? "●" : "",
      "Réponse B": row.selected === "B" ? "●" : "",
      "Réponse C": row.selected === "C" ? "●" : "",
      "Réponse D": row.selected === "D" ? "●" : "",
      "Bonne réponse": row.correct,
      "Statut": row.correct && row.selected === row.correct ? "✅ Correct" : 
               row.selected ? "❌ Incorrect" : "⏸️ Non répondu"
    }));

    const answerSheet = XLSX.utils.json_to_sheet(answerData);
    
    // Feuille des résultats détaillés
    const resultData = [
      ["RAPPORT DE SCORE TCF", "", "", "", ""],
      ["Candidat:", nom, "", "Épreuve:", title],
      [""],
      ["DÉTAIL PAR SECTION", "Score", "Maximum", "Pourcentage", "Statut"]
    ];

    Object.entries(subtotals).forEach(([range, val]) => {
      const percentage = ((val.score / val.max) * 100).toFixed(1);
      resultData.push([
        `Questions ${range}`,
        val.score,
        val.max,
        `${percentage}%`,
        val.score === val.max ? "🎯 Excellent" : val.score >= val.max * 0.7 ? "✅ Bon" : "⚠️ À revoir"
      ]);
    });

    resultData.push([""]);
    const totalPercentage = ((total / totalMax) * 100).toFixed(1);
    resultData.push([
      "SCORE TOTAL",
      total,
      totalMax,
      `${totalPercentage}%`,
      total === totalMax ? "🏆 Parfait" : 
      total >= totalMax * 0.8 ? "🎉 Excellent" :
      total >= totalMax * 0.6 ? "👍 Satisfaisant" : "📚 À travailler"
    ]);

    const resultSheet = XLSX.utils.aoa_to_sheet(resultData);

    XLSX.utils.book_append_sheet(workbook, answerSheet, "Réponses détaillées");
    XLSX.utils.book_append_sheet(workbook, resultSheet, "Analyse des résultats");

    XLSX.writeFile(workbook, `${nom}-${title || 'TCF'}-analyse.xlsx`);
  }
}