"use client";
import { Button } from "@/components/ui/button";
import { Download, FileText, Table } from "lucide-react";
import { PDFExporter, ExcelExporter } from "@/utils/exporters";
import { AnswerRow } from "@/utils/types";

interface ExportButtonsProps {
  nom: string;
  title: string;
  answers: AnswerRow[];
  onCalculate: () => void;
  isLocked: boolean;
  onToggleLock: () => void;
}

export function ExportButtons({ nom, title, answers, onCalculate, isLocked, onToggleLock }: ExportButtonsProps) {
  const handlePDFExport = () => PDFExporter.export(nom, title, answers);
  const handleExcelExport = () => ExcelExporter.export(nom, title, answers);

  return (
    <div className="flex flex-wrap gap-3 justify-center">
      {!isLocked ? (
        <Button 
          onClick={onCalculate}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
          size="lg"
        >
          📊 Calculer le score
        </Button>
      ) : (
        <>
          <Button 
            onClick={handlePDFExport}
            variant="outline"
            className="border-green-600 text-green-700 hover:bg-green-50"
            size="lg"
          >
            <FileText className="w-4 h-4 mr-2" />
            PDF
          </Button>
          
          <Button 
            onClick={handleExcelExport}
            variant="outline"
            className="border-amber-600 text-amber-700 hover:bg-amber-50"
            size="lg"
          >
            <Table className="w-4 h-4 mr-2" />
            Excel
          </Button>
          
          <Button 
            onClick={onToggleLock}
            variant="outline"
            className="border-gray-600 text-gray-700 hover:bg-gray-50"
            size="lg"
          >
            ✏️ Modifier
          </Button>
        </>
      )}
    </div>
  );
}