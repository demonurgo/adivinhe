
import React from 'react';
import { Category, Difficulty, TimeOption } from './types';

export const GAME_DURATION_SECONDS = 60; // Default game duration

// IconWrapper ensures consistent sizing and stroke for icons.
const IconWrapper: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
  <span className={`inline-block w-7 h-7 stroke-current ${className}`}>{children}</span>
);

export const PersonIcon = <IconWrapper><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg></IconWrapper>;
export const PlaceIcon = <IconWrapper><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg></IconWrapper>;
export const AnimalIcon = <IconWrapper><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75s.168-.75.375-.75S9.75 9.336 9.75 9.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z" /></svg></IconWrapper>;
export const ObjectIcon = <IconWrapper><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-2.25-1.313M21 7.5v2.25m0-2.25-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3 2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75 2.25-1.313M12 21.75l-2.25-1.313M12 21.75v-2.25m9-3.75-2.25-1.313M21 15l-2.25 1.313M21 15v2.25M4.5 15l2.25-1.313M4.5 15l2.25 1.313M4.5 15v2.25m0-2.25v-2.25m0 0a2.25 2.25 0 0 1 0-4.5 2.25 2.25 0 0 1 0 4.5ZM12 9.75l-2.25-1.313M12 9.75l2.25-1.313M12 9.75V7.5m0 0A2.25 2.25 0 0 0 9.75 5.25a2.25 2.25 0 0 0 0 4.5m6.75-3.75l-2.25-1.313M18.75 7.5l2.25-1.313M18.75 7.5V5.25m0 0A2.25 2.25 0 0 0 16.5 3a2.25 2.25 0 0 0 0 4.5m-9 12.75l-2.25-1.313M9.75 18.75l2.25-1.313M9.75 18.75V16.5m0 0A2.25 2.25 0 0 0 7.5 14.25a2.25 2.25 0 0 0 0 4.5m6.75-3.75l-2.25-1.313M16.5 15l2.25-1.313M16.5 15V12.75m0 0a2.25 2.25 0 0 0-2.25-2.25 2.25 2.25 0 0 0-2.25 2.25" /></svg></IconWrapper>;
export const FilmIcon = <IconWrapper><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9A2.25 2.25 0 0 0 13.5 5.25h-9A2.25 2.25 0 0 0 2.25 7.5v9A2.25 2.25 0 0 0 4.5 18.75Z" /></svg></IconWrapper>;
export const MusicIcon = <IconWrapper><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9c0 .564.062 1.11.178 1.634m0 0A5.25 5.25 0 0 1 5.25 15.75c-2.06 0-3.81-1.234-4.5-2.982m10.676-1.14L15 9.75M9.178 10.634L13.5 11.25m2.25 4.5a4.5 4.5 0 1 0-6.364-6.364m6.364 6.364L18 13.5m0 0A5.25 5.25 0 0 0 22.5 9.75c0-2.06-1.234-3.81-2.982-4.5m0 0A2.25 2.25 0 0 0 19.5 3v1.5M4.5 9.75A2.25 2.25 0 0 1 6.75 12H9m0 0V4.5m0 4.5a2.25 2.25 0 0 1 4.5 0" /></svg></IconWrapper>;
export const FoodIcon = <IconWrapper><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 12.5V10.75a3.75 3.75 0 0 0-3.75-3.75H6a3.75 3.75 0 0 0-3.75 3.75v1.75m0 0a2.25 2.25 0 0 0-.75 1.6V16.5a2.25 2.25 0 0 0 2.25 2.25h13.5A2.25 2.25 0 0 0 22.5 16.5v-2.35a2.25 2.25 0 0 0-.75-1.6Z" /></svg></IconWrapper>;
export const SportIcon = <IconWrapper><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 4.5a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15ZM10.5 10.5h.008v.008h-.008V10.5Z" /><path d="M18.375 9A7.5 7.5 0 0 0 10.5 3M18.375 9V3m0 6h6m-6 0A7.5 7.5 0 0 1 15 18.375M15 18.375V21m0-2.625h-2.625" /></svg></IconWrapper>;
export const ProfessionIcon = <IconWrapper><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.243-3.72a9.094 9.094 0 0 1-.479 3.741M18 18.72v-2.28a2.25 2.25 0 0 0-2.25-2.25H13.5M18 18.72m-3.75 0h.008v.015h-.008V18.72Zm-3.75 0h.008v.015h-.008V18.72Zm-3.75 0h.008v.015h-.008V18.72Zm0 0H6.75V16.5m0 2.22v2.28a2.25 2.25 0 0 0 2.25 2.25h4.5M4.5 12.75a3 3 0 0 1-3-3V7.5a3 3 0 0 1 3-3h1.5a3 3 0 0 1 3 3v2.25m6.75 0v-2.25a3 3 0 0 0-3-3h-1.5a3 3 0 0 0-3 3V15m0 0v2.25a3 3 0 0 0 3 3h1.5a3 3 0 0 0 3-3V15m0 0h1.5V12.75a3 3 0 0 0-3-3h-1.5m-3.75 0H9.75m0-3H6V7.5a3 3 0 0 1 3-3h1.5M12 12.75V5.25m0 15V15" /></svg></IconWrapper>;
export const NatureIcon = <IconWrapper><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12.25C3 7.977 6.134 4.5 10.5 4.5c2.18 0 4.17.892 5.616 2.343A7.503 7.503 0 0 1 21 12.25c0 4.273-3.134 7.75-7.5 7.75-2.18 0-4.17-.892-5.616-2.343A7.503 7.503 0 0 1 3 12.25Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 5.25V7.5m0 9.75v2.25m-4.5-6.375h-2.25m13.5 0h-2.25M7.616 7.99a5.25 5.25 0 0 0-5.232 4.26A5.25 5.25 0 0 0 7.616 16.51m8.768-8.52a5.25 5.25 0 0 1 5.232 4.26 5.25 5.25 0 0 1-5.232 4.26" /></svg></IconWrapper>;
export const CogIcon = <IconWrapper className="w-6 h-6"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-1.007 1.113-1.113l.44-.08c.295-.057.592.038.804.218l.22.186c.213.178.289.487.182.734l-.23.53c-.185.423-.642.678-1.096.564l-.44-.08a1.125 1.125 0 0 1-1.113-1.113Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12.991 16.302a1.125 1.125 0 0 1-1.113 1.113l-.44.08c-.295.057-.592-.038-.804-.218l-.22-.186c-.213-.178-.289-.487-.182-.734l.23-.53c.185-.423.642.678 1.096-.564l.44.08Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.302 9.594c.542.09.945.505 1.113 1.047l.08.44c.057.295-.038.592-.218.804l-.186.22c-.178.213-.487.289-.734.182l-.53-.23c-.423-.185-.678-.642-.564-1.096l.08-.44Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M3.94 12.991a1.125 1.125 0 0 1 1.113-1.113l.44-.08c.295-.057.592.038.804.218l.22.186c.213.178.289.487.182.734l-.23.53c-.185.423-.642.678-1.096-.564l-.44-.08a1.125 1.125 0 0 1-1.113-1.113Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a5.25 5.25 0 1 1-4.616 7.022.75.75 0 0 0-.44-.316l-.308-.102a6.75 6.75 0 1 0 5.706-7.066.75.75 0 0 0-.24-.491l-.173-.173a6.75 6.75 0 0 0-7.066 5.706.75.75 0 0 0 .316.44l.102.308a.75.75 0 0 0 .491.24 5.25 5.25 0 0 1 6.213-4.616Z" /></svg></IconWrapper>;


export const AVAILABLE_CATEGORIES: Category[] = [
  { id: 'pessoas', name: 'Pessoas Famosas', icon: PersonIcon, color: 'bg-rose-600 hover:bg-rose-500', textColor: 'text-white' },
  { id: 'lugares', name: 'Lugares', icon: PlaceIcon, color: 'bg-sky-600 hover:bg-sky-500', textColor: 'text-white' },
  { id: 'animais', name: 'Animais', icon: AnimalIcon, color: 'bg-emerald-600 hover:bg-emerald-500', textColor: 'text-white' },
  { id: 'objetos', name: 'Objetos', icon: ObjectIcon, color: 'bg-amber-500 hover:bg-amber-400', textColor: 'text-slate-900' },
  { id: 'filmes', name: 'Filmes e Séries', icon: FilmIcon, color: 'bg-purple-600 hover:bg-purple-500', textColor: 'text-white' },
  { id: 'musica', name: 'Música', icon: MusicIcon, color: 'bg-fuchsia-600 hover:bg-fuchsia-500', textColor: 'text-white' },
  { id: 'comida', name: 'Comidas e Bebidas', icon: FoodIcon, color: 'bg-orange-600 hover:bg-orange-500', textColor: 'text-white' },
  { id: 'esportes', name: 'Esportes', icon: SportIcon, color: 'bg-teal-600 hover:bg-teal-500', textColor: 'text-white' },
  { id: 'profissoes', name: 'Profissões', icon: ProfessionIcon, color: 'bg-indigo-600 hover:bg-indigo-500', textColor: 'text-white' },
  { id: 'natureza', name: 'Natureza', icon: NatureIcon, color: 'bg-lime-600 hover:bg-lime-500', textColor: 'text-white' },
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
