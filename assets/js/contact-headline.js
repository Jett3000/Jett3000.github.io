(() => {
  const endings = document.querySelectorAll(".rotating-word");
  if (!endings.length || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const phrases = [
    "create together",
    "collaborate on something",
    "run an experiment",
    "begin something new",
    "build a new world",
    "play with an idea",
    "make a sketch real",
    "try something unexpected",
    "share a wild idea",
    "bring a thought to life",
    "realize a vision",
    "dream together",
    "start anew",
    "have a gossip sesh",
    "see what I look like on Zoom",
    "set a meeting",
    "draw something up",
    "make something together"
  ];

  for (let i = phrases.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [phrases[i], phrases[randomIndex]] = [phrases[randomIndex], phrases[i]];
  }

  const wait = (milliseconds) => new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });

  const variableDelay = (base, variation) => {
    return base + Math.floor(Math.random() * variation);
  };

  async function replaceEnding(element, nextEnding) {
    while (element.textContent.length > 0) {
      element.textContent = element.textContent.slice(0, -1);
      await wait(variableDelay(32, 16));
    }

    for (const character of nextEnding) {
      element.textContent += character;
      await wait(variableDelay(82, 58));
    }
  }

  async function rotate(element, startIndex) {
    let index = startIndex;
    element.textContent = phrases[index];

    while (true) {
      await wait(variableDelay(1800, 500));
      index = (index + 1) % phrases.length;
      await replaceEnding(element, phrases[index]);
    }
  }

  endings.forEach((ending, elementIndex) => {
    rotate(ending, elementIndex % phrases.length);
  });
})();
