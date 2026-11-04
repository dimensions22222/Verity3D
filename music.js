const siteMusic = document.getElementById("siteMusic");
const musicConsent = document.getElementById("musicConsent");
const musicStatus = document.getElementById("musicStatus");
const enableMusicButton = document.getElementById("enableMusic");
const skipMusicButton = document.getElementById("skipMusic");
const musicToggle = document.getElementById("musicToggle");
const musicToggleLabel = document.getElementById("musicToggleLabel");

siteMusic.volume = 0.35;

function updateMusicToggle() {
  const isPlaying = !siteMusic.paused;
  musicToggle.setAttribute("aria-pressed", String(isPlaying));
  musicToggle.setAttribute("aria-label", isPlaying ? "Turn website music off" : "Turn website music on");
  musicToggleLabel.textContent = isPlaying ? "Music on" : "Music off";
}

async function startMusic() {
  musicStatus.textContent = "";
  try {
    await siteMusic.play();
    updateMusicToggle();
    if (musicConsent.open) musicConsent.close();
  } catch (error) {
    console.error("Unable to start website music.", error);
    musicStatus.textContent = "Music could not start. Check your sound settings or continue silently.";
  }
}

function continueSilently() {
  siteMusic.pause();
  updateMusicToggle();
  musicConsent.close();
}

enableMusicButton.addEventListener("click", startMusic);
skipMusicButton.addEventListener("click", continueSilently);
musicToggle.addEventListener("click", () => {
  if (siteMusic.paused) {
    startMusic();
  } else {
    siteMusic.pause();
    updateMusicToggle();
  }
});

siteMusic.addEventListener("play", updateMusicToggle);
siteMusic.addEventListener("pause", updateMusicToggle);
siteMusic.addEventListener("error", () => {
  console.error("Unable to load website music from Verity3D.mp3.");
  musicStatus.textContent = "The music file could not be loaded. You can continue silently.";
});

musicConsent.showModal();
enableMusicButton.focus();
