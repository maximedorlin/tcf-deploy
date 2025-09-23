"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { SubTotal, ScoreResult } from "@/utils/types";

interface ScoreDisplayProps {
  score: ScoreResult | null;
  subTotals: Record<string, SubTotal>;
}

export function ScoreDisplay({ score, subTotals }: ScoreDisplayProps) {
  if (!score) return null;

  const percentage = (score.obtained / score.max) * 100;

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-900">
            🏆 Résultat Final
            <Badge variant="outline" className="text-green-700">
              {percentage.toFixed(1)}%
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-900 mb-2">
                {score.obtained} / {score.max} points
              </div>
              <Progress value={percentage} className="h-3 bg-green-100" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {Object.entries(subTotals).map(([range, val]) => {
          const sectionPercentage = (val.score / val.max) * 100;
          return (
            <Card key={range} className="bg-blue-25 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-blue-900">Section {range}</span>
                  <Badge variant={sectionPercentage >= 80 ? "default" : "secondary"}>
                    {sectionPercentage.toFixed(0)}%
                  </Badge>
                </div>
                <div className="text-sm text-blue-700">
                  {val.score} / {val.max} points
                </div>
                <Progress value={sectionPercentage} className="h-2 mt-2 bg-blue-100" />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}