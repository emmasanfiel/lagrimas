const StartSketch = (p) => {
    let container;
    let particles = [];

    let x = 0;
    let y = 0;

    let enterProgress = 0;
    let growthProgress = 0;

    let baseSize = 90;
    let targetSize = 520;
    let size = baseSize;
    let wasMobile = null;

    const color = {
        h: 212,
        s: 45,
        l: 78
    };

    function hsl(c, alpha = 1) {
        return `hsla(${c.h}, ${c.s}%, ${c.l}%, ${alpha})`;
    }

    function easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    function setSizes() {
        const w = container.offsetWidth;
        const h = container.offsetHeight;

        x = w / 2;
        y = h / 2;

        baseSize = w < 768 ? 90 : 130;

        targetSize = w < 768
            ? Math.min(w * 1.05, h * 0.62)
            : Math.min(w * 0.72, h * 0.86);

        size = baseSize;
    }

    function createParticles() {
        particles = [];

        const amount = p.width < 768 ? 40 : 60;

        for (let i = 0; i < amount; i++) {
            particles.push({
                angle: p.random(p.TWO_PI),
                radius: p.random(0.2, 0.9),
                size: p.random(3, p.width < 768 ? 10 : 12),
                alpha: p.random(0.40, 0.80),
                speed: p.random(-0.006, 0.006),
                offsetX: 0,
                offsetY: 0,
            });
        }
    }

    function updateParticles() {
        for (let particle of particles) {
            particle.angle += particle.speed;

            const orbitRadius = size * particle.radius;
            const px = x + p.cos(particle.angle) * orbitRadius;
            const py = y + p.sin(particle.angle) * orbitRadius;

            const d = p.dist(p.mouseX, p.mouseY, px, py);
            const influenceRadius = p.width < 768 ? 90 : 130;

            if (d < influenceRadius) {
                const angleAway = p.atan2(py - p.mouseY, px - p.mouseX);
                const force = p.map(d, 0, influenceRadius, 1, 0);

                particle.offsetX = p.lerp(
                    particle.offsetX,
                    p.cos(angleAway) * force * 26,
                    0.12
                );

                particle.offsetY = p.lerp(
                    particle.offsetY,
                    p.sin(angleAway) * force * 26,
                    0.12
                );
            } else {
                particle.offsetX = p.lerp(particle.offsetX, 0, 0.08);
                particle.offsetY = p.lerp(particle.offsetY, 0, 0.08);
            }
        }
    }

    function drawParticles(visibility) {
        p.noStroke();

        for (let particle of particles) {
            const orbitRadius = size * particle.radius;

            const px =
                x +
                p.cos(particle.angle) * orbitRadius +
                particle.offsetX;

            const py =
                y +
                p.sin(particle.angle) * orbitRadius +
                particle.offsetY;

            p.fill(hsl(color, particle.alpha * visibility));
            p.circle(px, py, particle.size);
        }
    }

    p.setup = () => {
        container = document.querySelector("#start-sketch-container");

        if (!container) return;

        const canvas = p.createCanvas(
            container.offsetWidth,
            container.offsetHeight
        );

        canvas.parent(container);
        canvas.elt.setAttribute("aria-hidden", "true");

        setSizes();
        wasMobile = p.width < 768;
        createParticles();
    };

    p.draw = () => {
        if (!container) return;

        p.clear();

        enterProgress = p.lerp(enterProgress, 1, 0.016);
        growthProgress = p.lerp(growthProgress, 1, 0.008);

        size = p.lerp(
            baseSize,
            targetSize,
            easeOutCubic(growthProgress)
        );

        updateParticles();

        const visibility = enterProgress;

        drawParticles(visibility);
    };

    let resizeTimeout;

    p.windowResized = () => {
        clearTimeout(resizeTimeout);
    
        resizeTimeout = setTimeout(() => {
            if (!container) return;
    
            const newWidth = container.offsetWidth;
            const newHeight = container.offsetHeight;
    
            if (newWidth <= 0 || newHeight <= 0) return;
    
            const isMobile = newWidth < 768;

            p.resizeCanvas(newWidth, newHeight);
            setSizes();

            if (isMobile !== wasMobile) {
                createParticles();
                wasMobile = isMobile;
            }
    
            setSizes();
            createParticles();
        }, 250);
    };
};

new p5(StartSketch);