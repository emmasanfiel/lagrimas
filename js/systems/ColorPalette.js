// Palete global de colores
const MOOD_COLORS = {
    cream: { h: 30, s: 100, l: 98 },
    creamDark: { h: 30, s: 100, l: 92 },
    blue: { h: 213, s: 51, l: 60 },
    calmBlue: { h: 214, s: 49, l: 90 },
  
    neutral: { h: 212, s: 52, l: 70 },
    acompaña: { h: 190, s: 42, l: 66 },
    reprime: { h: 210, s: 24, l: 30 },
  
    textPrimary: { h: 211, s: 60, l: 27 }
  };

// Paleta específica para los nodos de la fase 1
  const NODE_COLORS = {
    infancia: { h: 51, s: 30, l: 60 },
    juicio: { h: 267, s: 30, l: 77 },
    carga: { h: 359, s: 30, l: 60 },
    referentes: { h: 89, s: 30, l: 60 }
  };
  
  function hsl(color, alpha = 1) {
    return `hsla(${color.h}, ${color.s}%, ${color.l}%, ${alpha})`;
  }