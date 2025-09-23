"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface HeaderFormProps {
  nom: string;
  title: string;
  onNomChange: (value: string) => void;
  onTitleChange: (value: string) => void;
}

export function HeaderForm({ nom, title, onNomChange, onTitleChange }: HeaderFormProps) {
  return (
    <Card className="w-full mb-6">
      <CardContent className="p-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="nom" className="text-sm font-medium text-gray-700">
              👤 Nom du candidat
            </Label>
            <Input
              id="nom"
              placeholder="Votre nom complet"
              value={nom}
              onChange={(e) => onNomChange(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium text-gray-700">
              📝 Titre de l'épreuve
            </Label>
            <Input
              id="title"
              placeholder="Ex: TCF Expression Écrite"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              className="w-full"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}