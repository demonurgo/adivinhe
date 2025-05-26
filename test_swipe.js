// Arquivo de teste para verificar o funcionamento do sistema de swipe
// Execute este código no console do navegador para testar

console.log("🧪 Testando Sistema de Swipe Atualizado");

// Verificar se os elementos estão presentes
const gameCard = document.querySelector('[class*="cursor-grab"]');
const root = document.getElementById('root');

if (gameCard) {
  console.log("✅ Card do jogo encontrado");
  
  // Testar eventos de mouse
  const mouseDownEvent = new MouseEvent('mousedown', {
    clientX: 300,
    clientY: 200,
    bubbles: true
  });
  
  const mouseMoveEvent = new MouseEvent('mousemove', {
    clientX: 400, // Movimento para direita
    clientY: 200,
    bubbles: true
  });
  
  const mouseUpEvent = new MouseEvent('mouseup', {
    clientX: 400,
    clientY: 200,
    bubbles: true
  });
  
  console.log("🖱️ Simulando eventos de mouse...");
  gameCard.dispatchEvent(mouseDownEvent);
  gameCard.dispatchEvent(mouseMoveEvent);
  gameCard.dispatchEvent(mouseUpEvent);
  
  console.log("✅ Eventos de mouse disparados");
} else {
  console.log("❌ Card do jogo não encontrado - certifique-se de estar na tela do jogo");
}

// Testar eventos de teclado
console.log("⌨️ Testando eventos de teclado...");
const keyRightEvent = new KeyboardEvent('keydown', {
  key: 'ArrowRight',
  bubbles: true
});

const keyLeftEvent = new KeyboardEvent('keydown', {
  key: 'ArrowLeft', 
  bubbles: true
});

window.dispatchEvent(keyRightEvent);
console.log("✅ Tecla direita simulada");

setTimeout(() => {
  window.dispatchEvent(keyLeftEvent);
  console.log("✅ Tecla esquerda simulada");
}, 1000);

console.log("🎮 Teste concluído! Verifique se o jogo responde aos controles.");
console.log("📋 Controles disponíveis:");
console.log("   🖱️ Mouse: Clique e arraste o card");
console.log("   👆 Touch: Swipe o card");  
console.log("   ⌨️ Teclado: Use as setas ← →");
console.log("   🔘 Botões: Aparecem após 5 segundos automaticamente");