
import React from 'react';
import { Category, Difficulty, TimeOption } from './types';

export const GAME_DURATION_SECONDS = 60; // Default game duration

// IconWrapper ensures consistent sizing and stroke for icons.
const IconWrapper: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
  <span className={`inline-block w-7 h-7 stroke-current ${className}`}>{children}</span>
);

// Ícones utilizados para navegação e configurações
export const CogIcon = <IconWrapper className="w-6 h-6"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a6.759 6.759 0 0 1 0 .255c-.007.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.240.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg></IconWrapper>;
export const ChartBarIcon = <IconWrapper className="w-6 h-6"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" /></svg></IconWrapper>;


export const AVAILABLE_CATEGORIES: Category[] = [
  { id: 'pessoas', name: 'Pessoas Famosas', icon: '👤', color: 'bg-rose-600 hover:bg-rose-500', textColor: 'text-white' },
  { id: 'lugares', name: 'Lugares', icon: '🌍', color: 'bg-sky-600 hover:bg-sky-500', textColor: 'text-white' },
  { id: 'animais', name: 'Animais', icon: '🐱', color: 'bg-emerald-600 hover:bg-emerald-500', textColor: 'text-white' },
  { id: 'objetos', name: 'Objetos', icon: '📦', color: 'bg-amber-500 hover:bg-amber-400', textColor: 'text-slate-900' },
  { id: 'filmes', name: 'Filmes e Séries', icon: '🎬', color: 'bg-purple-600 hover:bg-purple-500', textColor: 'text-white' },
  { id: 'musica', name: 'Música', icon: '🎵', color: 'bg-fuchsia-600 hover:bg-fuchsia-500', textColor: 'text-white' },
  { id: 'comida', name: 'Comidas e Bebidas', icon: '🍔', color: 'bg-orange-600 hover:bg-orange-500', textColor: 'text-white' },
  { id: 'esportes', name: 'Esportes', icon: '⚽', color: 'bg-teal-600 hover:bg-teal-500', textColor: 'text-white' },
  { id: 'profissoes', name: 'Profissões', icon: '👷', color: 'bg-indigo-600 hover:bg-indigo-500', textColor: 'text-white' },
  { id: 'natureza', name: 'Natureza', icon: '🌲', color: 'bg-lime-600 hover:bg-lime-500', textColor: 'text-white' },
];

export const DIFFICULTIES: Difficulty[] = [
  { id: 'facil', name: 'Fácil' },
  { id: 'medio', name: 'Médio' },
  { id: 'dificil', name: 'Difícil' },
];

export const TIME_OPTIONS: TimeOption[] = [
  { id: '30s', name: '30 Segundos', value: 30 },
  { id: '60s', name: '1 Minuto', value: 60 },
  { id: '90s', name: '1m 30s', value: 90 },
  { id: '120s', name: '2 Minutos', value: 120 },
];
