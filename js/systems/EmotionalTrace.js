// Clase para la huella emocional de la fase 3
// núcleo + partículas + niebla + ondas sueves

class EmotionalTrace {
    constructor(x, y, color, message) {
        // posición base de la huella
        this.x = x;
        this.y = y;

        // color emocional de la huella
        this.color = color;

        // mensaje que emerge cuando la huella ha sido escuchada
        this.message = message;

        // Frame en el que nace esta huella
        this.birthFrame = frameCount;

        this.appearAlpha = 0;
        this.appearDelay = random(0, 40);

        // intensidad de escucha (0 = apenas visible / 1 = muy presente)
        this.listenAmount = 0;

        // movimiento orgánico
        this.offset = random(TWO_PI);
        this.breathSpeed = random(0.006, 0.012);

        // tamaño general
        this.baseSize = random(95, 145);

        // radio en el que el mouse afecta la huella
        this.attentionRadius = 155;

        // partículas internas de la huella
        this.particles = [];

        for (let i = 0; i < 28; i++) {
            const angle = random(TWO_PI);
            const radius = random(8, this.baseSize * 0.45);

            this.particles.push({
                angle,
                radius,
                size: random(2, 7),
                alpha: random(0.28, 0.62),
                speed: random(-0.006, 0.006)
            });
        }

        // Estado del mensaje
        this.messageAlpha = 0;
        this.messageOpen = false;

        // Tamaños actuales para detectar hover sobre el núcleo
        this.currentSize = this.baseSize;
        this.currentCoreSize = this.baseSize * 0.24;
        this.isCoreHovered = false;

        // Dónde quiere estar la huella (target)
        // Dónde está realmente en este momento (offset suavizado)
        this.targetOffsetX = 0;
        this.targetOffsetY = 0;
        this.reactOffsetX = 0;
        this.reactOffsetY = 0;
    }

    update() {
        // Tiempo local de vida de esta huella
        const localFrame = frameCount - this.birthFrame;

        // La huella aparece después de su delay individual
        if (localFrame > this.appearDelay) {
        this.appearAlpha = lerp(this.appearAlpha, 1, 0.05);
        }
      
        // Respiración de la huella
        const breath = sin(frameCount * this.breathSpeed + this.offset);
        this.currentSize = this.baseSize + breath * 8;
        this.currentCoreSize = this.currentSize * 0.6;
      
        const dTrace = dist(mouseX, mouseY, this.x, this.y);
        
        // Activación general de la huella:
        // En desktop, la huella responde por cercanía del mouse.
        // En mobile, solo responde si el usuario ha tocado ESA huella.
        if (width < 768) {
          const targetListen = this.messageOpen ? 1 : 0.38;
          this.listenAmount = lerp(this.listenAmount, targetListen, 0.12);
        } else {
          if (dTrace < this.attentionRadius) {
            this.listenAmount = lerp(this.listenAmount, 1, 0.055);
          } else {
            this.listenAmount = lerp(this.listenAmount, 0.38, 0.045);
          }
        }

        // Reacción suave al mouse: la huella se acerca ligeramente
        if (width >= 768 && dTrace < this.attentionRadius) {
            const force = map(dTrace, 0, this.attentionRadius, 1, 0);
        
            this.targetOffsetX = (mouseX - this.x) * 0.25 * force;
            this.targetOffsetY = (mouseY - this.y) * 0.25 * force;
        } else {
            this.targetOffsetX = 0;
            this.targetOffsetY = 0;
        }
        
        this.reactOffsetX = lerp(this.reactOffsetX, this.targetOffsetX, 0.08);
        this.reactOffsetY = lerp(this.reactOffsetY, this.targetOffsetY, 0.08);

        // Hover específico sobre el núcleo
        const dCore = dist(mouseX, mouseY, this.x, this.y);
        this.isCoreHovered = dCore < this.currentCoreSize / 2 + 12;
      
        // En desktop: mensaje por hover sobre núcleo
        // En mobile: mensaje por tap sobre núcleo
        const shouldShowMessage = width < 768
          ? this.messageOpen
          : this.isCoreHovered;
      
        this.messageAlpha = lerp(
          this.messageAlpha,
          shouldShowMessage ? 1 : 0,
          0.08
        );
      
        // Movimiento lento de las partículas
        for (let p of this.particles) {
          p.angle += p.speed;
        }
    }

    draw(globalAlpha = 1) {
        push();

        translate(this.reactOffsetX, this.reactOffsetY);

        const visibility = this.appearAlpha * globalAlpha;
        const presence = this.listenAmount;

        if (visibility < 0.01) {
            pop();
            return;
        }

        // respiración de la huella
        const breath = sin(frameCount * this.breathSpeed + this.offset);
        const size = this.baseSize + breath * 8;

        noStroke();

        // NIEBLA ATMÓSFERA

        const fogGradient = drawingContext.createRadialGradient(
            this.x,
            this.y,
            size * 0.12,
            this.x,
            this.y,
            size * 0.95
        );
      
        fogGradient.addColorStop(
            0,
            hsl(this.color, lerp(0.22, 0.48, presence) * visibility)
        );
      
        fogGradient.addColorStop(
            0.55,
            hsl(this.color, lerp(0.10, 0.26, presence) * visibility)
        );
      
        fogGradient.addColorStop(
            1,
            hsl(this.color, 0)
        );
      
        drawingContext.fillStyle = fogGradient;
        circle(this.x, this.y, size * 1.9);

        // ONDAS

        noFill();
        strokeWeight(1);

        for (let i = 0; i < 3; i++) {

            const waveSize = size * (0.7 + i * 0.22 + presence * 0.08);
            const waveAlpha = lerp(0.025, 0.25, presence) * visibility;

            stroke(hsl(this.color, waveAlpha));
            circle(this.x, this.y, waveSize);
        }

        // PARTÍCULAS DE LA HUELLA

        noStroke();

        for (let p of this.particles) {

            const px = this.x + cos(p.angle) * p.radius;
            const py = this.y + sin(p.angle) * p.radius;

            const particleAlpha = p.alpha * lerp(0.75, 1, presence) * visibility;

            fill(hsl(this.color, particleAlpha));
            circle(px, py, p.size);
        }

        // NÚCLEO

        const coreSize = size * lerp(0.24, 0.30, presence);

        const coreGradient = drawingContext.createRadialGradient(
        this.x,
        this.y,
        0,
        this.x,
        this.y,
        coreSize * 0.58
        );

        coreGradient.addColorStop(0, hsl(MOOD_COLORS.cream, 1 * visibility));
        coreGradient.addColorStop(0.22, hsl(MOOD_COLORS.cream, 0.92 * visibility));
        coreGradient.addColorStop(0.48, hsl(this.color, 0.38 * visibility));
        coreGradient.addColorStop(0.75, hsl(this.color, 0.58 * visibility));
        coreGradient.addColorStop(1, hsl(this.color, 0.22 * visibility));

        drawingContext.fillStyle = coreGradient;
        circle(this.x, this.y, coreSize);

        // MENSAJE EMERGENTE
        // El mensaje aparece:
        // - desktop: al hacer hover sobre el núcleo
        // - mobile: al hacer tap sobre el núcleo

        if (this.messageAlpha > 0.01) {
            const textAlpha = this.messageAlpha * visibility;

            fill(hsl(MOOD_COLORS.textPrimary, textAlpha));
            noStroke();

            textAlign(CENTER, CENTER);
            textFont("EB Garamond");
            textSize(width < 768 ? 20 : 18);
            textLeading(width < 768 ? 24 : 22);

            if (width < 768) {
                // MOBILE: mensaje centrado en el canvas
                const textBoxW = min(280, width - 48);

                push();
                translate(width / 2, height / 2);

                text(
                    `“${this.message}”`,
                    -textBoxW / 2,
                    -20,
                    textBoxW,
                    80
                );

                pop();

            } else {
                // DESKTOP: mensaje cerca de la huella, protegido para no salirse
                const textBoxW = 260;
                const estimatedTextH = 70;
                const margin = 24;

                let textX = this.x;
                let textY = this.y + this.baseSize * 0.72;

                textX = constrain(
                    textX,
                    margin + textBoxW / 2,
                    width - margin - textBoxW / 2
                );

                if (textY + estimatedTextH / 2 > height - margin) {
                    textY = this.y - this.baseSize * 0.72;
                }

                textY = constrain(
                    textY,
                    margin + estimatedTextH / 2,
                    height - margin - estimatedTextH / 2
                );

                text(
                    `“${this.message}”`,
                    textX - textBoxW / 2,
                    textY - estimatedTextH / 2,
                    textBoxW,
                    estimatedTextH
                );
            }
        }

        pop();
    }

    // Detecta si el usuario ha tocado/clicado el núcleo
    mousePressed() {
        const d = dist(mouseX, mouseY, this.x, this.y);
        const isTouchingCore = d < this.currentCoreSize / 2 + 16;
    
        if (isTouchingCore) {
        this.messageOpen = !this.messageOpen;
        return true;
        }
    
        return false;
    }
    
    // Cierra el mensaje
    closeMessage() {
        this.messageOpen = false;
    }

}

