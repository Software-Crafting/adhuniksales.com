/* Password reveal: <button data-ds-input-reveal>. Search clear: <button data-ds-input-clear>. Both inside .ds-input. */
(() => {
  const controlOf = (button) => {
    const control = button.closest(".ds-input")?.querySelector(".ds-input__control");
    if (!control) throw new Error("input: action button needs a .ds-input__control in the same .ds-input");
    return control;
  };

  const toggleReveal = (button) => {
    const control = controlOf(button);
    const revealed = control.type === "password";
    control.type = revealed ? "text" : "password";
    button.setAttribute("aria-pressed", String(revealed));
    button.querySelector("use").setAttribute("href", revealed ? "#i-eye-off" : "#i-eye");
  };

  const clear = (button) => {
    const control = controlOf(button);
    control.value = "";
    control.dispatchEvent(new Event("input", { bubbles: true }));
    control.focus();
  };

  document.addEventListener("click", (event) => {
    const reveal = event.target.closest("[data-ds-input-reveal]");
    if (reveal) return toggleReveal(reveal);
    const clearButton = event.target.closest("[data-ds-input-clear]");
    if (clearButton) clear(clearButton);
  });
})();
