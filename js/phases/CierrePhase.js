class CierrePhase {
  constructor() {
    // Duración muy larga para que el cierre no avance solo.
    // El usuario decide cuándo volver a empezar.
    this.duration = 999999;

    this.x = 0;
    this.y = 0;

    // Progresos internos de aparición y crecimiento.
    this.enterProgress = 0;
    this.growthProgress = 0;

    this.baseSize = 120;
    this.targetSize = 520;
    this.size = this.baseSize;

    // Color base de la huella, heredado del universo visual de fase 3.
    this.color = MOOD_COLORS.neutral;

    this.particles = [];

    // Hover sobre el núcleo.
    this.hoverProgress = 0;
    this.canRestart = false;
    this.isRestartHovered = false;

    // transición a la fase 1
    this.isRestarting = false;
    this.restartProgress = 0;
  }

  enter() {
    this.x = width / 2;
    this.y = height / 2;

    this.isRestarting = false;
    this.restartProgress = 0;

    this.enterProgress = 0;
    this.growthProgress = 0;

    this.canRestart = false;
    this.isRestartHovered = false;
    this.hoverProgress = 0;

    // Tamaño inicial de la huella.
    this.baseSize = width < 768 ? 110 : 150;

    // Tamaño final de la huella.
    this.targetSize = width < 768
      ? min(width * 1.15, height * 0.68)
      : min(width * 0.80, height * 0.90);

    this.size = this.baseSize;

    this.createParticles();

    // En el cierre, el recorrido ya está completo.
    updateProgressBar(1);

    // Ocultar pausa/reanudar porque el cierre no tiene tiempo activo.
    this.setPauseButtonVisible(false);

    // Cambiar el texto contextual de la navbar.
    this.updateNavbarText(
      "A veces, las lágrimas no traen respuestas. Solo dejan espacio para escucharnos"
    );

    this.resetClosingTexts();

    const restartButton = document.querySelector("#restart-experience");
    
    if (restartButton && !restartButton.dataset.ready) {
      restartButton.addEventListener("click", () => {
        this.startRestartTransition();
      });
    
      if (typeof initRandomWeightText === "function") {
        initRandomWeightText(restartButton.parentElement);
      }
    
      restartButton.dataset.ready = "true";
    }
  }

  exit() {
    this.setPauseButtonVisible(true);
    this.resetClosingTexts();
  }

  createParticles() {
    this.particles = [];

    const amount = width < 768 ? 30 : 60;

    for (let i = 0; i < amount; i++) {
      this.particles.push({
        angle: random(TWO_PI),
        radius: random(0.2, 0.9),
        size: random(3, width < 768 ? 8 : 12),
        alpha: random(0.25, 0.62),
        speed: random(-0.006, 0.006),
        offsetX: 0,
        offsetY: 0,
      });
    }
  }

  update(progress) {
    this.enterProgress = lerp(this.enterProgress, 1, 0.016);
    this.growthProgress = lerp(this.growthProgress, 1, 0.008);
  
    if (!this.isRestarting) {
      this.size = lerp(
        this.baseSize,
        this.targetSize,
        easeOutCubic(this.growthProgress)
      );
    }
  
    this.updateParticles();
    this.updateClosingTexts();
    this.updateHover();
  
    if (this.isRestarting) {
      this.restartProgress = min(this.restartProgress + 0.008, 1);
  
      const targetRestartSize = this.baseSize * 0.85;
      this.size = lerp(this.size, targetRestartSize, 0.04);
  
      if (this.restartProgress >= 1) {
        startPhase("contener", {
          fromClosing: true,
          x: this.x,
          y: this.y,
          size: this.getCoreSize()
        });
      }
    }
  }

  updateParticles() {
    for (let p of this.particles) {
      p.angle += p.speed;

      const orbitRadius = this.size * p.radius;
      const px = this.x + cos(p.angle) * orbitRadius;
      const py = this.y + sin(p.angle) * orbitRadius;

      // Reacción sutil al mouse/tap: las partículas se apartan y vuelven.
      const d = dist(mouseX, mouseY, px, py);
      const influenceRadius = width < 768 ? 90 : 130;

      if (d < influenceRadius) {
        const angleAway = atan2(py - mouseY, px - mouseX);
        const force = map(d, 0, influenceRadius, 1, 0);

        p.offsetX = lerp(p.offsetX, cos(angleAway) * force * 26, 0.12);
        p.offsetY = lerp(p.offsetY, sin(angleAway) * force * 26, 0.12);
      } else {
        p.offsetX = lerp(p.offsetX, 0, 0.08);
        p.offsetY = lerp(p.offsetY, 0, 0.08);
      }
    }
  }

  updateHover() {
    const dCore = dist(mouseX, mouseY, this.x, this.y);
    this.isRestartHovered = dCore < this.getCoreSize() / 2;

    const targetHover = this.isRestartHovered && this.canRestart ? 1 : 0;
    this.hoverProgress = lerp(this.hoverProgress, targetHover, 0.08);
  }

  updateClosingTexts() {
    const texts = document.querySelector("#closing-texts");
    if (!texts) return;
  
    if (this.growthProgress > 0.60 && this.growthProgress <= 0.90) {
      texts.classList.add("is-active", "show-message");
    }
  
    if (this.growthProgress > 0.90) {
      texts.classList.remove("show-message");
    }
  
    if (this.growthProgress > 0.90) {
      texts.classList.add("show-restart");
      this.canRestart = true;
    }
  }
  
  resetClosingTexts() {
    const texts = document.querySelector("#closing-texts");
    if (!texts) return;
  
    texts.classList.remove(
      "is-active",
      "show-message",
      "show-restart",
      "is-hiding"
    );
  }

  draw(progress) {
    background("#FFFAF5");

    const restartFade = this.isRestarting
    ? easeInOutCubic(this.restartProgress)
    : 0;

    const fogVisibility = this.enterProgress * (1 - restartFade);
    const wavesVisibility = this.enterProgress * (1 - restartFade);
    const particlesVisibility = this.enterProgress * constrain(1 - restartFade * 1.8, 0, 1);

    // El core permanece más tiempo, como si fuera la semilla de la fase 1
    const coreVisibility = this.enterProgress * constrain(1 - restartFade * 0.35, 0, 1);

    const breath = sin(frameCount * 0.026);

    this.drawFog(fogVisibility, breath);
    this.drawWaves(wavesVisibility, breath);
    this.drawParticles(particlesVisibility, breath);
    this.drawCore(coreVisibility, breath);

    // Por seguridad, mantenemos la barra siempre completa durante el cierre.
    updateProgressBar(1);
  }

  drawFog(visibility, breath) {
    noStroke();

    const fogSize = this.size * (1.85 + breath * 0.08);

    const fogGradient = drawingContext.createRadialGradient(
      this.x,
      this.y,
      this.size * 0.08,
      this.x,
      this.y,
      fogSize * 0.55
    );

    fogGradient.addColorStop(0, hsl(this.color, 0.34 * visibility));
    fogGradient.addColorStop(0.55, hsl(this.color, 0.18 * visibility));
    fogGradient.addColorStop(1, hsl(this.color, 0));

    drawingContext.fillStyle = fogGradient;
    circle(this.x, this.y, fogSize);
  }

  drawWaves(visibility, breath) {
    noFill();
    strokeWeight(1);

    for (let i = 0; i < 3; i++) {
      const waveSize = this.size * (0.75 + i * 0.20 + breath * 0.035);
      const alpha = (0.2 - i * 0.018) * visibility;

      stroke(hsl(this.color, alpha));
      circle(this.x, this.y, waveSize);
    }
  }

  drawParticles(visibility) {
    noStroke();

    for (let p of this.particles) {
      const orbitRadius = this.size * p.radius;

      const px = this.x + cos(p.angle) * orbitRadius + p.offsetX;
      const py = this.y + sin(p.angle) * orbitRadius + p.offsetY;

      fill(hsl(this.color, p.alpha * visibility));
      circle(px, py, p.size);
    }
  }

  drawCore(visibility, breath) {
    const coreSize = this.getCoreSize() * (1 + breath * 0.025);

    // Hover gradual, no brusco.
    const hoverBoost = lerp(1, 1.08, this.hoverProgress);
    const finalCoreSize = coreSize * hoverBoost;

    noStroke();

    // Gradiente heredado del MainTearCircle.
    const gradient = drawingContext.createRadialGradient(
      this.x,
      this.y,
      0,
      this.x,
      this.y,
      finalCoreSize * 0.58
    );

    gradient.addColorStop(0, hsl(MOOD_COLORS.cream, 1 * visibility));
    gradient.addColorStop(0.22, hsl(MOOD_COLORS.cream, 0.92 * visibility));
    gradient.addColorStop(0.48, hsl(MOOD_COLORS.neutral, 0.38 * visibility));
    gradient.addColorStop(0.75, hsl(MOOD_COLORS.neutral, 0.58 * visibility));
    gradient.addColorStop(1, hsl(MOOD_COLORS.neutral, 0.22 * visibility));

    drawingContext.fillStyle = gradient;
    circle(this.x, this.y, finalCoreSize);
  }

  getCoreSize() {
    // Núcleo grande, cercano al MainTearCircle.
    return this.size * 0.62;
  }

  mousePressed() {
    if (!this.canRestart) return false;

    const d = dist(mouseX, mouseY, this.x, this.y);

    if (d < this.getCoreSize() / 2) {
      this.startRestartTransition();
      return true;
    }

    return false;
  }

  setPauseButtonVisible(isVisible) {
    const button = document.querySelector("#pause-toggle");
    if (!button) return;

    button.classList.toggle("is-hidden", !isVisible);
    button.disabled = !isVisible;
  }

  updateNavbarText(textContent) {
    const navbarText = document.querySelector(
      ".ux-note p, .ux-note .subtitle, .ux-note .subtitle-canvas"
    );
  
    if (!navbarText) return;
  
    navbarText.textContent = textContent;
  }

  startRestartTransition() {
    if (!this.canRestart || this.isRestarting) return;
  
    this.isRestarting = true;
    this.restartProgress = 0;
  
    const texts = document.querySelector("#closing-texts");
  
    if (texts) {
      texts.classList.add("is-hiding");
    }
  }

}

function easeOutCubic(t) {
  return 1 - pow(1 - t, 3);
}

function easeInOutCubic(t) {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - pow(-2 * t + 2, 3) / 2;
}