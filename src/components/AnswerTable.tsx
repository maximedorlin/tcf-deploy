"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AnswerRow } from "@/utils/types";
import { OPTIONS } from "@/utils/constants";

interface AnswerTableProps {
  answers: AnswerRow[];
  isLocked: boolean;
  isTimeUp: boolean;
  onUpdateSelection: (rowIndex: number, option: string) => void;
  onUpdateCorrect: (rowIndex: number, correct: string) => void;
}

// Composant Select personnalisé pour éviter le problème de valeur vide
function CorrectAnswerSelect({ 
  value, 
  onChange, 
  disabled 
}: { 
  value: string; 
  onChange: (value: string) => void; 
  disabled: boolean; 
}) {
  return (
    <Select value={value || "empty"} onValueChange={(val) => onChange(val === "empty" ? "" : val)}>
      <SelectTrigger className="w-32" disabled={disabled}>
        <SelectValue placeholder="--" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="empty">--</SelectItem>
        {OPTIONS.map((opt) => (
          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function AnswerTable({ answers, isLocked, isTimeUp, onUpdateSelection, onUpdateCorrect }: AnswerTableProps) {
  const disabled = isTimeUp || isLocked;

  return (
    <Card className="w-full">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <CardTitle className="flex items-center gap-2">
          📋 Grille de Réponses
          <Badge variant="secondary" className="ml-2">
            {answers.length} questions
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-blue-50 border-b border-blue-100">
                <th className="p-4 text-left font-semibold text-blue-900">N°</th>
                {OPTIONS.map((opt) => (
                  <th key={opt} className="p-4 text-center font-semibold text-blue-900">
                    {opt}
                  </th>
                ))}
                <th className="p-4 text-left font-semibold text-blue-900">Réponse correcte</th>
              </tr>
            </thead>
            <tbody>
              {answers.map((row, index) => (
                <tr 
                  key={index} 
                  className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    isLocked ? "bg-gray-50" : index % 2 === 0 ? "bg-white" : "bg-gray-25"
                  }`}
                >
                  <td className="p-4 font-semibold text-gray-700">{row.number}</td>
                  
                  {OPTIONS.map((opt) => (
                    <td key={opt} className="p-4 text-center">
                      <RadioGroup
                        value={row.selected}
                        onValueChange={(value) => onUpdateSelection(index, value)}
                        className="flex justify-center"
                      >
                        <RadioGroupItem 
                          value={opt} 
                          id={`${index}-${opt}`}
                          disabled={disabled}
                          className="h-5 w-5 text-blue-600"
                        />
                      </RadioGroup>
                    </td>
                  ))}
                  
                  <td className="p-4">
                    <CorrectAnswerSelect
                      value={row.correct}
                      onChange={(value) => onUpdateCorrect(index, value)}
                      disabled={disabled}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}