// Clase con las propiedades de la fase "Contener"
class ContenerPhase {
  constructor() {
    this.duration = 50000;
    this.mainCircle = null;
    this.factorSystem = null;

    // Progreso de entrada de la fase.
    // 0 = invisible / 1 = fase completamente visible e interactiva.
    this.enterProgress = 0;

    // Controla si la interacción ya está permitida.
    this.canInteract = false;

    // Presión de los anillos
    this.ringPressure = 0;

    // Si viene de cierre
    this.fromClosing = false;
  }

  enter(data = null) { 
    // entrada del círculo desde la posición del círculo del la fase de cieere
    const startX = data && data.fromClosing ? data.x : width / 2;
    const startY = data && data.fromClosing ? data.y : height / 2;

    this.mainCircle = new MainTearCircle(startX, startY);

    this.fromClosing = data && data.fromClosing;

    if (data && data.fromClosing) {
      this.mainCircle.baseSize = data.size;
      this.mainCircle.size = data.size;
      this.mainCircle.targetSize = data.size;
    
      // Si venimos del cierre, el círculo nace más pequeño.
      // Aceleramos solo esta entrada para que llegue antes al umbral de tensión.
      this.mainCircle.growthSpeed = 0.45;
    
      this.enterProgress = 0.45;
    } else {
      // Entrada normal desde index.html
      this.mainCircle.growthSpeed = 0.30;
    
      this.enterProgress = 0;
    }

    // Creamos el sistema de nodos alrededor del círculo principal
    this.factorSystem = new FactorSystem(this.mainCircle);

    // Reiniciamos entrada
    if (!(data && data.fromClosing)) {
      this.enterProgress = 0;
    }
    this.canInteract = false;
  }

  update(progress) {
    // Entrada suave de la fase 1.
    // Primero aparece el MainTearCircle, después los nodos.
    this.enterProgress = lerp(this.enterProgress, 1, 0.035);

    // Permitimos interacción solo cuando la entrada ya está casi terminada.
    this.canInteract = this.enterProgress > 0.82;

    this.mainCircle.update();


    // Suavizar la presión de los anillos
    const targetRingPressure = this.mainCircle.isPressed ? 1 : 0;

    this.ringPressure = lerp(
      this.ringPressure,
      targetRingPressure,
      0.08
    );

    // Los nodos se actualizan según la posición y tamaño del MainTearCircle
    this.factorSystem.update();

    if (progress > 0.90) {
      this.mainCircle.startFollowingMouse();
    
      // Cuando el círculo empieza a escapar hacia Desbordar,
      // limpiamos las estelas para evitar rastros enredados.
      for (let node of this.factorSystem.nodes) {
        node.trail = [];
      }
    }
  }

  draw(progress) {
    
    background("#FFFAF5");

    // Crear alpha para los haros
    const ringsAlpha = map(this.enterProgress, 0.1, 0.75, 0, 1, true);
    this.drawContainmentAtmosphere(ringsAlpha);

    // MainTearCircle aparece primero
    const circleAlpha = map(this.enterProgress, 0, 0.55, 0, 1, true);
    const circleScale = map(this.enterProgress, 0, 0.55, 0.72, 1, true);

    // Nodos aparecen después
    const nodesAlpha = map(this.enterProgress, 0.55, 1, 0, 1, true);

    // Dibujamos todo dentro de capas con alpha
    push();

    // NODOS / CONEXIONES / ESTELAS
    drawingContext.globalAlpha = nodesAlpha;
    this.factorSystem.drawTrails();
    this.factorSystem.drawConnections();

    pop();

    // CÍRCULO PRINCIPAL
    push();
    drawingContext.globalAlpha = circleAlpha;

    // Escalamos desde el centro del círculo para que parezca que nace suavemente.
    translate(this.mainCircle.x, this.mainCircle.y);
    scale(circleScale);
    translate(-this.mainCircle.x, -this.mainCircle.y);

    this.mainCircle.draw();
    pop();

    // NODOS encima del círculo
    push();
    drawingContext.globalAlpha = nodesAlpha;
    this.factorSystem.drawNodes();
    this.factorSystem.drawNotes();
    pop();
  }

  // dibujar los elementos de la atmósfera contención
  drawContainmentAtmosphere(globalAlpha = 1) {
    if (!this.mainCircle) return;
  
    push();
  
    noFill();
  
    // aro se deforma cuando el usurio mantiene
    const pressure = this.ringPressure;
    // aro se deforma cuando el círculo empieza a temblar
    const limitTension = this.mainCircle.limitProgress;
    const deformationPower = max(pressure, limitTension * 1.2);
    
  
    const baseAlpha = lerp(0.1, 0.20, pressure) * globalAlpha;
    const ringGap = lerp(70, 50, pressure);
    const ringOffset = lerp(90, 58, pressure);
  
    stroke(hsl(MOOD_COLORS.blue, baseAlpha));
    strokeWeight(1);

    const isMobile = width < 768;
    const ringsAmount = isMobile ? 7 : 15;
  
    for (let i = 0; i < ringsAmount; i++) {
      const breathing = sin(frameCount * 0.035 + i * 0.8) * 4;
  
      const ringSize =
        this.mainCircle.size +
        ringOffset +
        i * ringGap +
        breathing;
  
      beginShape();
  
      const points = 50;
      const baseRadius = ringSize / 2;
  
      for (let a = 0; a < TWO_PI; a += TWO_PI / points) {
        const distortion = noise(
          cos(a) * 1.4 + i * 10,
          sin(a) * 1.4 + i * 10,
          frameCount * 0.015
        );
  
        const deformation = map(
          distortion,
          0,
          1,
          -10 * deformationPower,
          10 * deformationPower
        );
  
        const r = baseRadius + deformation;
  
        const x = this.mainCircle.x + cos(a) * r;
        const y = this.mainCircle.y + sin(a) * r;
  
        vertex(x, y);
      }
  
      endShape(CLOSE);
    }
  
    pop();
  }

  mousePressed() {
    if (!this.canInteract) return;

    this.factorSystem.mousePressed();

    if (this.mainCircle.contains(mouseX, mouseY)) {
      this.mainCircle.press();
    }
  }

  mouseReleased() {
    if (!this.mainCircle) return;
    this.mainCircle.release();
  }

  getTransitionData () {
    return {
      mainCircle: this.mainCircle
    };
  }

  exit() {}
}