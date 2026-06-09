// Clase para gestionar las partículas de la fase 2
class ParticleSystem {
    constructor() {
        this.particles = []; // Array donde se guardarán todas las partículas

        this.mood = "neutral";

        this.fadeProgress = 0; // 0 = normal / 1 = completamente apagado
    }

    // Controla el apagado final de las partículas
    setFadeProgress(value) {
        this.fadeProgress = constrain(value, 0, 1);
    }

    // Estado inicial de las partículas (en color, velocidad y alpha)
    setMood(type) {
        this.mood = type;
    }

    // Función que genera partículas desde una posición concreta
    emit (x, y) { 
        // Durante el fade-out dejamos de emitir nuevas partículas para parar el desborde (transición fase 3)
        if (this.fadeProgress > 0) return;

        // Define el estado normal de las partículas
        let speedMin = 3;
        let speedMax = 5;
        let alpha = 0.55;
        let particleColor = MOOD_COLORS.neutral;

        // Comportamiento de las partículas cuando colicionan con el emisor
        if (this.mood === "acompaña") {
            speedMin = 8;
            speedMax = 16;
            alpha = 0.7;
            particleColor = MOOD_COLORS.acompaña; // más claro, acuoso, luminoso
        }

        if (this.mood === "reprime") {
            speedMin = 1;
            speedMax = 3;
            alpha = 0.85;
            particleColor = MOOD_COLORS.reprime; // más oscuro y apagado
        }

        // Cada vez que se llama a emit(), crea 8 partículas
        for (let i = 0; i < 8; i++) {
            const angle = random(TWO_PI); // Elige una dirección aleatoria (TWO_PI = 360º)
            const speed = random (speedMin, speedMax); // Elige una velocidad aleatoria entre dos valores

            this.particles.push({
                // la posición desde la que nacen las partículas (desde el emisor)
                x,
                y,
                // convierte el ángulo y la velocidad en movimiento horizontal y vertical
                vx: cos(angle) * speed,
                vy: sin(angle) * speed,

                size: random (6, 30), // tamaños para círculos y cuadrados
                alpha: alpha, // opacidad para particulas
                color: particleColor, // colores para particulas

                // cada partcícula tiene una rotación inicial y una velocidad de rotación
                rotation: random(TWO_PI),
                rotationSpeed: random(-0.08, 0.08),
                // elige aleatoriamente la forma de la partícula
                shape: random(["circle", "square", "triangle"])
            });
        }
    }

    // Función que se ejecuta en cada frame
    update() {
        // recorre todas las partículas existentes
        for (let p of this.particles) {
            // mueve cada partícula según su velocidad
            p.x += p.vx;
            p.y += p.vy;

            // Durante el fadeout las partículas pierden velocidad, pasan de moverse con normalidad a quedarse quietas
            const friction = lerp(0.992, 0.90, this.fadeProgress);

            p.vx *= friction;
            p.vy *= friction;

            // La rotación también se apaga poco a poco
            p.rotation += p.rotationSpeed * (1 - this.fadeProgress);

            // Opacidad normal + apagado extra al final de la fase
            p.alpha -= 0.015;
            p.alpha = lerp(p.alpha, 0, this.fadeProgress * 0.08);
        }

        // eliminar las partículas que ya son invisibles
        this.particles = this.particles.filter(p => p.alpha > 0);
    }

    // Dibujar todas las partículas existentes
    draw() {
        // guardar estilos y quitar bordes
        push();
        noStroke();

        // recorrer todas las partículas
        for (let p of this.particles) {
            // color y opacidad
            fill(hsl(p.color, p.alpha));

            // mueve el punto de dibujo a la posición de la partícula y aplica rotación
            push();
            translate(p.x, p.y);
            rotate(p.rotation);

            // si es círculo, dibuja un círculo
            if(p.shape === "circle") {
                circle(0, 0, p.size);
            } else if (p.shape === "square") { // si es un cuadrado, usa ancho y alto diferentes
                rectMode(CENTER);
                rect(0, 0, p.size, p.size);
            } else if (p.shape === "triangle") {
                triangle(
                    0, -p.size / 2,
                    -p.size / 2, p.size / 2,
                    p.size / 2, p.size / 2
                );
            }

            pop();
        }

        pop();
    }
}
