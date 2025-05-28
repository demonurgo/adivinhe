import React from 'react';

export enum GameScreenState {
  Welcome,
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

// Interface para o arquivo version.json
export interface VersionData {
  version: string;
  build: number;
  lastUpdate: string;
  lastCommit?: string;
  isDirty?: boolean;
}