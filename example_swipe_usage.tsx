// Exemplo de uso do hook useSwipe atualizado
// Este arquivo mostra como usar o novo sistema de swipe/drag

import React from 'react';
import useSwipe from '../hooks/useSwipe';

const ExampleSwipeComponent: React.FC = () => {
  const { 
    // Touch events (mobile)
    onTouchStart, 
    onTouchMove, 
    onTouchEnd,
    // Mouse events (desktop)
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onMouseLeave,
    // Estado do drag
    isDragging,
    dragOffset 
  } = useSwipe({
    onSwipeLeft: () => console.log('Swipe Left!'),
    onSwipeRight: () => console.log('Swipe Right!'),
    threshold: 50 // 50px mínimo para ativar swipe
  });

  return (
    <div 
      className={`
        bg-blue-500 p-8 rounded-lg text-white text-center cursor-grab active:cursor-grabbing
        ${isDragging ? 'bg-blue-400' : ''}
      `}
      style={{
        // Feedback visual durante o drag
        transform: isDragging ? `translateX(${dragOffset}px) rotate(${dragOffset * 0.1}deg)` : '',
        transition: isDragging ? 'none' : 'transform 0.2s ease',
        // Evitar seleção de texto durante drag
        userSelect: 'none',
        // Permitir scroll vertical, bloquear horizontal
        touchAction: 'pan-y'
      }}
      // Eventos de touch (mobile)
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      // Eventos de mouse (desktop)
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
    >
      <h2>Arraste-me!</h2>
      <p>← Esquerda | Direita →</p>
      {isDragging && (
        <p className="text-sm opacity-70">
          Offset: {Math.round(dragOffset)}px
        </p>
      )}
    </div>
  );
};

export default ExampleSwipeComponent;

/*
FUNCIONALIDADES DO HOOK ATUALIZADO:

✅ Suporte a Mouse (Desktop):
   - onMouseDown, onMouseMove, onMouseUp, onMouseLeave
   - Drag visual com feedback em tempo real
   - Previne seleção de texto durante drag

✅ Suporte a Touch (Mobile):
   - onTouchStart, onTouchMove, onTouchEnd
   - Funciona naturalmente em dispositivos móveis

✅ Estados de Feedback:
   - isDragging: boolean - se está arrastando
   - dragOffset: number - offset horizontal em pixels

✅ Configuração:
   - threshold: distância mínima para ativar swipe
   - onSwipeLeft/Right: callbacks para ações

✅ Prevenção de Bugs:
   - Reset automático em onMouseLeave
   - Prevenção de seleção de texto
   - touchAction: 'pan-y' para permitir scroll vertical

EXEMPLO DE USO NO JOGO:
- Arraste para direita = Correto (Verde)
- Arraste para esquerda = Pular (Vermelho)  
- Feedback visual durante arrastar
- Funciona tanto em mobile quanto desktop
*/