// Clase del sistema que gestiona todos los factores (nodos) de la fase 1
class FactorSystem {
    constructor(mainCircle) {
        this.mainCircle = mainCircle;

        this.nodes = [
            new FactorNode(
              "infancia",
              [
                "La forma en que reaccionan los adultos al llanto influye en cómo aprendemos a expresar nuestras emociones.",
                "Durante la infancia aprendemos qué emociones pueden mostrarse y cuáles es mejor esconder.",
                "Aprender a contener las lágrimas suele empezar mucho antes de que podamos explicar lo que sentimos."
              ],
              0,
              90,
              0.0015,
              16,
              NODE_COLORS.infancia
            ),
      
            new FactorNode(
              "juicio social",
              [
                "El género condiciona el llanto: a los hombres se les pide no llorar y a las mujeres no llorar demasiado.",
                "Muchas personas evitan llorar en público por miedo a ser juzgadas como débiles o poco competentes.",
                "La incomodidad ante el llanto no siempre habla de quien llora, sino del entorno que lo observa."
              ],
              PI * 0.55,
              130,
              -0.0012,
              17,
              NODE_COLORS.juicio
            ),
      
            new FactorNode(
              "carga emocional",
            [
              "Las lágrimas emocionales suelen aparecer cuando una experiencia nos desborda.",
              "Llorar no siempre significa tristeza: también puede expresar rabia, frustración, alivio o alegría.",
              "Cuando las emociones se contienen durante mucho tiempo, puede costar más identificarlas."
            ],
              PI * 1.1,
              165,
              0.0013,
              15,
              NODE_COLORS.carga
            ),
      
            new FactorNode(
              "referentes",
            [
              "Aprendemos a expresar nuestras emociones observando a los demás.",
              "Expresar emociones con libertad puede dar permiso a otros para hacerlo.",
              "Ver a otras personas llorar puede ayudarnos a comprender mejor las emociones ajenas."
            ],
              PI * 1.65,
              205,
              -0.0011,
              16,
              NODE_COLORS.referentes
            )
        ];
    }
    
    update() {
        for (let node of this.nodes) {
            node.update(this.mainCircle);
        }
    }

    drawTrails() {
        for (let node of this.nodes) {
            node.drawTrail();
        }
    }

    drawConnections() {
        for (let node of this.nodes) {
            node.drawConnection(this.mainCircle);
        }
    }

    drawNodes() {
        for (let node of this.nodes) {
          node.drawNode();
        }
    }

    drawNotes() {
        for (let node of this.nodes) {
          node.drawNote();
        }
    }

    draw() {
        this.drawTrails();
        this.drawConnections();
        this.drawNodes();
        this.drawNotes();
    }

    mousePressed() {
        let clickedNode = null;
      
        for (let node of this.nodes) {
          if (node.contains(mouseX, mouseY)) {
            clickedNode = node;
          }
        }
      
        // Si no se ha pulsado ningún nodo, cerramos todos.
        if (!clickedNode) {
          for (let node of this.nodes) {
            node.isActive = false;
          }
          return;
        }
      
        // Si el usuario pulsa un nodo que ya estaba activo,
        // avanzamos a la siguiente frase de esa categoría.
        if (clickedNode.isActive) {
          clickedNode.nextNote();
        }
      
        // Solo una nota activa a la vez.
        for (let node of this.nodes) {
          node.isActive = node === clickedNode;
        }
      }
}