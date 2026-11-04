const shimejiWorld = document.getElementById("shimejiWorld");
const shimejiCharacter = document.getElementById("shimejiCharacter");
const shimejiSprite = document.getElementById("shimejiSprite");
const shimejiActions = document.getElementById("shimejiActions");
const shimejiMessage = document.getElementById("shimejiMessage");
const shimejiToggle = document.getElementById("shimejiToggle");
const shimejiActionButtons = document.querySelectorAll("[data-shimeji-action]");

const spritePath = "interactable%20shimeji/sprites/";
const animationPath = "interactable%20shimeji/animation.json";
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

let animations = new Map();
let frameIndex = 0;
let animationTimeout;
let behaviorTimeout;
let messageTimeout;
let positionX = 18;
let facing = "right";
let isTuckedAway = false;
let isDragging = false;
let didDrag = false;
let dragStartX = 0;
let dragStartY = 0;
let dragOriginX = 0;
let dragOriginY = 0;
let animationRun = 0;

function clampPosition(value) {
  return Math.max(0, Math.min(value, window.innerWidth - 156));
}

function setPosition(x) {
  positionX = clampPosition(x);
  shimejiWorld.style.left = `${positionX}px`;
}

function closeActions() {
  shimejiActions.hidden = true;
  shimejiCharacter.setAttribute("aria-expanded", "false");
}

function showMessage(message) {
  shimejiMessage.textContent = message;
  window.clearTimeout(messageTimeout);
  messageTimeout = window.setTimeout(() => {
    if (!shimejiActions.hidden) shimejiMessage.textContent = "Chance is hanging out.";
  }, 3200);
}

function setTuckedAway(tucked) {
  isTuckedAway = tucked;
  shimejiWorld.hidden = tucked;
  shimejiToggle.setAttribute("aria-expanded", String(!tucked));
  shimejiToggle.setAttribute("aria-label", tucked ? "Bring Chance back from the Shimeji box" : "Tuck Chance away");
  shimejiToggle.querySelector(".shimeji-box-label").textContent = tucked ? "Bring back" : "Put away";
  if (tucked) {
    window.clearTimeout(animationTimeout);
    window.clearTimeout(behaviorTimeout);
    animationRun += 1;
    closeActions();
  } else if (animations.size) {
    settle();
  }
}

function getAnimation(key) {
  return animations.get(key);
}

function setFrame(animation, frame) {
  shimejiSprite.src = `${spritePath}${String(frame.sprite).padStart(4, "0")}.webp`;
  if (animation.subtype === "WALK" || animation.subtype === "CREEP") {
    setPosition(positionX + frame.dx * 4);
  }
}

function settle() {
  if (isTuckedAway || isDragging || !animations.size) return;
  window.clearTimeout(behaviorTimeout);
  const idleKey = `sit_dangle_${facing}`;
  playAnimation(getAnimation(idleKey) ? idleKey : "stand_right");
  if (!reducedMotion.matches) {
    behaviorTimeout = window.setTimeout(chooseNextBehavior, 4500 + Math.random() * 5000);
  }
}

function finishAnimation(run, onFinish) {
  if (run !== animationRun || isTuckedAway) return;
  if (onFinish) {
    onFinish();
  } else {
    settle();
  }
}

function playAnimation(key, options = {}) {
  const animation = getAnimation(key);
  if (!animation || !animation.frames.length || isTuckedAway) return;

  window.clearTimeout(animationTimeout);
  window.clearTimeout(behaviorTimeout);
  const run = ++animationRun;
  frameIndex = 0;
  if (animation.direction === "LEFT") facing = "left";
  if (animation.direction === "RIGHT") facing = "right";

  if (reducedMotion.matches) {
    setFrame(animation, animation.frames[0]);
    return;
  }

  const startedAt = performance.now();
  const showCurrentFrame = () => {
    if (run !== animationRun || isTuckedAway) return;
    const frame = animation.frames[frameIndex];
    setFrame(animation, frame);

    animationTimeout = window.setTimeout(() => {
      if (run !== animationRun || isTuckedAway) return;
      const durationReached = options.duration && performance.now() - startedAt >= options.duration;
      frameIndex += 1;

      if (durationReached || frameIndex >= animation.frames.length && animation.loop !== "LOOP") {
        finishAnimation(run, options.onFinish);
        return;
      }

      if (frameIndex >= animation.frames.length) frameIndex = 0;
      showCurrentFrame();
    }, Math.max(16, frame.durationTicks * 1000 / 60));
  };

  showCurrentFrame();
}

function chooseNextBehavior() {
  if (isTuckedAway || isDragging || reducedMotion.matches) return;
  const direction = Math.random() < 0.5 ? "left" : "right";
  const choice = Math.random();

  if (choice < 0.42) {
    facing = direction;
    playAnimation(`walk_${direction}`, { duration: 1800 + Math.random() * 2400 });
  } else if (choice < 0.68) {
    playAnimation(`wink_${direction}`);
  } else if (choice < 0.84) {
    playAnimation(`sprawl_${direction}`, { duration: 2200 });
  } else {
    playAnimation(`sit_${direction}`, { duration: 1800 });
  }
}

function performAction(action) {
  if (!animations.size) return;
  const direction = facing;

  if (action === "high-five") {
    showMessage("High five! Nice catch.");
    playAnimation(`wink_${direction}`);
  } else if (action === "hop") {
    showMessage("Wheee!");
    shimejiWorld.classList.remove("is-hopping");
    void shimejiWorld.offsetWidth;
    shimejiWorld.classList.add("is-hopping");
    window.setTimeout(() => shimejiWorld.classList.remove("is-hopping"), 600);
    playAnimation(`jump_up_${direction}`, {
      duration: 220,
      onFinish: () => playAnimation(`bounce_${direction}`, { duration: 400 })
    });
  } else if (action === "nap") {
    showMessage("Five more minutes...");
    playAnimation(`sprawl_${direction}`, { duration: 4000 });
  }
}

function toggleActions() {
  const isOpen = shimejiActions.hidden;
  shimejiActions.hidden = !isOpen;
  shimejiCharacter.setAttribute("aria-expanded", String(isOpen));
  if (isOpen) showMessage("What should Chance do?");
}

shimejiToggle.addEventListener("click", () => setTuckedAway(!isTuckedAway));

shimejiCharacter.addEventListener("click", () => {
  if (didDrag) {
    didDrag = false;
    return;
  }
  toggleActions();
  if (!reducedMotion.matches && animations.size) playAnimation(`wink_${facing}`);
});

shimejiActionButtons.forEach(button => {
  button.addEventListener("click", () => {
    const action = button.dataset.shimejiAction;
    if (action === "tuck") {
      setTuckedAway(true);
    } else {
      performAction(action);
    }
  });
});

document.addEventListener("pointerdown", event => {
  if (!shimejiWorld.contains(event.target) && !shimejiActions.hidden) closeActions();
});

shimejiCharacter.addEventListener("pointerdown", event => {
  if (event.button !== 0 || isTuckedAway) return;
  isDragging = true;
  didDrag = false;
  dragStartX = event.clientX;
  dragStartY = event.clientY;
  dragOriginX = positionX;
  dragOriginY = shimejiWorld.getBoundingClientRect().top;
  shimejiWorld.classList.add("is-dragging");
  window.clearTimeout(animationTimeout);
  window.clearTimeout(behaviorTimeout);
  animationRun += 1;
  if (animations.size) playAnimation("drag");
  shimejiCharacter.setPointerCapture(event.pointerId);
});

shimejiCharacter.addEventListener("pointermove", event => {
  if (!isDragging) return;
  const deltaX = event.clientX - dragStartX;
  const deltaY = event.clientY - dragStartY;
  if (Math.abs(deltaX) + Math.abs(deltaY) > 6) didDrag = true;
  if (!didDrag) return;

  shimejiWorld.style.bottom = "auto";
  shimejiWorld.style.top = `${Math.max(0, Math.min(dragOriginY + deltaY, window.innerHeight - shimejiWorld.offsetHeight))}px`;
  setPosition(dragOriginX + deltaX);
  if (Math.abs(deltaX) > 1) facing = deltaX < 0 ? "left" : "right";
});

let dragGuardTimeout;
function releaseCharacter() {
  if (!isDragging) return;
  isDragging = false;
  shimejiWorld.classList.remove("is-dragging");
  shimejiWorld.style.top = "";
  shimejiWorld.style.bottom = "-13px";
  if (didDrag) {
    didDrag = true;
    playAnimation(`bounce_${facing}`, { duration: 450 });
    window.clearTimeout(dragGuardTimeout);
    dragGuardTimeout = window.setTimeout(() => { didDrag = false; }, 500);
  } else {
    settle();
  }
}

shimejiCharacter.addEventListener("pointerup", releaseCharacter);
shimejiCharacter.addEventListener("pointercancel", releaseCharacter);
shimejiCharacter.addEventListener("lostpointercapture", releaseCharacter);
window.addEventListener("resize", () => setPosition(positionX));

fetch(animationPath)
  .then(response => {
    if (!response.ok) throw new Error(`Animation data request failed: ${response.status}`);
    return response.json();
  })
  .then(data => {
    if (!Array.isArray(data.animations)) throw new Error("Shimeji animation data is missing its animation list.");
    animations = new Map(data.animations.map(animation => [animation.key, animation]));
    if (!animations.size) throw new Error("Shimeji animation data contains no animations.");
    if (!isTuckedAway) settle();
  })
  .catch(error => {
    console.error("Unable to load the Shimeji animations.", error);
    shimejiSprite.src = "interactable%20shimeji/thumbnail.webp";
  });
