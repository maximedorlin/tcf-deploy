"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Clock } from "lucide-react";
import { formatTime } from "@/utils/calculations";

interface TimerProps {
  timeLeft: number;
  timerActive: boolean;
  isTimeUp: boolean;
  onStartTimer: () => void;
}

export function Timer({ timeLeft, timerActive, isTimeUp, onStartTimer }: TimerProps) {
  const isCritical = timeLeft < 300; // 5 minutes

  return (
    <Card className="w-full max-w-md mx-auto mb-6">
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Clock className={`h-6 w-6 ${isCritical ? "text-red-500" : "text-blue-500"}`} />
            <span className={`text-2xl font-bold ${isCritical ? "text-red-600" : "text-gray-900"}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
          
          {!timerActive && timeLeft > 0 && (
            <Button 
              onClick={onStartTimer}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              size="lg"
            >
              🚀 Démarrer l'examen
            </Button>
          )}
          
          {isTimeUp && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertCircle className="h-5 w-5" />
              <span className="font-semibold">Temps écoulé ! Finalisez vos réponses.</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}