import React from 'react';

export enum GameScreenState {
  CategorySelection,
  Configuration, // New state for game settings
  LoadingWords,
  Playing,
  Score,
  Statistics, // New state for game statistics
}

export interface Category {
  id: string;
  name: string;
  icon?: React.ReactNode;
  color?: string; 
  textColor?: string; // Optional text color for categories with light backgrounds
}

export interface Difficulty {
  id: 'facil' | 'medio' | 'dificil';
  name: string;
}

export interface TimeOption {
  id: string;
  name: string;
  value: number; // duration in seconds
}