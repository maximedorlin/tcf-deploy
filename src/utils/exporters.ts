import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { AnswerRow } from './types';
import { calculateScores } from './calculations';

export class PDFExporter {
  static export(nom: string, title: string, answers: AnswerRow[]) {
    const { total, totalMax, subtotals } = calculateScores(answers);
    const doc = new jsPDF("p", "mm", "a4");

    // Configuration des marges
    const margin = 15;
    let currentY = margin;

    // Fonction pour vérifier l'espace disponible et ajouter une nouvelle page si nécessaire
    const checkPageBreak = (requiredHeight: number) => {
      const pageHeight = doc.internal.pageSize.height;
      if (currentY + requiredHeight > pageHeight - margin) {
        doc.addPage();
        currentY = margin;
      }
    };

    // En-tête stylisé
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(41, 128, 185);
    doc.text(`${nom} - ${title}` || "Note-TCF", 105, currentY, { align: "center" });
    currentY += 15;

    // Tableau des réponses avec gestion de la pagination
    const headers = [["N°", "A", "B", "C", "D", "Bonne réponse"]];
    const data = answers.map((row) => [
      row.number,
      row.selected === "A" ? "●" : "",
      row.selected === "B" ? "●" : "",
      row.selected === "C" ? "●" : "",
      row.selected === "D" ? "●" : "",
      row.correct || "-"
    ]);

    // Configuration du tableau avec gestion automatique de la pagination
    autoTable(doc, {
      head: headers,
      body: data,
      startY: currentY,
      margin: { top: currentY },
      styles: {
        fontSize: 8,
        cellPadding: 3,
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
        halign: "center",
        fontSize: 9
      },
      bodyStyles: {
        halign: "center",
        fontSize: 8
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      columnStyles: {
        0: { cellWidth: 12, fillColor: [241, 245, 249] },
        1: { cellWidth: 15 },
        2: { cellWidth: 15 },
        3: { cellWidth: 15 },
        4: { cellWidth: 15 },
        5: { cellWidth: 25, fillColor: [254, 252, 232] }
      },
      // Gestion de la pagination automatique avec vérification de null
      didDrawPage: (data) => {
        // Vérifier que cursor n'est pas null avant de l'utiliser
        if (data.cursor) {
          currentY = data.cursor.y + 10;
        }
      }
    });

    // S'assurer que les résultats tiennent sur la dernière page avec vérification de null
    const tableFinalY = (doc as any).lastAutoTable?.finalY;
    const finalY = tableFinalY ? tableFinalY + 10 : currentY + 10;
    currentY = finalY;

    // Vérifier si on a assez d'espace pour les résultats
    checkPageBreak(50);

    // Section résultats compacte
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(41, 128, 185);
    doc.text("RÉSULTATS", 105, currentY, { align: "center" });
    currentY += 8;

    // Tableau compact pour les résultats
    const resultHeaders = [["Section", "Score", "Max", "%", "Statut"]];
    const resultData = Object.entries(subtotals).map(([range, val]) => {
      const percentage = ((val.score / val.max) * 100).toFixed(1);
      let status = "●";
      if (val.score === val.max) status = "✅";
      else if (val.score >= val.max * 0.7) status = "👍";
      else status = "⚠️";

      return [range, val.score.toString(), val.max.toString(), `${percentage}%`, status];
    });

    // Ajouter le total
    const totalPercentage = ((total / totalMax) * 100).toFixed(1);
    resultData.push([
      "TOTAL", 
      total.toString(), 
      totalMax.toString(), 
      `${totalPercentage}%`,
      total === totalMax ? "🏆" : total >= totalMax * 0.8 ? "🎉" : "📊"
    ]);

    autoTable(doc, {
      head: resultHeaders,
      body: resultData,
      startY: currentY,
      styles: {
        fontSize: 9,
        cellPadding: 3,
        halign: "center",
        valign: "middle"
      },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontStyle: "bold"
      },
      bodyStyles: {
        halign: "center"
      },
      columnStyles: {
        0: { cellWidth: 25, halign: "left" },
        1: { cellWidth: 20 },
        2: { cellWidth: 20 },
        3: { cellWidth: 20 },
        4: { cellWidth: 15 }
      },
      // Style spécial pour la dernière ligne (total) avec vérification
      didParseCell: (data) => {
        if (data.row.index === resultData.length - 1) {
          data.cell.styles.fillColor = [34, 197, 94];
          data.cell.styles.textColor = 255;
          data.cell.styles.fontStyle = "bold";
        }
      },
      // Gestion sécurisée de la pagination pour le deuxième tableau
      didDrawPage: (data) => {
        if (data.cursor) {
          currentY = data.cursor.y + 10;
        }
      }
    });

    // Résumé final compact avec vérification de null
    const resultsTableFinalY = (doc as any).lastAutoTable?.finalY;
    const resultsY = resultsTableFinalY ? resultsTableFinalY + 8 : currentY + 8;
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(21, 128, 61);
    
    const summaryText = `SCORE FINAL: ${total} / ${totalMax} points (${totalPercentage}%)`;
    const textWidth = doc.getTextWidth(summaryText);
    const xPosition = (doc.internal.pageSize.width - textWidth) / 2;
    
    doc.text(summaryText, xPosition, resultsY);

    // Pied de page avec numéro de page
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(
        `Page ${i}/${pageCount} - ${new Date().toLocaleDateString()}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: "center" }
      );
    }

    doc.save(`${nom}-${title || 'tcf'}-results.pdf`);
  }
}

// Version alternative si le tableau principal est trop long - Division en deux parties
export class PDFExporterCompact {
  static export(nom: string, title: string, answers: AnswerRow[]) {
    const { total, totalMax, subtotals } = calculateScores(answers);
    const doc = new jsPDF("p", "mm", "a4");

    // Première page : Résultats seulement (plus lisible)
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(41, 128, 185);
    doc.text("RAPPORT DE SCORE TCF", 105, 20, { align: "center" });
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(75, 85, 99);
    doc.text(`Candidat: ${nom}`, 20, 35);
    doc.text(`Épreuve: ${title}`, 20, 42);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 49);

    // Tableau des résultats détaillés
    const resultHeaders = [["Section", "Questions", "Score", "Maximum", "Pourcentage", "Statut"]];
    const resultData = Object.entries(subtotals).map(([range, val]) => {
      const percentage = ((val.score / val.max) * 100).toFixed(1);
      let status = "À revoir";
      if (val.score === val.max) status = "Excellent";
      else if (val.score >= val.max * 0.8) status = "Très bien";
      else if (val.score >= val.max * 0.6) status = "Satisfaisant";

      return [range, `${range}`, val.score.toString(), val.max.toString(), `${percentage}%`, status];
    });

    autoTable(doc, {
      head: resultHeaders,
      body: resultData,
      startY: 60,
      styles: {
        fontSize: 10,
        cellPadding: 4,
        halign: "center",
        valign: "middle"
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: "bold"
      },
      columnStyles: {
        0: { cellWidth: 25, halign: "center" },
        1: { cellWidth: 30, halign: "center" },
        2: { cellWidth: 25, halign: "center" },
        3: { cellWidth: 25, halign: "center" },
        4: { cellWidth: 30, halign: "center" },
        5: { cellWidth: 35, halign: "center" }
      }
    });

    // Score final
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    const totalPercentage = ((total / totalMax) * 100).toFixed(1);
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(21, 128, 61);
    doc.text(`SCORE FINAL: ${total} / ${totalMax} points`, 105, finalY, { align: "center" });
    
    doc.setFontSize(12);
    doc.text(`Pourcentage: ${totalPercentage}%`, 105, finalY + 8, { align: "center" });

    // Deuxième page : Détail des réponses (optionnel)
    doc.addPage();
    
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(41, 128, 185);
    doc.text("DÉTAIL DES RÉPONSES", 105, 20, { align: "center" });

    // Tableau compact des réponses
    const answerHeaders = [["N°", "A", "B", "C", "D", "Correcte"]];
    const answerData = answers.map((row) => [
      row.number,
      row.selected === "A" ? "●" : "",
      row.selected === "B" ? "●" : "",
      row.selected === "C" ? "●" : "",
      row.selected === "D" ? "●" : "",
      row.correct || "-"
    ]);

    autoTable(doc, {
      head: answerHeaders,
      body: answerData,
      startY: 30,
      styles: {
        fontSize: 7,
        cellPadding: 2,
        halign: "center"
      },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontStyle: "bold"
      },
      columnStyles: {
        0: { cellWidth: 12 },
        1: { cellWidth: 12 },
        2: { cellWidth: 12 },
        3: { cellWidth: 12 },
        4: { cellWidth: 12 },
        5: { cellWidth: 15 }
      }
    });

    // Pied de page
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(
        `Page ${i}/${pageCount}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: "center" }
      );
    }

    doc.save(`${nom}-${title || 'tcf'}-rapport.pdf`);
  }
}


export class ExcelExporter {
  static export(nom: string, title: string, answers: AnswerRow[]) {
    const { total, totalMax, subtotals } = calculateScores(answers);
    const workbook = XLSX.utils.book_new();

    // Feuille des réponses
    const answerData = answers.map((row) => ({
      "N°": row.number,
      "Réponse A": row.selected === "A" ? "●" : "",
      "Réponse B": row.selected === "B" ? "●" : "",
      "Réponse C": row.selected === "C" ? "●" : "",
      "Réponse D": row.selected === "D" ? "●" : "",
      "Bonne réponse": row.correct || "",
      "Statut": row.correct && row.selected === row.correct ? "✅ Correct" : 
               row.selected ? "❌ Incorrect" : "⏸️ Non répondu"
    }));

    const answerSheet = XLSX.utils.json_to_sheet(answerData);
    
    // Feuille des résultats - Conversion explicite des nombres en chaînes
    const resultData: (string | number)[][] = [
      ["RAPPORT DE SCORE TCF", "", "", "", ""],
      ["Candidat:", nom, "", "Épreuve:", title],
      ["Date:", new Date().toLocaleDateString(), "", "Heure:", new Date().toLocaleTimeString()],
      [""],
      ["DÉTAIL PAR SECTION", "Score", "Maximum", "Pourcentage", "Statut"]
    ];

    Object.entries(subtotals).forEach(([range, val]) => {
      const percentage = ((val.score / val.max) * 100).toFixed(1);
      resultData.push([
        `Questions ${range}`,
        val.score, // Gardé comme nombre pour les calculs Excel
        val.max,   // Gardé comme nombre pour les calculs Excel
        `${percentage}%`,
        val.score === val.max ? "🎯 Excellent" : val.score >= val.max * 0.7 ? "✅ Bon" : "⚠️ À revoir"
      ]);
    });

    resultData.push([""]);
    const totalPercentage = ((total / totalMax) * 100).toFixed(1);
    resultData.push([
      "SCORE TOTAL",
      total,     // Gardé comme nombre
      totalMax,  // Gardé comme nombre
      `${totalPercentage}%`,
      total === totalMax ? "🏆 Parfait" : 
      total >= totalMax * 0.8 ? "🎉 Excellent" :
      total >= totalMax * 0.6 ? "👍 Satisfaisant" : "📚 À travailler"
    ]);

    const resultSheet = XLSX.utils.aoa_to_sheet(resultData);

    // Optionnel : Définir les types de cellules pour les colonnes numériques
    const range = XLSX.utils.decode_range(resultSheet['!ref']!);
    for (let R = 5; R <= range.e.r; R++) { // À partir de la ligne 5 (en-têtes des données)
      // Colonne Score (index 1)
      const scoreCell = XLSX.utils.encode_cell({ r: R, c: 1 });
      if (resultSheet[scoreCell] && typeof resultSheet[scoreCell].v === 'number') {
        resultSheet[scoreCell].t = 'n'; // Type numérique
      }
      
      // Colonne Maximum (index 2)
      const maxCell = XLSX.utils.encode_cell({ r: R, c: 2 });
      if (resultSheet[maxCell] && typeof resultSheet[maxCell].v === 'number') {
        resultSheet[maxCell].t = 'n'; // Type numérique
      }
    }

    XLSX.utils.book_append_sheet(workbook, answerSheet, "Réponses détaillées");
    XLSX.utils.book_append_sheet(workbook, resultSheet, "Analyse des résultats");

    XLSX.writeFile(workbook, `${nom}-${title || 'TCF'}-analyse.xlsx`);
  }
}
