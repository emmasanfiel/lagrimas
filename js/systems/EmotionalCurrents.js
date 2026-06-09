class EmotionalCurrents {
    constructor() {
      this.particles = [];
  
      // Estado emocional recibido desde DesbordarPhase:
      // neutral | acompaña | reprime
      this.state = "neutral";
  
      // Multiplicador de velocidad suavizado
      this.speedMultiplier = 1;
      this.targetSpeedMultiplier = 1;
  
      this.createParticles();
    }

    getCurrentColor(p) {
      if (p.isCream) return MOOD_COLORS.creamDark;
    
      if (this.state === "acompaña") {
        return MOOD_COLORS.acompaña;
      }
    
      if (this.state === "reprime") {
        return MOOD_COLORS.reprime;
      }
    
      return MOOD_COLORS.blue;
    }
  
    createParticles() {
      this.particles = [];
  
      const isMobile = width < 768;
      const amount = isMobile ? 80 : 220;
  
      for (let i = 0; i < amount; i++) {
        
        const isCream = random() > 0.78;

        // OPACIDAD DE LAS CORRIENTES CREMA
        const creamAlphaMin = 0.30;
        const creamAlphaMax = 0.80;

        // OPACIDAD DE LAS CORRIENTES AZULES
        const blueAlphaMin = 0.08;
        const blueAlphaMax = 0.20;

        const alpha = isCream
        ? random(creamAlphaMin, creamAlphaMax)
        : random(blueAlphaMin, blueAlphaMax);
  
        this.particles.push({
          x: random(width),
          y: random(height),
  
          // Movimiento base de cada corriente
          speed: random(
            isMobile ? 0.25 : 0.35,
            isMobile ? 0.75 : 1.1
          ),
  
          // Forma alargada, más corriente que punto
          size: random(
            isMobile ? 3 : 4,
            isMobile ? 7 : 9
          ),
  
          // Presencia visual
          alpha: alpha,
          noiseOffset: random(1000),
  
          // Estado inicial fijo: azul + creamDark
          isCream: isCream,
  
          angle: random(TWO_PI),
        });
      }
    }
  
    setState(newState) {
      this.state = newState;
  
      // Cambiar velodiad según estado
      if (newState === "reprime") {
        // Más lentas, más contenidas
        this.targetSpeedMultiplier = 0.65;
      
      } else if (newState === "acompaña") {
        // Más rápidas, más libres
        this.targetSpeedMultiplier = 10;
      
      } else {
        this.targetSpeedMultiplier = 2.5;
      }
    }
    
  
    update() {
      const isMobile = width < 768;
  
      // Suaviza el cambio de velocidad para que no sea brusco
      this.speedMultiplier = lerp(
        this.speedMultiplier,
        this.targetSpeedMultiplier,
        0.06
      );
  
      for (let p of this.particles) {
        const noiseScale = isMobile ? 260 : 360;
        const noiseTime = frameCount * 0.003;
  
        // Dirección fluida base mediante noise
        const angle =
          noise(
            p.x / noiseScale,
            p.y / noiseScale,
            noiseTime + p.noiseOffset
          ) * TWO_PI * 1.8;
  
        p.angle = angle;
  
        // Reacción al mouse/tap: las corrientes se apartan suavemente
        const d = dist(mouseX, mouseY, p.x, p.y);
        const influenceRadius = isMobile ? 90 : 140;
  
        if (d < influenceRadius) {
          const awayAngle = atan2(p.y - mouseY, p.x - mouseX);
          const force = map(d, 0, influenceRadius, 1, 0);
  
          p.x += cos(awayAngle) * force * (isMobile ? 2.2 : 3.2);
          p.y += sin(awayAngle) * force * (isMobile ? 2.2 : 3.2);
        }
  
        // Movimiento principal: misma dirección, velocidad variable
        p.x += cos(angle) * p.speed * this.speedMultiplier;
        p.y += sin(angle) * p.speed * this.speedMultiplier;
  
        this.wrapParticle(p);
      }
    }
  
    draw(globalAlpha = 1) {
      push();
      noStroke();
  
      for (let p of this.particles) {
        push();
  
        translate(p.x, p.y);
        rotate(p.angle || 0);
  
        const currentColor = this.getCurrentColor(p);
        fill(hsl(currentColor, p.alpha * globalAlpha));
  
        ellipse(
          0,
          0,
          p.size * 6,
          p.size * 1.2
        );
  
        pop();
      }
  
      pop();
    }
  
    wrapParticle(p) {
      const margin = 20;
  
      if (p.x < -margin) p.x = width + margin;
      if (p.x > width + margin) p.x = -margin;
      if (p.y < -margin) p.y = height + margin;
      if (p.y > height + margin) p.y = -margin;
    }
  
    resize() {
      this.createParticles();
    }
  }