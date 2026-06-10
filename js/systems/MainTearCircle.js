// clase con propiedades del círculo (tamaño, crecimiento, estado presionado, fases, etc.)
class MainTearCircle {
    constructor(x, y) { // posición del círculo
        this.x = x;
        this.y = y;

        // tamaño del círculo
        const isMobile = width < 768;

        this.baseSize = isMobile ? 160 : 220 // tamaño inicial del círculo
        this.size = this.baseSize; // tamaño actual visible

        // tamaño máximo al que puede crecer
        this.maxSize = isMobile
            ? min(width * 0.68, height * 0.42, 340)
            : 520;

        this.canGrow = true; // controlar si el círculo puede crecer o no
        this.growthSpeed = 0.30; // cuánto crece poco a poco
        this.pressedScale = 0.80; // cuánto se reduce al mantener pulsado

        this.isPressed = false; // guarda si el usuario está manteniendo pulsado el círculo
        this.currentPhrase = ""; // guarda la frase que muestra dentro

        // array con las frases que aparecen al mantener pulsado
        this.phrases = [ 
            "Aguanta",
            "No llores",
            "Que no se note",
            "Contrólate",
            "Ahora no",
        ];

        // estados del círculo
        this.isAtLimit = false;
        this.transitionStarted = false;

        // partículas
        this.limitProgress = 0; // de 0 a 1 indica cuanta tensión tiene
        this.microDrops = [];

        // seguir al mouse (sirve de transición para la fase 2)
        this.followMouse = false;
        this.followSpeed = 0.03;

        // cambiar el tamaño del círculo
        this.targetSize = this.baseSize;
        this.sizeLerpSpeed = 0.06;

        // color del círculo
        this.moodColor = { ...MOOD_COLORS.neutral };
        this.targetMoodColor = { ...MOOD_COLORS.neutral };

    };

    // función que se ejecuta en cada frame de la fase
    update() { 
        
        if (this.followMouse) { // cuando la posición del círculo depende del mouse
            this.x = lerp(this.x, mouseX, this.followSpeed);
            this.y = lerp(this.y, mouseY, this.followSpeed)
        }

        if (this.isPressed) { // cuando se mantiene presionado, el tamaño actual del círculo se hace más pequeño
            this.size = lerp(this.size, this.baseSize * this.pressedScale, 0.08);
        } else { // sino, el círculo crece poco a poco sin superar el maxSize (si canGrow es true)

            if (this.canGrow) {
                this.baseSize = min(
                    this.baseSize + this.growthSpeed,
                    this.maxSize
                );
        
                this.targetSize = this.baseSize;
            }
        
            this.size = lerp(
                this.size,
                this.targetSize,
                this.sizeLerpSpeed
            );
        }

        // 75% del tamaño máximo → empieza tensión
        this.limitProgress = map(
            this.baseSize,
            this.maxSize * 0.90,
            this.maxSize,
            0,
            1,
            true
        );

        // 100% del tamaño máximo → límite alcanzado
        if(this.baseSize >= this.maxSize) {
            this.isAtLimit = true;
        };

        // comportamiento de las gotas
        // Empiezan cuando el círculo está al 55% de su tensión final
        if (this.limitProgress > 0.65 && frameCount % 8 === 0) {
            const dropsAmount = 2; // número de gotas por emisión

            for (let i = 0; i < dropsAmount; i++) {
                const angle = random(TWO_PI);
                const radius = this.size / 2;

                const startX = this.x + cos(angle) * radius;
                const startY = this.y + sin(angle) * radius;

                this.microDrops.push({
                    x: startX,
                    y: startY,
                    vx: cos(angle) * random(0.4, 1.2),
                    vy: sin(angle) * random(0.4, 1.2),
                    size: random(3, 8),
                    alpha: 180
                });
            }
        }

        // Actualizar el color del círculo al colisionar con las frases en la fase 2
        this.moodColor.h = lerp(this.moodColor.h, this.targetMoodColor.h, 0.08);
        this.moodColor.s = lerp(this.moodColor.s, this.targetMoodColor.s, 0.08);
        this.moodColor.l = lerp(this.moodColor.l, this.targetMoodColor.l, 0.08);

    };

    draw() { // función para dibujar el círculo

        // aplicar temblor al dibujar
        let shakeAmount = this.limitProgress * 3;
        let drawX = this.x + random(-shakeAmount, shakeAmount);
        let drawY = this.y + random(-shakeAmount, shakeAmount);

        // hacer el glow pulsante
        const pulse = sin(frameCount * 0.08) * 12 * this.limitProgress;
        // cuando limitProgress es 0, no pulsa. Cuando se acerca a 1, empieza a latir.

        push();
    
        noStroke();
    
        // Crear gradiente interior
        const gradient = drawingContext.createRadialGradient(
            drawX,
            drawY,
            0,
            drawX,
            drawY,
            this.size * 0.58
        );
          
        gradient.addColorStop(0, hsl(MOOD_COLORS.cream, 1));
        gradient.addColorStop(0.22, hsl(MOOD_COLORS.cream, 0.92));
        gradient.addColorStop(0.48, hsl(this.moodColor, 0.38));
        gradient.addColorStop(0.75, hsl(this.moodColor, 0.58));
        gradient.addColorStop(1, hsl(this.moodColor, 0.22));
          
        drawingContext.fillStyle = gradient;
        circle(drawX, drawY, this.size);
    

        // mostrar el texto solo si el círculo está presionado y hay frase seleccionada
        if (this.isPressed && this.currentPhrase) {
            // estilo del texto
          fill(hsl(MOOD_COLORS.textPrimary));
          noStroke();
          textAlign(CENTER, CENTER);
          textFont("EB Garamond");
        //   textStyle(BOLD);
          textSize(22);
          // Dibujar la frase en el centro del círculo
          text(`“${this.currentPhrase}”`, drawX, drawY);
        };

        // Primeras microlágrimas
        for (let drop of this.microDrops) {
            fill(101, 148, 205, drop.alpha);
            noStroke();
            circle(drop.x, drop.y, drop.size);
        
            drop.x += drop.vx;
            drop.y += drop.vy;
            drop.alpha -= 2;
        }
          
          this.microDrops = this.microDrops.filter(drop => drop.alpha > 0);
    
        pop();
    };

    // comprobar si el mouse está dentro del círculo
    contains(px, py) {
        const d = dist(px, py, this.x, this.y); // calcular distancia entre el mouse y el centro del círculo
        return d < this.size / 2; // si la distancia es menor que el radio, estás dentro
    }

    // cuando el usuario pulsa el cículo
    press() {
        this.isPressed = true;
        this.currentPhrase = random(this.phrases); // elegir frase aleatoria
    }

    // cuando el usuario suelta el mouse, deja de estar presionado
    release() {
        this.isPressed = false;
    }

    // Cuando el círculo empieza a seguir el mouse
    // Fase 1: el círculo solo sigue el mouse en desktop
    // En mobile/tablet queda fijo para evitar una interacción confusa
    startFollowingMouse() {
        const isDesktop = width >= 1024;
        this.followMouse = isDesktop;
    }

    // Fase 2: el emisor debe seguir siempre al usuario,
    // también en mobile/tablet.
    forceFollowingMouse() {
        this.followMouse = true;
    }

    // cambiar el tamaño del círculo para transicionar a la fase 2
    setTargetSize(newSize) {
        this.baseSize = newSize;
        this.targetSize = newSize;
    }

    // cambiar el color del círculo al colisionar con las frases en la fase 2
    setMoodColor(type) {
        if (type === "acompaña") {
            this.targetMoodColor = { ...MOOD_COLORS.acompaña };
        } else if (type === "reprime") {
            this.targetMoodColor = { ...MOOD_COLORS.reprime };
        } else {
            this.targetMoodColor = { ...MOOD_COLORS.neutral };
        }
    }

};