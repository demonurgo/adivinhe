import React, { useState, useEffect } from 'react';
import { Difficulty, TimeOption } from '../types';
import Button from './Button';
import { SparklesText } from './magicui/sparkles-text';
import { MorphingText } from './magicui/morphing-text';
import DatabasePopulator from './DatabasePopulator';

interface ConfigurationScreenProps {
  currentDuration: number;
  currentDifficulty: Difficulty;
  onSave: (newDuration: number, newDifficulty: Difficulty) => void;
  timeOptions: TimeOption[];
  difficulties: Difficulty[];
  apiKeyExists?: boolean;
  supabaseConfigured?: boolean;
}

const ConfigurationScreen: React.FC<ConfigurationScreenProps> = ({
  currentDuration,
  currentDifficulty,
  onSave,
  timeOptions,
  difficulties,
  apiKeyExists = false,
  supabaseConfigured = false,
}) => {
  const [selectedDuration, setSelectedDuration] = useState<number>(currentDuration);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(currentDifficulty);
  const [mounted, setMounted] = useState(false);
  const [hoveredTimeOption, setHoveredTimeOption] = useState<string | null>(null);
  const [hoveredDifficulty, setHoveredDifficulty] = useState<string | null>(null);
  const [showDatabasePopulator, setShowDatabasePopulator] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const canPopulateDatabase = apiKeyExists && supabaseConfigured;

  const handleOpenPasswordModal = () => {
    setPasswordInput('');
    setPasswordError(null);
    setShowPasswordModal(true);
  };

  const handlePasswordModalClose = () => {
    setShowPasswordModal(false);
    setPasswordInput('');
    setPasswordError(null);
  };

  const handlePasswordSubmit = () => {
    // TODO: Use a more secure way to store and check the password
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin'; // Fallback for safety, ensure VITE_ADMIN_PASSWORD is set
    if (passwordInput === adminPassword) {
      setShowPasswordModal(false);
      setShowDatabasePopulator(true);
      setPasswordError(null);
    } else {
      setPasswordError('Senha incorreta. Tente novamente.');
    }
    setPasswordInput('');
  };

  const handleSave = () => {
    onSave(selectedDuration, selectedDifficulty);
  };

  // Decorative gaming icons for background
  const decorativeIcons = ["⚙️", "⏱️", "🎯", "⚡", "🎮", "🔧", "⭐", "💎"];

  // Get time option icon
  const getTimeIcon = (duration: number) => {
    if (duration <= 60) return "⚡";
    if (duration <= 90) return "⏰";
    return "🕐";
  };

  // Get difficulty icon and color
  const getDifficultyData = (id: string) => {
    switch (id) {
      case 'facil':
        return { icon: "🌱", color: "from-green-400 to-emerald-500", border: "border-green-400/50", glow: "shadow-green-500/25" };
      case 'medio':
        return { icon: "🔥", color: "from-yellow-400 to-orange-500", border: "border-yellow-400/50", glow: "shadow-yellow-500/25" };
      case 'dificil':
        return { icon: "💎", color: "from-purple-400 to-pink-500", border: "border-purple-400/50", glow: "shadow-purple-500/25" };
      default:
        return { icon: "⭐", color: "from-blue-400 to-cyan-500", border: "border-blue-400/50", glow: "shadow-blue-500/25" };
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {decorativeIcons.map((icon, index) => (
          <div 
            key={index}
            className="absolute text-2xl sm:text-3xl opacity-10 animate-float"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${index * 0.7}s`,
              animationDuration: `${12 + Math.random() * 16}s`
            }}
          >
            {icon}
          </div>
        ))}
      </div>
      
      {/* Main container */}
      <div 
        className={`w-full max-w-4xl mx-auto p-8 sm:p-10 bg-gradient-to-br from-slate-900/95 via-slate-800/90 to-slate-900/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-slate-700/50 text-slate-100 transition-all duration-700 transform ${mounted ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}
      >
        {/* Decorative background shapes */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-full blur-3xl -z-10 transform translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-600/20 to-teal-600/20 rounded-full blur-3xl -z-10 transform -translate-x-1/3 translate-y-1/3"></div>
        
        {/* Header with Generate Words Button */}
        <div className={`text-center mb-12 transition-all duration-1000 delay-300 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1"></div>
              <div className="flex-1">
                <SparklesText 
                  className="text-4xl sm:text-5xl lg:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 drop-shadow-lg"
                  colors={{ first: '#38bdf8', second: '#a855f7' }}
                  sparklesCount={15}
                >
                  Configurações
                </SparklesText>
              </div>
              <div className="flex-1 flex justify-end">
                {canPopulateDatabase && (
                  <div className="relative group">
                    {/* Generate Words Button for Configuration Screen */}
                    <div 
                      onClick={handleOpenPasswordModal}
                      className="relative cursor-pointer overflow-hidden bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 p-[2px] rounded-xl shadow-2xl group-hover:shadow-purple-500/30 transition-all duration-700 group-hover:scale-110 group-hover:-rotate-1 w-[120px] h-[50px]"
                    >
                      <div className="relative bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 rounded-xl overflow-hidden backdrop-blur-sm w-full h-full flex items-center justify-center">
                        {/* Holographic grid pattern */}
                        <div className="absolute inset-0 opacity-15">
                          <div className="absolute top-0 left-0 w-full h-full">
                            <div className="absolute top-1 left-1 w-1 h-1 bg-violet-400 rounded-full group-hover:animate-ping"></div>
                            <div className="absolute top-2 right-2 w-0.5 h-2 bg-purple-400 rounded-full group-hover:animate-pulse"></div>
                            <div className="absolute bottom-1 left-3 w-1 h-1 bg-indigo-400 rounded-full group-hover:animate-bounce"></div>
                            <div className="absolute bottom-2 right-1 w-0.5 h-1 bg-violet-400 rounded-full group-hover:animate-pulse"></div>
                            {/* Grid lines */}
                            <div className="absolute top-0 left-1/3 w-px h-full bg-gradient-to-b from-transparent via-purple-400/20 to-transparent"></div>
                            <div className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-transparent via-indigo-400/20 to-transparent"></div>
                          </div>
                        </div>
                        
                        {/* Energy sweep */}
                        <div className="absolute top-0 left-[-100%] h-full w-1/2 bg-gradient-to-r from-transparent via-purple-400/25 to-transparent group-hover:left-full transition-all duration-900 ease-out transform skew-x-12"></div>
                        
                        {/* Content */}
                        <div className="relative z-10 flex items-center justify-center gap-2 px-2">
                          {/* Neural network icon */}
                          <div className="relative flex-shrink-0">
                            <div className="w-4 h-4 text-purple-400 group-hover:text-purple-300 transition-all duration-300 group-hover:scale-110 group-hover:rotate-45">
                              <svg viewBox="0 0 24 24" fill="currentColor">
                                <circle cx="7" cy="7" r="2" opacity="0.8"/>
                                <circle cx="17" cy="7" r="2" opacity="0.8"/>
                                <circle cx="12" cy="12" r="2.5" opacity="1"/>
                                <circle cx="7" cy="17" r="2" opacity="0.8"/>
                                <circle cx="17" cy="17" r="2" opacity="0.8"/>
                                <path d="M9 7L10.5 10.5M15 7L13.5 10.5M10.5 13.5L9 17M13.5 13.5L15 17M9.5 9L10.5 10.5M14.5 9L13.5 10.5" stroke="currentColor" strokeWidth="1" opacity="0.6" fill="none"/>
                              </svg>
                            </div>
                            <div className="absolute -top-0.5 -right-0.5 w-1 h-1 bg-violet-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-all duration-500 delay-200"></div>
                          </div>
                          
                          {/* MorphingText - Fixed container */}
                          <div className="flex-1 text-center relative min-w-0 max-w-[60px]">
                            <MorphingText 
                              className="text-[9px] font-bold text-purple-300 group-hover:text-purple-200 transition-colors duration-500 h-3 w-full leading-none"
                              texts={[
                                "AI FORGE",
                                "NEURAL NET",
                                "BRAIN GEN", 
                                "DEEP LEARN",
                                "WORD LAB"
                              ]}
                            />
                          </div>
                          
                          {/* Quantum processing icon */}
                          <div className="relative flex-shrink-0">
                            <div className="w-3 h-3 text-indigo-400 group-hover:text-indigo-300 transition-all duration-500 group-hover:scale-110 group-hover:rotate-90">
                              <svg viewBox="0 0 24 24" fill="currentColor">
                                <circle cx="12" cy="12" r="3" opacity="0.4"/>
                                <circle cx="12" cy="12" r="6" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.6"/>
                                <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.3"/>
                                <path d="M12 3v18M3 12h18" stroke="currentColor" strokeWidth="0.5" opacity="0.5"/>
                              </svg>
                            </div>
                            <div className="absolute -bottom-0.5 -left-0.5 w-0.5 h-0.5 bg-indigo-300 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-bounce transition-all duration-500 delay-300"></div>
                          </div>
                        </div>
                        
                        {/* Holographic border */}
                        <div className="absolute inset-0 rounded-xl border border-purple-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        
                        {/* Central energy core */}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-0.5 h-0.5 bg-purple-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-pulse"></div>
                      </div>
                    </div>
                    
                    {/* Outer energy field */}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500 opacity-0 group-hover:opacity-20 scale-110 group-hover:scale-125 blur-xl transition-all duration-700"></div>
                    
                    {/* Enhanced tooltip */}
                    <div className="absolute bottom-full right-0 mb-3 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none transform group-hover:translate-y-0 translate-y-2 shadow-lg border border-purple-400/20">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-purple-300 rounded-full animate-pulse"></span>
                        <span>Gerar palavras com IA</span>
                      </div>
                      <div className="absolute top-full right-4 transform border-4 border-transparent border-t-purple-600"></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="h-1.5 w-32 sm:w-40 mx-auto rounded-full bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 mt-3 opacity-80"></div>
          </div>
          <p className="text-slate-300 mt-4 text-lg">Personalize sua experiência de jogo</p>
        </div>

        {/* Time Duration Section */}
        <div className={`mb-12 transition-all duration-1000 delay-500 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="text-3xl">⏱️</div>
            <h2 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              Duração do Jogo
            </h2>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {timeOptions.map((option, index) => {
              const isSelected = selectedDuration === option.value;
              const isHovered = hoveredTimeOption === option.id;
              
              return (
                <div key={option.id} className="relative group">
                  <div
                    className={`relative cursor-pointer overflow-hidden transition-all duration-500 transform ${
                      isSelected ? 'scale-110' : 'scale-100 group-hover:scale-105'
                    }`}
                    onClick={() => setSelectedDuration(option.value)}
                    onMouseEnter={() => setHoveredTimeOption(option.id)}
                    onMouseLeave={() => setHoveredTimeOption(null)}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Card background */}
                    <div className={`relative bg-gradient-to-br ${
                      isSelected 
                        ? 'from-blue-600 via-indigo-600 to-purple-600 shadow-2xl shadow-blue-500/30' 
                        : 'from-slate-800 via-slate-700 to-slate-800 group-hover:from-slate-700 group-hover:via-slate-600 group-hover:to-slate-700'
                    } p-6 rounded-2xl border-2 ${
                      isSelected ? 'border-blue-400/60' : 'border-slate-600/50 group-hover:border-slate-500/70'
                    } shadow-lg transition-all duration-500`}>
                      
                      {/* Animated background effect */}
                      {isSelected && (
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl animate-pulse"></div>
                      )}
                      
                      {/* Content */}
                      <div className="relative z-10 text-center">
                        <div className={`text-3xl mb-3 transition-all duration-300 ${
                          isSelected ? 'scale-125 animate-pulse' : 'group-hover:scale-110'
                        }`}>
                          {getTimeIcon(option.value)}
                        </div>
                        <div className={`text-xl font-bold mb-1 transition-colors duration-300 ${
                          isSelected ? 'text-white' : 'text-slate-200 group-hover:text-white'
                        }`}>
                          {option.name}
                        </div>
                        <div className={`text-sm transition-colors duration-300 ${
                          isSelected ? 'text-blue-200' : 'text-slate-400 group-hover:text-slate-300'
                        }`}>
                          {option.value}s
                        </div>
                      </div>
                      
                      {/* Selection indicator */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center animate-bounce">
                          <span className="text-xs">✓</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Hover glow effect */}
                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-20 scale-110 group-hover:scale-125 blur-xl transition-all duration-700 ${
                      isSelected ? 'opacity-30 scale-125' : ''
                    }`}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Difficulty Section */}
        <div className={`mb-12 transition-all duration-1000 delay-700 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="text-3xl">🎯</div>
            <h2 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-400">
              Nível de Dificuldade
            </h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {difficulties.map((level, index) => {
              const isSelected = selectedDifficulty.id === level.id;
              const diffData = getDifficultyData(level.id);
              
              return (
                <div key={level.id} className="relative group">
                  <div
                    className={`relative cursor-pointer overflow-hidden transition-all duration-500 transform ${
                      isSelected ? 'scale-110' : 'scale-100 group-hover:scale-105'
                    }`}
                    onClick={() => setSelectedDifficulty(level)}
                    onMouseEnter={() => setHoveredDifficulty(level.id)}
                    onMouseLeave={() => setHoveredDifficulty(null)}
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                    {/* Card background */}
                    <div className={`relative bg-gradient-to-br ${
                      isSelected 
                        ? `${diffData.color} shadow-2xl ${diffData.glow}` 
                        : 'from-slate-800 via-slate-700 to-slate-800 group-hover:from-slate-700 group-hover:via-slate-600 group-hover:to-slate-700'
                    } p-6 sm:p-8 rounded-2xl border-2 ${
                      isSelected ? diffData.border : 'border-slate-600/50 group-hover:border-slate-500/70'
                    } shadow-lg transition-all duration-500`}>
                      
                      {/* Animated background effect */}
                      {isSelected && (
                        <div className={`absolute inset-0 bg-gradient-to-r ${diffData.color} opacity-20 rounded-2xl animate-pulse`}></div>
                      )}
                      
                      {/* Content */}
                      <div className="relative z-10 text-center">
                        <div className={`text-4xl mb-4 transition-all duration-300 ${
                          isSelected ? 'scale-125 animate-pulse' : 'group-hover:scale-110'
                        }`}>
                          {diffData.icon}
                        </div>
                        <div className={`text-xl sm:text-2xl font-bold mb-2 transition-colors duration-300 ${
                          isSelected ? 'text-white' : 'text-slate-200 group-hover:text-white'
                        }`}>
                          {level.name}
                        </div>
                        <div className={`text-sm transition-colors duration-300 ${
                          isSelected ? 'text-white/80' : 'text-slate-400 group-hover:text-slate-300'
                        }`}>
                          Nível {level.name.toLowerCase()}
                        </div>
                      </div>
                      
                      {/* Selection indicator */}
                      {isSelected && (
                        <div className="absolute top-3 right-3 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center animate-bounce backdrop-blur-sm">
                          <span className="text-white text-xs font-bold">✓</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Hover glow effect */}
                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${diffData.color} opacity-0 group-hover:opacity-20 scale-110 group-hover:scale-125 blur-xl transition-all duration-700 ${
                      isSelected ? 'opacity-30 scale-125' : ''
                    }`}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Save Button */}
        <div className={`transition-all duration-1000 delay-900 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="w-full flex justify-center">
            <div className="relative group cursor-pointer" onClick={handleSave}>
              {/* Main button container */}
              <div className="relative overflow-hidden bg-gradient-to-r from-green-600 via-emerald-600 to-teal-500 p-[3px] rounded-3xl shadow-2xl group-hover:shadow-green-500/25 transition-all duration-500 group-hover:scale-105">
                <div className="relative bg-gradient-to-r from-green-600 via-emerald-600 to-teal-500 rounded-3xl px-12 sm:px-16 py-6 sm:py-8 overflow-hidden">
                  {/* Animated background layers */}
                  <div className="absolute inset-0 bg-gradient-to-r from-green-700/50 via-emerald-700/50 to-teal-600/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute inset-0 bg-gradient-to-45 from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-pulse"></div>
                  
                  {/* Floating particles */}
                  <div className="absolute top-4 left-8 w-2 h-2 bg-yellow-300 rounded-full opacity-60 group-hover:animate-bounce group-hover:opacity-100 transition-all duration-500 delay-100"></div>
                  <div className="absolute top-6 right-12 w-1.5 h-1.5 bg-cyan-300 rounded-full opacity-50 group-hover:animate-ping group-hover:opacity-90 transition-all duration-500 delay-200"></div>
                  <div className="absolute bottom-4 left-12 w-2.5 h-2.5 bg-emerald-300 rounded-full opacity-40 group-hover:animate-pulse group-hover:opacity-80 transition-all duration-500 delay-300"></div>
                  <div className="absolute bottom-6 right-8 w-1 h-1 bg-white rounded-full opacity-70 group-hover:animate-ping group-hover:opacity-100 transition-all duration-500 delay-150"></div>
                  
                  {/* Shine effect */}
                  <div className="absolute top-0 left-[-100%] h-full w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 group-hover:left-full transition-all duration-1000 ease-out"></div>
                  
                  {/* Main content */}
                  <div className="relative z-10 flex items-center justify-center gap-4 group-hover:gap-6 transition-all duration-300">
                    {/* Save icon */}
                    <div className="relative">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 text-white/90 group-hover:text-white transition-all duration-300 group-hover:scale-110 group-hover:rotate-12">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17 3H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 12l-4-4-4 4h8z"/>
                          <path d="M15 9H9V7h6v2z"/>
                        </svg>
                      </div>
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-all duration-500 delay-200"></div>
                    </div>
                    
                    {/* SparklesText */}
                    <SparklesText 
                      className="text-2xl sm:text-3xl font-black tracking-wider text-white drop-shadow-2xl group-hover:scale-105 transition-transform duration-500"
                      colors={{ first: '#FEF3C7', second: '#FDE68A' }}
                      sparklesCount={10}
                    >
                      SALVAR E VOLTAR
                    </SparklesText>
                    
                    {/* Check icon */}
                    <div className="relative">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 text-white/90 group-hover:text-white transition-all duration-500 group-hover:translate-x-2 group-hover:scale-110">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <path d="M20 6L9 17l-5-5"/>
                        </svg>
                      </div>
                      <div className="absolute inset-0 bg-white/20 rounded-full scale-0 group-hover:scale-150 opacity-0 group-hover:opacity-30 transition-all duration-500"></div>
                    </div>
                  </div>
                  
                  {/* Border glow effect */}
                  <div className="absolute inset-0 rounded-3xl border-2 border-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
              </div>
              
              {/* Outer glow ring */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-green-500 via-emerald-500 to-teal-400 opacity-0 group-hover:opacity-20 scale-110 group-hover:scale-125 blur-xl transition-all duration-700"></div>
              
              {/* Click ripple effect */}
              <div className="absolute inset-0 rounded-3xl bg-white/10 scale-0 group-active:scale-95 transition-transform duration-150"></div>
            </div>
          </div>
        </div>
      </div>

      {showDatabasePopulator && (
        <DatabasePopulator onClose={() => setShowDatabasePopulator(false)} />
      )}

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl shadow-2xl border border-slate-700 w-full max-w-sm transform transition-all duration-300 animate-scale-in">
            <h2 className="text-xl font-semibold text-slate-100 mb-4">Acesso Restrito</h2>
            <p className="text-sm text-slate-300 mb-1">Por favor, insira a senha para gerar palavras:</p>
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
              className="w-full p-2.5 rounded-md bg-slate-700 border border-slate-600 text-slate-100 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all duration-300"
              placeholder="Senha"
            />
            {passwordError && (
              <p className="text-red-400 text-xs mt-2 animate-fade-in">{passwordError}</p>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <Button 
                onClick={handlePasswordModalClose} 
                variant="ghost" 
                className="text-slate-300 hover:bg-slate-700 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handlePasswordSubmit} 
                variant="primary"
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-glow-sm"
              >
                <span className="flex items-center gap-1">
                  Confirmar 
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfigurationScreen;
