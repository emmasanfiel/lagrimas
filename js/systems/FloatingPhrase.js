// Clase para gestionar las frases de la fase 2
class FloatingPhrase {
    constructor(text, type, xRatio, yRatio) {
        this.text = text;
        this.type = type; // "acompaña" o "reprime"

        // escala visual de la frase
        this.scale = 1;

        this.baseXRatio = xRatio;
        this.baseYRatio = yRatio;

        this.x = width * xRatio;
        this.y = height * yRatio;

        this.offset = random(TWO_PI);
        this.floatRadiusX = random(12, 28);
        this.floatRadiusY = random (8, 20);

        this.vx = random(-0.12, 0.12);
        this.vy = random(-0.12, 0.12);

        this.size = width < 768 ? 20 : 22;
        this.activeTimer = 0;
    }

    update() {
        const baseX = width * this.baseXRatio;
        const baseY = height * this.baseYRatio;

        const targetScale = this.activeTimer > 0 ? 1.08 : 1;
        this.scale = lerp(this.scale, targetScale, 0.08);

        this.x += this.vx;
        this.y += this.vy;

        this.x += sin(frameCount * 0.01 + this.offset) * 0.12;
        this.y += cos(frameCount * 0.008 + this.offset) * 0.12;

        // reducir orbita
        const maxDistance = width < 768 ? 32 : 60;

        this.x = constrain(this.x, baseX - maxDistance, baseX + maxDistance);
        this.y = constrain(this.y, baseY - maxDistance, baseY + maxDistance);

        const isMobile = width < 768;

        textFont("EB Garamond");
        textSize(this.size * this.scale);

        const phraseW = textWidth(`“${this.text}”`);
        const phraseH = this.size * this.scale;

        const marginX = isMobile ? 16 : 40;
        const marginY = isMobile ? 48 : 40;

        this.x = constrain(
            this.x,
            marginX + phraseW / 2,
            width - marginX - phraseW / 2
        );

        this.y = constrain(
            this.y,
            marginY + phraseH / 2,
            height - marginY - phraseH / 2
        );

        if(this.activeTimer > 0) this.activeTimer--;
        if(this.cooldown > 0) this.cooldown--;
    }

    draw() {
        push();
    
        textAlign(CENTER, CENTER);
        textFont("EB Garamond");
        // textStyle(BOLD);
    
        const isActive = this.activeTimer > 0;
    
        textSize(this.size * this.scale);
    
        const alpha = isActive ? 1 : 0.72;

        const phraseColor = MOOD_COLORS.textPrimary;
    
        fill(hsl(phraseColor, alpha));
    
        text(`“${this.text}”`, this.x, this.y);
    
        pop();
    }

    isTouching(emitter) {
        const d = dist(this.x, this.y, emitter.x, emitter.y);
        const collisionDistance = emitter.size / 2 + 40;
    
        return d < collisionDistance;
    }

}