
import React, { useState } from 'react';
import { Difficulty, TimeOption } from '../types';
import Button from './Button';

interface ConfigurationScreenProps {
  currentDuration: number;
  currentDifficulty: Difficulty;
  onSave: (newDuration: number, newDifficulty: Difficulty) => void;
  timeOptions: TimeOption[];
  difficulties: Difficulty[];
}

const ConfigurationScreen: React.FC<ConfigurationScreenProps> = ({
  currentDuration,
  currentDifficulty,
  onSave,
  timeOptions,
  difficulties,
}) => {
  const [selectedDuration, setSelectedDuration] = useState<number>(currentDuration);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(currentDifficulty);

  const handleSave = () => {
    onSave(selectedDuration, selectedDifficulty);
  };

  return (
    <div className="w-full max-w-lg mx-auto p-6 sm:p-8 bg-slate-900/70 backdrop-blur-2xl rounded-3xl shadow-2xl border border-slate-700/50 text-slate-100">
      <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-center text-gradient bg-gradient-to-r from-sky-400 via-cyan-400 to-teal-400">
        Configurações
      </h1>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-3 text-slate-200">Duração do Jogo</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {timeOptions.map(option => (
            <Button
              key={option.id}
              variant="config"
              size="md"
              active={selectedDuration === option.value}
              onClick={() => setSelectedDuration(option.value)}
              className="text-sm sm:text-base"
            >
              {option.name}
            </Button>
          ))}
        </div>
      </div>

      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-3 text-slate-200">Nível de Dificuldade</h2>
        <div className="grid grid-cols-3 gap-3">
          {difficulties.map(level => (
            <Button
              key={level.id}
              variant="config"
              size="md"
              active={selectedDifficulty.id === level.id}
              onClick={() => setSelectedDifficulty(level)}
              className="text-sm sm:text-base"
            >
              {level.name}
            </Button>
          ))}
        </div>
      </div>

      <Button onClick={handleSave} variant="primary" size="lg" fullWidth>
        Salvar e Voltar
      </Button>
    </div>
  );
};

export default ConfigurationScreen;
