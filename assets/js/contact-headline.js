(() => {
  const ending = document.querySelector(".contact-rotating-word");
  if (!ending || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const endings = [
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
    "draw something up"
  ];

  for (let i = endings.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [endings[i], endings[randomIndex]] = [endings[randomIndex], endings[i]];
  }

  let index = 0;
  ending.textContent = endings[index];

  const wait = (milliseconds) => new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });

  const variableDelay = (base, variation) => {
    return base + Math.floor(Math.random() * variation);
  };

  async function replaceEnding(nextEnding) {
    while (ending.textContent.length > 0) {
      ending.textContent = ending.textContent.slice(0, -1);
      await wait(variableDelay(32, 16));
    }

    for (const character of nextEnding) {
      ending.textContent += character;
      await wait(variableDelay(82, 58));
    }
  }

  async function rotate() {
    while (true) {
      await wait(variableDelay(1800, 500));
      index = (index + 1) % endings.length;
      await replaceEnding(endings[index]);
    }
  }

  rotate();
})();
