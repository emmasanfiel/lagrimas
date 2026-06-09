class EscucharPhase {   
    constructor() {
      this.duration = 50000;

      // Guardar todas las huellas emocionales
      this.traces = [];

      // Fade-out final de la fase
      this.fadeOut = 0;

      // Frases que aparecen cuando una huella se escucha
      this.messages = [
        "Muchas veces necesito sentirme escuchada más que aconsejada.",
        "Quizás llevo años confundiendo fortaleza con silencio.",
        "Empiezo a entender que no existe una forma correcta de llorar.",
        "No recuerdo haber visto a muchos adultos llorar.",
        "Tal vez aprendí a callar emociones antes de aprender a nombrarlas.",
        "Me cuesta mostrar tristeza, pero nunca me pregunté por qué.",
        "No siempre sé ponerle nombre a lo que siento.",
        "Cuando lloro, parece que mis palabras quedan en segundo plano.",
        "Me doy cuenta de cuánto me importa la mirada de los demás.",
        "Estoy más acostumbrad@ a aguantar que a preguntarme qué necesito.",
        "Nunca pensé que me costara tanto mostrarme vulnerable.",
        "Llevo demasiado tiempo interpretando el llanto como un fracaso.",
        "Hay emociones que solo aparecen cuando dejo de resistirme.",
        "Nunca me había preguntado de dónde aprendí a esconder las lágrimas.",
        "Tal vez no necesito ser fuerte todo el tiempo.",
        "Empiezo a entender que sentir no es perder el control.",
        "Me pregunto cuántas emociones he dejado pasar por alto.",
        "Quizás nunca me molestaron las lágrimas, sino lo que pensaba de ellas.",
        "No tengo todas las respuestas, pero me entiendo un poco mejor.",
        "Empiezo a mirar el llanto de otra manera."
      ];
      
    }
  
    enter() {
      this.traces = [];
      this.fadeOut = 0;

      // En mobile pequeño reducimos la duración porque hay menos huellas
      if (width < 768) {
        this.duration = 35000;
      }
  
      // Indicar el número de huellas creadas
      // En mobile usamos menos huellas para no saturar la pantalla
      const amount = width < 768 ? 8 : 20;
  
      // Creamos posiciones separadas entre sí
      const positions = this.createDistributedPositions(amount);
  
      for (let i = 0; i < positions.length; i++) {
        this.traces.push(
          new EmotionalTrace(
            positions[i].x,
            positions[i].y,
  
            // Colores suaves del sistema emocional
            random([
              MOOD_COLORS.neutral,
              MOOD_COLORS.acompaña,
              NODE_COLORS.infancia,
              NODE_COLORS.carga
            ]),
  
            this.messages[i % this.messages.length]
          )
        );
      }
    }
  
    update(progress) {

      for (let trace of this.traces) {
        trace.update();
      }

      // La fase empieza a apagarse al final
      this.fadeOut = map(progress, 0.96, 0.995, 0, 1, true);
    }
  
    draw(progress) {
      background("#FFFAF5");
  
      const globalAlpha = 1 - this.fadeOut;
  
      for (let trace of this.traces) {
        trace.draw(globalAlpha);
      }
    }

    createDistributedPositions(amount) {
      const positions = [];
  
      // Márgenes para que las huellas no nazcan pegadas al borde
      const marginX = width < 768 ? 90 : 170;
      const marginTop = width < 768 ? 90 : 130;
      const marginBottom = width < 768 ? 150 : 190;
    
  
      // Distancia mínima entre huellas
      const minDistance = width < 768 ? 125 : 190;
  
      let attempts = 0;
  
      while (positions.length < amount && attempts < 900) {
        const x = random(marginX, width - marginX);
        const y = random(marginTop, height - marginBottom);
    
        const tooClose = positions.some(pos =>
          dist(x, y, pos.x, pos.y) < minDistance
        );
    
        if (!tooClose) {
          positions.push({ x, y });
        }
  
        attempts++;
      }
  
      return positions;
    }

    mousePressed() {
      let clickedTrace = null;
    
      // Buscamos solo la primera huella tocada.
      // Recorremos al revés para priorizar la que está visualmente más arriba.
      for (let i = this.traces.length - 1; i >= 0; i--) {
        const trace = this.traces[i];
    
        if (trace.mousePressed()) {
          clickedTrace = trace;
          break;
        }
      }
    
      if (clickedTrace) {
        for (let trace of this.traces) {
          if (trace !== clickedTrace) {
            trace.closeMessage();
          }
        }
      } else {
        for (let trace of this.traces) {
          trace.closeMessage();
        }
      }
    }
  
    exit() {}
  }