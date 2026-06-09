// textEffects.js

function initRandomWeightText(scope = document) {
    const animatedTexts = scope.querySelectorAll(".text-random-weight");

    animatedTexts.forEach((element) => {
        setupRandomWeightElement(element);
    });
}

function setupRandomWeightElement(element) {
    if (!element) return;

    const isLogo = element.classList.contains("logo-animated");

    if (isLogo) {
        const chars = element.querySelectorAll(".logo-char");

        chars.forEach((char) => {
            const computedStyle = window.getComputedStyle(char);
            char.dataset.originalFontVariation =
                `"wght" ${computedStyle.fontWeight}`;
        });

        element.onmouseenter = () => {
            chars.forEach((char) => {
                gsap.to(char, {
                    fontVariationSettings: `"wght" ${gsap.utils.random(300, 900, 1)}`,
                    duration: 0.25,
                    ease: "power2.out"
                });
            });
        };

        element.onmouseleave = () => {
            chars.forEach((char) => {
                gsap.to(char, {
                    fontVariationSettings: char.dataset.originalFontVariation,
                    duration: 0.3,
                    ease: "power2.out"
                });
            });
        };

        return;
    }

    // Resto de textos normales
    if (element._randomWeightSplit) {
        element._randomWeightSplit.revert();
    }

    const split = SplitText.create(element, {
        type: "words, chars",
        wordsClass: "word",
        charsClass: "char"
    });

    element._randomWeightSplit = split;

    const chars = split.chars;

    chars.forEach((char) => {
        const computedStyle = window.getComputedStyle(char);
        char.dataset.originalFontVariation =
            computedStyle.fontVariationSettings !== "normal"
                ? computedStyle.fontVariationSettings
                : `"wght" ${computedStyle.fontWeight}`;
    });

    element.onmouseenter = () => {
        chars.forEach((char) => {
            gsap.to(char, {
                fontVariationSettings: `"wght" ${gsap.utils.random(300, 900, 1)}`,
                duration: 0.25,
                ease: "power2.out"
            });
        });
    };

    element.onmouseleave = () => {
        chars.forEach((char) => {
            gsap.to(char, {
                fontVariationSettings: char.dataset.originalFontVariation,
                duration: 0.3,
                ease: "power2.out"
            });
        });
    };
}

function updateRandomWeightText(element, newText) {
    if (!element) return;

    if (element._randomWeightSplit) {
        element._randomWeightSplit.revert();
    }

    element.textContent = newText;
    setupRandomWeightElement(element);
}