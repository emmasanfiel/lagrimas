// -- ANIMACIONES SECCIONES

// COVER
// Animación: entrada del header, logo, claim y texto scroll
document.addEventListener("DOMContentLoaded", () => {

    const transition = document.querySelector(".page-transition");
    const cameFromSketch = sessionStorage.getItem("fromSketch") === "true";

    const coverLogoChars = document.querySelectorAll(".cover .logo-animated .logo-char");
    const coverClaim = document.querySelector(".cover .container-text-claim");
    const headerLogo = document.querySelector("#header-home .logo-home-link");
    const headerStepper = document.querySelector("#header-home .stepper-cover");
    const scrollText = document.querySelector(".container-scroll-text");

    if (!coverLogoChars.length) return;

    const tl = gsap.timeline({
        defaults: { ease: "power2.out" }
    });

    if (cameFromSketch && transition) {
        sessionStorage.removeItem("fromSketch");
    
        transition.classList.add("is-active");
    
        gsap.set(transition, { opacity: 1 });
    
        tl.to(transition, {
            opacity: 0,
            duration: 1,
            ease: "power2.out",
            onComplete: () => {
                transition.classList.remove("is-active");
            }
        }, 0);
    }

    gsap.set(coverLogoChars, {
        opacity: 0,
        filter: "blur(10px)",
        y: 30,
    });

    gsap.set([coverClaim, headerLogo], {
        opacity: 0,
        filter: "blur(8px)",
        y: 8,
    });
    
    gsap.set(headerStepper, {
        autoAlpha: 0,
        filter: "blur(8px)",
        yPercent: -50,
        y: 8,
    });

    gsap.set(scrollText, {
        autoAlpha: 0,
        filter: "blur(8px)",
        y: 8,
    });

    document.body.classList.remove("home-loading");

    tl.to(coverLogoChars, {
        opacity: 1,
        filter: "blur(0px)",
        y: 0,
        duration: 1.4,
        stagger: {
            each: 0.08,
            from: "random",
        },
    });

    tl.to(coverClaim, {
        opacity: 1,
        filter: "blur(0px)",
        y: 0,
        duration: 1,
    }, "-=0.5");

    tl.to(headerLogo, {
        opacity: 1,
        filter: "blur(0px)",
        y: 0,
        duration: 0.8,
    }, "-=0.2");

    tl.to(headerStepper, {
        autoAlpha: 1,
        filter: "blur(0px)",
        yPercent: -50,
        y: 0,
        duration: 0.8,
    }, "-=0.4");

    tl.to(scrollText, {
        autoAlpha: 1,
        filter: "blur(0px)",
        y: 0,
        duration: 0.8,
    }, "-=0.2");
});


// ONBOARDING Y PORTAL
document.addEventListener("DOMContentLoaded", () => {
    gsap.registerPlugin(ScrollTrigger);

    const phase1 = document.querySelector(".phase-1");
    const phase2 = document.querySelector(".phase-2");
    const phase3 = document.querySelector(".phase-3");

    const line1 = document.querySelector(".line-1");
    const line2 = document.querySelector(".line-2");

    const portalContainer = document.querySelector(".container-portal");

    if (!phase1 || !phase2 || !phase3) return;

    function setInitialStates() {
        gsap.set([
            ".phase-header",
            ".phase-text",
            ".phase1-circle",
            ".phase2-core",
            ".phase2-arrow",
            ".phase2-drop",
            ".phase3-container",
            ".phase3-particle",
            ".line-1",
            ".line-2",
        ], {
            opacity: 0,
        });

        gsap.set(".phase1-circle", {
            scale: 0,
            y: 0,
            transformOrigin: "50% 100%",
            transformBox: "fill-box",
        });

        gsap.set(".phase3-particle", {
            scale: 0,
            transformOrigin: "center center",
        });

        gsap.set([".phase-header", ".phase-text"], {
            y: 16,
            filter: "blur(8px)",
        });

        // Portal oculto al principio
        if (portalContainer) {
            gsap.set(portalContainer, {
                opacity: 0,
                y: 40,
                filter: "blur(16px)",
            });

            gsap.set(".link-start", {
                opacity: 0,
                y: 12,
                filter: "blur(8px)",
            });
        }
    }

    function animatePhase1() {
        const inner = phase1.querySelector(".phase1-circle--inner");
        const middle = phase1.querySelector(".phase1-circle--middle");
        const outer = phase1.querySelector(".phase1-circle--outer");
        const header = phase1.querySelector(".phase-header");
        const text = phase1.querySelector(".phase-text");

        const tl = gsap.timeline();

        tl.to(inner, {
            opacity: 1,
            scale: 1,
            duration: 0.9,
            ease: "power2.out",
        });

        tl.to(middle, {
            opacity: 1,
            scale: 1,
            duration: 0.8,
            ease: "power2.out",
        }, "-=0.35");

        tl.to(outer, {
            opacity: 1,
            scale: 1,
            duration: 0.8,
            ease: "power2.out",
        }, "-=0.4");

        tl.to(header, {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.7,
            ease: "power2.out",
        }, "-=0.1");

        tl.to(text, {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.7,
            ease: "power2.out",
        }, "-=0.35");

        if (line1) {
            tl.to(line1, {
                opacity: 1,
                duration: 0.4,
                ease: "power2.out",
            }, "-=0.35");
        }

        return tl;
    }

    function animatePhase2() {
        const core = phase2.querySelector(".phase2-core");
        const arrows = phase2.querySelectorAll(".phase2-arrow");
        const drops = phase2.querySelectorAll(".phase2-drop");
        const header = phase2.querySelector(".phase-header");
        const text = phase2.querySelector(".phase-text");

        const centerX = 124.294;
        const centerY = 125;

        [...arrows, ...drops].forEach((el) => {
            const bbox = el.getBBox();
            const elCenterX = bbox.x + bbox.width / 2;
            const elCenterY = bbox.y + bbox.height / 2;

            gsap.set(el, {
                x: centerX - elCenterX,
                y: centerY - elCenterY,
            });
        });

        const tl = gsap.timeline();

        tl.to(core, {
            opacity: 1,
            duration: 0.8,
            ease: "power2.out",
        });

        tl.to([...arrows, ...drops], {
            opacity: 1,
            x: 0,
            y: 0,
            duration: 1,
            ease: "power3.out",
        }, "-=0.15");

        tl.to(header, {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.7,
            ease: "power2.out",
        }, "-=0.05");

        tl.to(text, {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.7,
            ease: "power2.out",
        }, "-=0.35");

        if (line2) {
            tl.to(line2, {
                opacity: 1,
                duration: 0.4,
                ease: "power2.out",
            }, "-=0.35");
        }

        return tl;
    }

    function animatePhase3() {
        const container = phase3.querySelector(".phase3-container");
        const particles = phase3.querySelectorAll(".phase3-particle");
        const header = phase3.querySelector(".phase-header");
        const text = phase3.querySelector(".phase-text");

        const tl = gsap.timeline();

        tl.to(container, {
            opacity: 1,
            duration: 0.9,
            ease: "power2.out",
        });

        tl.to(particles, {
            opacity: 1,
            scale: 1,
            duration: 0.7,
            stagger: 0.12,
            ease: "power2.out",
        }, "-=0.2");

        tl.to(header, {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.7,
            ease: "power2.out",
        }, "-=0.05");

        tl.to(text, {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.7,
            ease: "power2.out",
        }, "-=0.35");

        return tl;
    }

    setInitialStates();

    function createIntroSplit() {
        const introTexts = document.querySelectorAll(".intro-text");

        if (!introTexts.length || typeof SplitText === "undefined") return [];

        return [...introTexts].map((text) => {
            return new SplitText(text, {
                type: "lines",
                linesClass: "intro-line"
            });
        });
    }

    function animateIntroText(split, textElement) {
        const tl = gsap.timeline();

        tl.set(textElement, {
            opacity: 1,
            pointerEvents: "auto",
        });

        tl.fromTo(split.lines,
            {
                opacity: 0,
                y: 32,
                filter: "blur(10px)",
            },
            {
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
                duration: 0.9,
                stagger: 0.12,
                ease: "power3.out",
            }
        );

        tl.to(split.lines, {
            opacity: 0,
            y: -24,
            filter: "blur(10px)",
            duration: 0.7,
            stagger: 0.08,
            ease: "power2.in",
        }, "+=0.6");

        return tl;
    }

    setInitialStates();

    function buildStoryTimeline() {
        const stepperCover = document.querySelector("#header-home .stepper-cover");
        // const stepperOnboarding = document.querySelector("#header-home .stepper-onboarding");
        const cover = document.querySelector(".cover");
        const intro = document.querySelector(".intro");
        const onboarding = document.querySelector(".onboarding");
        const portal = document.querySelector("#portal");
        const portalBg = document.querySelector(".story-bg-layer--portal");
        const portalParticles = document.querySelector("#start-sketch-container");
        const portalFog = document.querySelector(".portal-fog");
        const portalHalos = document.querySelectorAll(".portal-halo");
        const portalCore = document.querySelector(".portal-core");
        const portalText = document.querySelector(".link-start");
        const portalFooter = document.querySelector("#portal .footer");
        const portalFooterLink = document.querySelector("#portal .footer-link");
        const introTexts = document.querySelectorAll(".intro-text");
        const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
        const splits = createIntroSplit();
        
        // gsap.set(stepperOnboarding, {
        //     autoAlpha: 0,
        //     yPercent: -50,
        //     y: 6,
        //     filter: "blur(8px)",
        //     pointerEvents: "none",
        // });
    
        gsap.set([intro, onboarding], {
            opacity: 0,
            pointerEvents: "none",
        });
    
        gsap.set(introTexts, {
            opacity: 0,
        });

        gsap.set(portal, {
            opacity: 0,
            pointerEvents: "none",
        });
        
        gsap.set(portalBg, {
            opacity: 0,
        });
        
        gsap.set([
            portalParticles,
            portalFog,
            portalCore,
            portalText,
            portalFooter,
        ], {
            opacity: 0,
        });
        
        gsap.set(portalHalos, {
            opacity: 0,
        });
        
        gsap.set(".container-portal", {
            scale: 0.92,
            y: 36,
            filter: "blur(16px)",
        });

        gsap.set([portalCore, portalText, portalFooterLink], {
            pointerEvents: "none",
        });
    
        const storyTl = gsap.timeline({
            scrollTrigger: {
                trigger: "#story-home",
                start: "top top",
                end: isDesktop ? "+=620%" : "+=760%",
                scrub: isDesktop ? 1 : 1.25,
                pin: true,
                anticipatePin: 1,
                invalidateOnRefresh: true,
            },
        });
    
        storyTl
            .to({}, { duration: 0.5 })
    
            .to(cover, {
                opacity: 0,
                y: isDesktop ? -40 : -28,
                filter: "blur(12px)",
                duration: 0.8,
                ease: "power2.inOut",
            })
    
            .to(intro, {
                opacity: 1,
                pointerEvents: "auto",
                duration: 0.2,
            }, "-=0.2")
    
            .add(animateIntroText(splits[0], introTexts[0]))
            .add(animateIntroText(splits[1], introTexts[1]), "-=0.1")
    
            .to(intro, {
                opacity: 0,
                y: isDesktop ? -24 : -18,
                filter: "blur(10px)",
                pointerEvents: "none",
                duration: isDesktop ? 0.65 : 0.45,
                ease: "power2.inOut",
            })

            // .to(stepperCover, {
            //     autoAlpha: 0,
            //     filter: "blur(8px)",
            //     yPercent: -50,
            //     y: -6,
            //     pointerEvents: "none",
            //     duration: 0.3,
            //     ease: "power2.out",
            //     overwrite: "auto",
            // }, "-=0.2")
            
            // .to(stepperOnboarding, {
            //     autoAlpha: 1,
            //     filter: "blur(0px)",
            //     yPercent: -50,
            //     y: 0,
            //     pointerEvents: "auto",
            //     duration: 0.35,
            //     ease: "power2.out",
            //     overwrite: "auto",
            // }, "-=0.02")
            
            .to(onboarding, {
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
                pointerEvents: "auto",
                duration: isDesktop ? 0.65 : 0.45,
                ease: "power2.out",
            }, isDesktop ? "-=0.35" : "-=0.42")
    
            .to({}, { duration: 0.4 });

            if (isDesktop) {
                storyTl
                    .add(animatePhase1())
                    .to({}, { duration: 0.7 })
                    .add(animatePhase2())
                    .to({}, { duration: 0.7 })
                    .add(animatePhase3())
                    .to({}, { duration: 0.8 });
            } else {
                storyTl
                    .add(animateSinglePhase(animatePhase1, phase1))
                    .add(animateSinglePhase(animatePhase2, phase2))
                    .add(animateSinglePhase(animatePhase3, phase3))
                    .to({}, { duration: 0.5 });
            }

            storyTl

        // Sale onboarding
        .to(onboarding, {
            opacity: 0,
            y: -24,
            filter: "blur(12px)",
            duration: isDesktop ? 0.65 : 0.45,
            ease: "power2.inOut",
        })

        // El fondo radial se transforma
        .to(portalBg, {
            opacity: 1,
            duration: isDesktop ? 0.9 : 0.65,
            ease: "power2.inOut",
        }, isDesktop ? "-=0.5" : "-=0.38")
        
        .to(portal, {
            opacity: 1,
            duration: 0.2,
        }, isDesktop ? "-=0.75" : "-=0.5")

        .to([portalCore, portalText, portalFooterLink], {
            pointerEvents: "auto",
            duration: 0,
        }, "<")

        // Partículas
        .to(portalParticles, {
            opacity: 1,
            duration: 0.8,
            ease: "power2.out",
        })

        // Core + halos
        .to(".container-portal", {
            opacity: 1,
            scale: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 1,
            ease: "power3.out",
        }, "-=0.3")

        .to(portalFog, {
            opacity: 0.4,
            duration: 0.8,
        }, "-=0.8")

        .to(portalHalos, {
            opacity: 1,
            stagger: 0.15,
            duration: 0.8,
        }, "-=0.5")

        .to(portalCore, {
            opacity: 0.95,
            duration: 0.7,
        }, "-=0.4")

        .to(portalText, {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.8,
            ease: "power2.out",
        }, "-=0.3")

        .to(portalFooter, {
            opacity: 1,
            duration: 0.6,
        }, "-=0.4")

        .to({}, {
            duration: 0.6
        });

        return storyTl;
    }
    
    let storyTimeline;
    let currentMode = window.innerWidth >= 1024 ? "desktop" : "mobile";

    function initStoryTimeline() {
        if (storyTimeline) {
            storyTimeline.scrollTrigger?.kill();
            storyTimeline.kill();
        }

        ScrollTrigger.getAll().forEach(trigger => trigger.kill());

        storyTimeline = buildStoryTimeline();

        ScrollTrigger.refresh();
    }

    initStoryTimeline();

    window.addEventListener("resize", () => {
        const newMode = window.innerWidth >= 1024 ? "desktop" : "mobile";

        if (newMode !== currentMode) {
            currentMode = newMode;

            setTimeout(() => {
                initStoryTimeline();
            }, 250);
        } else {
            ScrollTrigger.refresh();
        }
    });

    function hidePhase(phase) {
        const items = phase.querySelectorAll(
            ".phase-header, .phase-text, .phase1-circle, .phase2-core, .phase2-arrow, .phase2-drop, .phase3-container, .phase3-particle"
        );
    
        return gsap.to(items, {
            opacity: 0,
            y: -16,
            filter: "blur(8px)",
            duration: 0.6,
            ease: "power2.inOut",
        });
    }
    
    function animateSinglePhase(phaseAnimation, phaseElement) {
        const tl = gsap.timeline();
    
        tl.add(phaseAnimation());
        tl.to({}, { duration: 0.7 });
        tl.add(hidePhase(phaseElement));
    
        return tl;
    }

});

// -- ANIMACIONES TEXTO BOTONES
document.addEventListener("DOMContentLoaded", () => {
    if (typeof initRandomWeightText === "function") {
        gsap.registerPlugin(SplitText);
        initRandomWeightText();
    }
});

// TRANSICIÓN DE LA INTRO AL CANVAS
document.addEventListener("DOMContentLoaded", () => {

    const portalLinks = document.querySelectorAll(
        ".portal-core, .link-start"
    );

    if (!portalLinks.length) return;

    portalLinks.forEach(link => {

        link.addEventListener("click", (e) => {
            e.preventDefault();

            const portal = document.querySelector(".circle-portal");
            const text = document.querySelector(".link-start");
            const core = document.querySelector(".portal-core");

            const header = document.querySelector("#header-home");
            const footer = document.querySelector("footer");

            const targetUrl = link.href;

            const tl = gsap.timeline({
                onComplete: () => {
                    window.location.href = targetUrl;
                }
            });

            tl.to([header, footer], {
                opacity: 0,
                filter: "blur(12px)",
                duration: 0.3,
                ease: "power2.out",
            }, 0);

            tl.to(text, {
                opacity: 0,
                filter: "blur(8px)",
                duration: 0.25,
                ease: "power2.out",
            });

            tl.to(portal, {
                scale: window.innerWidth < 768 ? 30 : 35,
                duration: 1,
                ease: "power3.inOut",
            }, "-=0.05");

            tl.to(core, {
                scale: 1.35,
                opacity: 1,
                duration: 0.8,
                ease: "power2.inOut",
            }, "-=0.8");
        });

    });

});

// MODAL NOTA DE AYUDA
document.addEventListener("DOMContentLoaded", () => {
    const modal = document.querySelector("#help-modal");
    const openButtons = document.querySelectorAll(".footer-link");
    const closeButtons = document.querySelectorAll("[data-close-help-modal]");

    if (!modal || !openButtons.length) return;

    function openModal(e) {
        e.preventDefault();

        modal.classList.add("is-open");
        modal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
    }

    function closeModal() {
        modal.classList.remove("is-open");
        modal.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
    }

    openButtons.forEach((button) => {
        button.addEventListener("click", openModal);
    });

    closeButtons.forEach((button) => {
        button.addEventListener("click", closeModal);
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modal.classList.contains("is-open")) {
            closeModal();
        }
    });
});