// Clase para cada factor que condiciona el llanto
class FactorNode {
    constructor(label, notes, angle, orbitOffset, speed, size, color) {
        this.label = label;

        // Cada nodo tiene varias frases posibles.
        // Se mostrarán de forma secuencial cada vez que el usuario pulse el nodo.
        this.notes = notes;
        this.currentNoteIndex = 0;
        this.note = this.notes[this.currentNoteIndex];

        // Opacidad de la nota.
        this.noteAlpha = 0;

        // Datos de órbita
        this.angle = angle;
        this.orbitOffset = orbitOffset;
        this.speed = speed;

        // Velocidad real del nodo
        this.currentSpeed = speed;

        // Tamaño visual del nodo
        this.size = size;

        // Color propio del nodo, viene de NODE_COLORS
        this.color = color;

        // Posición actual
        this.x = 0;
        this.y = 0;

        // Rastro de movimiento
        this.trail = [];

        // Estado activo: se activa al hacer click
        this.isActive = false;
    }

    update(mainCircle) {
        // El radio de la órbita depende del tamaño del círculo principal.
        // Así, cuando el MainTearCircle crece, empuja los nodos hacia fuera.
        const isMobile = width < 768;

        // Margen mínimo con los bordes
        const nodeSafeMargin = isMobile ? 32 : 52;
        
        // Mucha más separación respecto al MainTearCircle
        const responsiveGap = isMobile ? 150 : 36;
        
        const desiredOrbit =
            mainCircle.size / 2 +
            this.orbitOffset +
            responsiveGap;
        
        // En mobile damos más permiso a la órbita,
        // aunque el nodo se acerque bastante al borde.
        const maxOrbitX = min(
            mainCircle.x - nodeSafeMargin,
            width - mainCircle.x - nodeSafeMargin
        );
        
        const maxOrbitY = min(
            mainCircle.y - nodeSafeMargin,
            height - mainCircle.y - nodeSafeMargin
        );
        
        const maxOrbit = min(maxOrbitX, maxOrbitY);
        
        const orbitRadius = min(desiredOrbit, maxOrbit);

        // Movimiento orbital lento
        // Si el nodo está activo, orbita más lento. Si no, vuelve poco a poco a su velocidad normal.
        const targetSpeed = this.isActive ? this.speed * 0.18 : this.speed;
        this.currentSpeed = lerp(this.currentSpeed, targetSpeed, 0.08);

        this.angle += this.currentSpeed;

        // Fade de la nota
        const targetAlpha = this.isActive ? 1 : 0;
        this.noteAlpha = lerp(this.noteAlpha, targetAlpha, 0.08);

        // Pequeña variación orgánica para que no parezca una órbita mecánica perfecta
        const organicOffset = sin(frameCount * 0.01 + this.angle) * 12;

        this.x = mainCircle.x + cos(this.angle) * (orbitRadius + organicOffset);
        this.y = mainCircle.y + sin(this.angle) * (orbitRadius + organicOffset);

        // Margen para que los nodos no se salgan del canvas
        const margin = isMobile ? 32 : 44;
        this.x = constrain(this.x, margin, width - margin);
        this.y = constrain(this.y, margin, height - margin);

        // Guardamos la posición para dibujar la estela
        this.trail.push({ x: this.x, y: this.y });

        // Limitamos la estela para no cargar demasiado el sketch
        if (this.trail.length > 130) {
            this.trail.shift();
        }
    }

    drawTrail() {
        if (this.trail.length < 2) return;
    
        push(); // Guardamos el estado visual actual
    
        noFill();
    
        for (let i = 1; i < this.trail.length; i++) {
            const p1 = this.trail[i - 1];
            const p2 = this.trail[i];
    
            const t = i / this.trail.length;
            const alpha = lerp(0.015, 0.22, t);
    
            stroke(hsl(this.color, alpha));
            strokeWeight(1);
    
            line(p1.x, p1.y, p2.x, p2.y);
        }
    
        pop(); // Recuperamos el estado visual para no afectar al MainTearCircle
    }

    // Línea fina que conecta el nodo con el círculo principal
    drawConnection(mainCircle) {
        push();

        stroke(hsl(this.color, this.isActive ? 0.42 : 0.3));
        strokeWeight(1);

        line(mainCircle.x, mainCircle.y, this.x, this.y);

        pop();
    }

    drawNode() {
        push();
    
        noStroke();
    
        const activeScale = this.isActive ? 1.12 : 1;
        const nodeSize = this.size * activeScale;

        // HALO EXTERIOR
        fill(hsl(this.color, this.isActive ? 0.22 : 0.16));
        circle(this.x, this.y, nodeSize * 3.6);
    
        // NÚCLEO INTERIOR
        const gradient = drawingContext.createRadialGradient(
            this.x,
            this.y,
            0,
            this.x,
            this.y,
            nodeSize * 0.95
        );
    
        gradient.addColorStop(0, hsl(MOOD_COLORS.cream, 1));
        gradient.addColorStop(0.28, hsl(MOOD_COLORS.cream, 0.92));
        gradient.addColorStop(0.62, hsl(this.color, this.isActive ? 0.72 : 0.58));
        gradient.addColorStop(1, hsl(this.color, this.isActive ? 0.95 : 0.78));
    
        drawingContext.fillStyle = gradient;
    
        circle(this.x, this.y, nodeSize * 1.7);
    
        // TEXTO
        fill(hsl(MOOD_COLORS.textPrimary, this.isActive ? 1 : 0.7));
        textAlign(CENTER, CENTER);
        textFont("EB Garamond");
        textStyle(NORMAL);
        textSize(this.isActive ? 17 : 16);
        text(this.label, this.x, this.y + nodeSize * 2.3);
    
        pop();
    }

    drawNote() {
        if (this.noteAlpha < 0.01) return;
    
        push();
    
        // Detectamos el tipo de pantalla para ajustar la caja de texto
        const isMobile = width < 768;
        const isTablet = width >= 768 && width < 1024;
    
        // Ancho de la caja:
        // - Mobile: caja casi completa, pero con margen lateral
        // - Tablet: caja algo más ancha que desktop para que el texto respire.
        // - Desktop: mantiene un tamaño más compacto
        const boxW = isMobile
            ? min(320, width * 0.86)
            : isTablet
                ? min(380, width * 0.56)
                : min(340, width * 0.84);
    
        // Distancia entre el nodo y la caja cuando no estamos en mobile
        const offset = isTablet ? 32 : 44;
    
        // Padding interno de la caja
        const paddingX = isMobile ? 18 : 20;
        const paddingY = isMobile ? 16 : 18;
    
        // Texto ligeramente más pequeño en mobile para evitar cajas demasiado altas
        const textSizeValue = isMobile ? 17 : 18;
        const leadingValue = isMobile ? 21 : 23;
    
        // Ancho real disponible para el texto, descontando padding
        const textW = boxW - paddingX * 2;
    
        textFont("EB Garamond");
        textStyle(NORMAL);
        textSize(textSizeValue);
        textLeading(leadingValue);
    
        // Estimación de líneas para calcular la altura de la caja
        const estimatedLines = ceil(textWidth(this.note) / textW);
    
        // Altura de la caja:
        // usar un mínimo más generoso en mobile para que no quede comprimida.
        const boxH = max(
            isMobile ? 72 : 64,
            estimatedLines * leadingValue + paddingY * 2
        );
    
        let boxX;
        let boxY;
    
        // En mobile, la nota se coloca fija abajo y centrada
        // La subimos un poco más para que no choque con los botones inferiores
        if (isMobile) {
            boxX = (width - boxW) / 2;
            boxY = height - boxH - 80;
        } else {
            // En tablet/desktop, la nota aparece al lado contrario del nodo
            boxX = this.x < width / 2
                ? this.x + offset
                : this.x - boxW - offset;
    
            boxY = this.y - boxH / 2;
        }
    
        // Evitamos que la nota se salga del canvas
        boxX = constrain(boxX, 20, width - boxW - 20);
        boxY = constrain(boxY, 20, height - boxH - 20);
    
        // Línea nodo → nota.
        stroke(hsl(this.color, 0.34 * this.noteAlpha));
        strokeWeight(1);
        line(this.x, this.y, boxX + boxW / 2, boxY + boxH / 2);
    
        // Fondo de la caja
        noStroke();
        fill(hsl(MOOD_COLORS.cream, 0.9 * this.noteAlpha));
        rect(boxX, boxY, boxW, boxH, 4);
    
        // Borde sutil del color del nodo
        noFill();
        stroke(hsl(this.color, 0.28 * this.noteAlpha));
        strokeWeight(1);
        rect(boxX, boxY, boxW, boxH, 4);
    
        // Texto de la nota
        fill(hsl(MOOD_COLORS.textPrimary, 0.95 * this.noteAlpha));
        noStroke();
        textAlign(LEFT, TOP);
        textFont("EB Garamond");
        textStyle(NORMAL);
        textSize(textSizeValue);
        textLeading(leadingValue);
    
        text(
            this.note,
            boxX + paddingX,
            boxY + paddingY,
            textW
        );
    
        pop();
    }

    // Pasa a la siguiente frase de este nodo. Avanza en orden y vuelve al inicio al terminar.
    nextNote() {
        this.currentNoteIndex =
        (this.currentNoteIndex + 1) % this.notes.length;
    
        this.note = this.notes[this.currentNoteIndex];
    }

    contains(px, py) {
        const d = dist(px, py, this.x, this.y);
        return d < this.size / 2 + 14;
    }
}