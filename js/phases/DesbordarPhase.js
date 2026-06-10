class DesbordarPhase {
    constructor() {
      this.duration = 50000;
      this.emitter = null;
      this.particles = null;

      this.currents = null;

      this.phrases = [];

      this.fadeProgress = 0;
    }
  
    enter(data) {
      this.emitter = data && data.mainCircle
      ? data.mainCircle
      : new MainTearCircle(mouseX, mouseY);

      this.emitter.forceFollowingMouse();
      this.emitter.followSpeed = 0.20;

      // nuevo tamaño fase 2
      this.emitter.setTargetSize(60);
      this.emitter.canGrow = false;

      this.emitter.microDrops = [];
      this.emitter.isAtLimit = false;
      this.emitter.limitProgress = 0;

      // limpiar estado heredado de la fase 1 (frase que aparece cuando el círculo está mantenido)
      this.emitter.isPressed = false;
      this.emitter.currentPhrase = "";

      this.particles = new ParticleSystem();
      this.currents = new EmotionalCurrents();

      const reprime = [
        new FloatingPhrase("No llores por eso", "reprime", 0.15, 0.22),
        new FloatingPhrase("Estás exagerando", "reprime", 0.78, 0.20),
        new FloatingPhrase("Los niños fuertes no lloran", "reprime", 0.28, 0.44),
        new FloatingPhrase("No dejes que te vean así", "reprime", 0.58, 0.35),
        new FloatingPhrase("Contrólate un poco", "reprime", 0.40, 0.72)
      ];
      
      const acompaña = [
        new FloatingPhrase("Puedes dejarlo salir", "acompaña", 0.52, 0.10),
        new FloatingPhrase("Tómate tu tiempo", "acompaña", 0.92, 0.56),
        new FloatingPhrase("Estoy aquí contigo", "acompaña", 0.20, 0.78),
        new FloatingPhrase("No pidas perdón", "acompaña", 0.70, 0.62),
        new FloatingPhrase("Lo que sientes importa", "acompaña", 0.75, 0.85)
      ];
      
      if (width < 440) {
        this.duration = 35000;

        this.phrases = [
          ...shuffle(reprime).slice(0, 3),
          ...shuffle(acompaña).slice(0, 3)
        ];
      } else {
        this.phrases = [...reprime, ...acompaña];
      }
    }
  
    update(progress) {
      // Último tramo de la fase 2:
      // fade-out + pequeño silencio antes de pasar a fase 3
      this.fadeProgress = map(progress, 0.96, 0.995, 0, 1, true);
    
      this.emitter.update();
    
      let activeMood = "neutral";
    
      // Solo hay interacción con frases mientras no ha empezado el fade-out
      if (this.fadeProgress === 0) {
        for (let phrase of this.phrases) {
          phrase.update();
    
          if (phrase.isTouching(this.emitter)) {
            activeMood = phrase.type;
            phrase.activeTimer = 10;
          }
        }
      } else {
        // Durante el fade-out las frases siguen flotando un poco,
        // pero ya no modifican el estado emocional.
        for (let phrase of this.phrases) {
          phrase.update();
        }
      }

      this.separateMobilePhrases();

      this.particles.setMood(activeMood);
      this.emitter.setMoodColor(activeMood);

      if (this.currents) {
        this.currents.setState(activeMood);
        this.currents.update();
      }
    
      // Comunicamos a las partículas cuánto deben apagarse
      this.particles.setFadeProgress(this.fadeProgress);
    
      // Solo emitimos nuevas partículas antes del fade-out
      if (this.fadeProgress === 0) {
        this.particles.emit(this.emitter.x, this.emitter.y);
      }
    
      this.particles.update();
    }
  
    draw(progress) {
      background("#FFFAF5");

      // Corrientes emocionales: atmósfera de fondo
      if (this.currents) {
        this.currents.draw(1 - this.fadeProgress);
      }
    
      // Las partículas gestionan su propio fade-out desde ParticleSystem
      this.particles.draw();
    
      // Emisor y frases se desvanecen juntos
      const fadeAlpha = 1 - this.fadeProgress;
    
      if (fadeAlpha > 0.01) {
        drawingContext.save();
        drawingContext.globalAlpha = fadeAlpha;
    
        this.emitter.draw();
    
        for (let phrase of this.phrases) {
          phrase.draw();
        }
    
        drawingContext.restore();
      }
    }

    // evitar que las frases se superpongan en mobile
    separateMobilePhrases() {
      if (width >= 768) return;

      for (let i = 0; i < this.phrases.length; i++) {
        for (let j = i + 1; j < this.phrases.length; j++) {
          const a = this.phrases[i];
          const b = this.phrases[j];

          const minDistX = width < 440 ? 170 : 140;
          const minDistY = width < 440 ? 62 : 44;

          const pushStrengthX = width < 440 ? 0.35 : 0.8;
          const pushStrengthY = width < 440 ? 0.2 : 0.4;

          const dx = b.x - a.x;
          const dy = b.y - a.y;

          if (abs(dx) < minDistX && abs(dy) < minDistY) {
            const pushX = dx === 0 ? random([-1, 1]) : Math.sign(dx);
            const pushY = dy === 0 ? random([-1, 1]) : Math.sign(dy);

            a.x -= pushX * pushStrengthX;
            b.x += pushX * pushStrengthX;

            a.y -= pushY * pushStrengthY;
            b.y += pushY * pushStrengthY;
          }
        }
      }
    }
  
    exit() {}
  }