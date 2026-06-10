let canvas; // Guardar el canvas
let phases = {}; // Objeto para guardar las fases
let currentPhase; // Fase que se está ejecutando
let currentPhaseName = "contener"; // Guardar el nombre de la fase activa
let phaseStartTime = 0; //Guardar el tiempo de inicio de la fase
let resizeTimeout; // Reiniciar el tiempo con el resize

// Variables para botón Pause/Reanudar
let isPaused = false;
let pauseStartedAt = 0;
let totalPausedTime = 0;
let pausedProgress = 0;

// CANVAS
function getCanvasHeight() {
  const header = document.querySelector("#header-canvas");
  const buttons = document.querySelector(".container-buttons");

  const headerHeight = header ? header.offsetHeight : 0;
  // Evitar que en responsive los botones tapen el canvas
  const buttonsHeight = buttons && window.innerWidth < 768
    ? buttons.offsetHeight
    : 0;

  const viewportHeight = window.visualViewport
    ? window.visualViewport.height
    : window.innerHeight;

  return viewportHeight - headerHeight - buttonsHeight;
}

// SETUP

function setup() {
  const canvasHeight = getCanvasHeight();

  canvas = createCanvas(windowWidth, canvasHeight);
  canvas.parent("sketch-container");

  setupPauseToggle();
  setupAmbientSound()
  setupReturnHomeAudioFade();

  phases = {
    contener: new ContenerPhase(),
    desbordar: new DesbordarPhase(),
    escuchar: new EscucharPhase(),
    cierre: new CierrePhase()
  };

  startPhase("contener");

  // Animacion de entrada de los elementos del canvas (header y botones)
  requestAnimationFrame(() => {
    document.body.classList.remove("canvas-loading");
  
    const header = document.querySelector("#header-canvas");
    const buttons = document.querySelector(".container-buttons");
  
    if (header) header.classList.add("is-visible");
  
    gsap.fromTo(buttons,
      {
        autoAlpha: 0,
        y: 16,
        filter: "blur(8px)"
      },
      {
        autoAlpha: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 0.8,
        delay: 0.25,
        ease: "power2.out"
      }
    );
  });
}

// DRAW

function draw() {
  let progress;

  if (isPaused) {
    progress = pausedProgress;
  } else {
    const elapsed = millis() - phaseStartTime - totalPausedTime; // Tiempo transcurrido desde el inicio de la fase
    progress = constrain(elapsed / currentPhase.duration, 0, 1); // Progreso de la fase
    pausedProgress = progress;
  }
  // Actualizar los datos del tiempo transcurrido
  currentPhase.update(progress); 
  currentPhase.draw(progress);

  // Comprobar el rendimiento de las animaciones
  // fill(0);
  // textSize(14);
  // text(`FPS: ${Math.round(frameRate())}`, 20, 30);

  // Actualizar la barra de progreso 
  if (currentPhaseName === "cierre") {
    updateProgressBar(1);
  } else {
    updateProgressBar(progress);
  }

  // Ir a la siguiente fase
  if (!isPaused && progress >= 1 && currentPhaseName !== "cierre") {
    goToNextPhase();
  }
}

// FASES

function startPhase(phaseName, data = null) { // Iniciar una fase
  if (currentPhase && currentPhase.exit) { // Limpiar la fase actual si existe
    currentPhase.exit(); // Ejecutar la función de salida de la fase actual
  }

  currentPhaseName = phaseName; // Guardar el nombre de la fase activa
  currentPhase = phases[phaseName]; //    
  phaseStartTime = millis(); // Guardar el tiempo de inicio de la fase

  totalPausedTime = 0;
  pauseStartedAt = 0;
  pausedProgress = 0;

  currentPhase.enter(data); // Ejecutar la función de entrada de la fase
  updateNavbar(phaseName); // Actualizar la barra de navegación
}

function goToNextPhase() { // Ir a la siguiente fase
  if (currentPhaseName === "contener") {
    const data = currentPhase.getTransitionData();
    startPhase("desbordar", data); // Si la fase actual es contener, ir a la fase desbordar
  } 
  else if (currentPhaseName === "desbordar") startPhase("escuchar"); // Si la fase actual es desbordar, ir a la fase escuchar
  else if (currentPhaseName === "escuchar") startPhase("cierre"); // Si la fase actual es escuchar, ir a la fase cierre
}

// PROGRESS BAR

function updateProgressBar(progress) {
  const fillBar = document.querySelector(".fill-bar"); // Obtener el elemento de la barra de progreso

  if (!fillBar) return;

  fillBar.style.width = `${progress * 100}%`; // Actualizar el ancho de la barra de progreso
}

function updateNavbar(phaseName) { // Actualizar la barra de navegación
  const header = document.querySelector("#header-canvas"); // Obtener el elemento del header
  const uxNote = document.querySelector(".ux-note .subtitle"); // Obtener el elemento de la nota de UX

  if (!header || !uxNote) return; // Si no existe el elemento, salir de la función
  
  header.dataset.phase = phaseName; // Actualizar el atributo data-phase del header

  const notes = {
    contener: "Intenta contener el llanto y descubre qué influye en nuestra forma de expresarlo",
    desbordar: "Déjalo brotar y observa cómo las palabras pueden acompañarlo o reprimirlo",
    escuchar: "Explora las huellas y descubre algunas reflexiones que emergen después del llanto",
    cierre: "Cada recorrido deja huellas. Acércate al centro para comenzar de nuevo"
  };

  uxNote.textContent = notes[phaseName] || ""; // Actualizar el texto de la nota de UX si existe, si no, dejar el texto vacío
};

// EVENTOS DEL MOUSE

function mousePressed() {
  if (currentPhase && currentPhase.mousePressed) {
    currentPhase.mousePressed();
  }
}

function mouseReleased() {
  if (currentPhase && currentPhase.mouseReleased) {
    currentPhase.mouseReleased();
  }
}

// RESPONSIVE

function touchStarted() {
  const target = event?.target;

  // Si el tap viene de un elemento HTML interactivo,
  // dejamos que funcione normal.
  if (target && target.closest("#pause-toggle, a, button")) {
    return true;
  }

  if (currentPhase && currentPhase.mousePressed) {
    currentPhase.mousePressed();
  }

  return false;
}

function touchEnded() {
  const target = event?.target;

  if (target && target.closest("#pause-toggle, a, button")) {
    return true;
  }

  if (currentPhase && currentPhase.mouseReleased) {
    currentPhase.mouseReleased();
  }

  return false;
}

function windowResized() {
  clearTimeout(resizeTimeout);

  resizeTimeout = setTimeout(() => {
    resizeCanvas(windowWidth, getCanvasHeight());

    // Reinicia la fase actual para recalcular posiciones,
    // cantidades responsive y tamaños según el nuevo viewport.
    if (currentPhaseName && currentPhaseName !== "cierre") {
      startPhase(currentPhaseName);
    }

    // Si estamos en cierre, solo recolocamos entrando de nuevo.
    if (currentPhaseName === "cierre") {
      startPhase("cierre");
    }
  }, 250);
}

// PASAR/RANUDAR TIEMPO
function setupPauseToggle() {
  const button = document.querySelector("#pause-toggle");
  if (!button) return;

  const icon = button.querySelector("img");
  const label = button.querySelector(".pause-label");

  button.addEventListener("click", () => {
    isPaused = !isPaused;

    if (isPaused) {
      pauseStartedAt = millis();

      updateRandomWeightText(label, "Continuar recorrido");
      icon.src = "img/ic-play.svg";
      icon.alt = "icono de reanudar";
      button.setAttribute("aria-pressed", "true");
    } else {
      totalPausedTime += millis() - pauseStartedAt;

      updateRandomWeightText(label, "Pausar recorrido");
      icon.src = "img/ic-pause.svg";
      icon.alt = "icono de pausa";
      button.setAttribute("aria-pressed", "false");
    }
  });
}

// PASAR/RANUDAR MUSICA AMBIENTE
function setupAmbientSound() {
  const audio = document.getElementById("ambient-audio");
  const buttonSound = document.querySelector("#sound-toggle");

  if (!audio || !buttonSound) return;

  const icon = buttonSound.querySelector("img");
  const label = buttonSound.querySelector(".pause-label");

  const maxVolume = 0.2;

  // En mobile el autoplay puede bloquearse aunque venga de un click en index.html.
  // Por eso empezamos asumiendo que el sonido está silenciado hasta confirmar
  // que audio.play() ha funcionado realmente.
  let isSoundMuted = true;

  // Estado visual cuando el sonido está activo.
  function setSoundActiveUI() {
    isSoundMuted = false;

    updateRandomWeightText(label, "Sonido");
    icon.src = "img/ic-active-sound.svg";
    icon.alt = "icono de sonido activado";
    buttonSound.setAttribute("aria-pressed", "false");
  }

  // Estado visual cuando el sonido está silenciado o bloqueado.
  function setSoundMutedUI() {
    isSoundMuted = true;

    updateRandomWeightText(label, "Silencio");
    icon.src = "img/ic-mute.svg";
    icon.alt = "icono de sonido desactivado";
    buttonSound.setAttribute("aria-pressed", "true");
  }

  // Intentamos arrancar el audio al entrar en la experiencia.
  // Si el navegador lo permite, hacemos fade-in.
  // Si lo bloquea, actualizamos la UI para que el primer tap del usuario
  // sirva para activar el sonido, no para silenciarlo.
  audio.volume = 0;

  audio.play()
    .then(() => {
      setSoundActiveUI();

      gsap.to(audio, {
        volume: maxVolume,
        duration: 3
      });
    })
    .catch(() => {
      setSoundMutedUI();
      console.log("Autoplay bloqueado");
    });

  buttonSound.addEventListener("click", () => {
    // Comprobamos el estado real del audio además de nuestra variable.
    // Esto evita el bug mobile en el que el navegador bloquea el autoplay,
    // pero la interfaz cree que el sonido ya estaba activo.
    const shouldActivateSound = isSoundMuted || audio.paused;

    if (shouldActivateSound) {
      audio.play().then(() => {
        setSoundActiveUI();

        gsap.to(audio, {
          volume: maxVolume,
          duration: 1.2,
          ease: "power2.out"
        });
      });

    } else {
      // Si el sonido ya está activo, el botón lo apaga con fade-out.
      gsap.to(audio, {
        volume: 0,
        duration: 0.8,
        ease: "power2.out",
        onComplete: () => {
          audio.pause();
          setSoundMutedUI();
        }
      });
    }
  });
}

function setupReturnHomeAudioFade() {
  const homeLink = document.querySelector(".logo-home-link");
  const audio = document.getElementById("ambient-audio");
  const transition = document.querySelector(".page-transition");

  if (!homeLink || !transition) return;

  homeLink.addEventListener("click", (e) => {
    e.preventDefault();

    sessionStorage.setItem("fromSketch", "true");

    const tl = gsap.timeline({
      defaults: { ease: "power2.inOut" },
      onComplete: () => {
        window.location.href = homeLink.href;
      }
    });

    if (audio) {
      tl.to(audio, {
        volume: 0,
        duration: 0.6,
        ease: "power2.out"
      }, 0);
    }

    tl.to(["#header-canvas", "#sketch-container", "#pause-toggle", "#sound-toggle"], {
      opacity: 0,
      filter: "blur(14px)",
      duration: 0.8
    }, 0);

    tl.to(transition, {
      opacity: 1,
      duration: 0.9
    }, 0.15);
  });
}