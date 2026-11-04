(() => {
  const customCursor = document.getElementById("customCursor");
  const finePointer = window.matchMedia("(pointer: fine)");
  const interactiveSelector = "a, button, input, textarea, select, summary, label, [role='button'], [contenteditable='true']";

  function hideCustomCursor() {
    document.documentElement.classList.remove("has-custom-cursor");
    customCursor.classList.remove("is-visible", "is-interactive", "is-pressed");
  }

  function updateCursorPosition(event) {
    if (!finePointer.matches || event.pointerType !== "mouse") {
      hideCustomCursor();
      return;
    }

    customCursor.style.left = `${event.clientX}px`;
    customCursor.style.top = `${event.clientY}px`;
    document.documentElement.classList.add("has-custom-cursor");
    customCursor.classList.add("is-visible");
    customCursor.classList.toggle(
      "is-interactive",
      event.target instanceof Element && event.target.closest(interactiveSelector) !== null
    );
    customCursor.classList.toggle("is-pressed", event.type === "pointerdown" || event.buttons > 0);
  }
  finePointer.addEventListener("change", hideCustomCursor);
  finePointer.addEventListener("change", hideCustomCursor);
  document.addEventListener("pointermove", updateCursorPosition);
  document.addEventListener("pointerdown", updateCursorPosition);
  document.addEventListener("pointerup", event => {
    if (event.pointerType === "mouse") customCursor.classList.remove("is-pressed");
  });
  document.addEventListener("pointercancel", hideCustomCursor);
  document.addEventListener("pointerout", event => {
    if (!event.relatedTarget) hideCustomCursor();
  });
  window.addEventListener("blur", hideCustomCursor);
})();
