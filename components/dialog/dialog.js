/* Open: <button data-ds-dialog-open="id">. Close: any [data-ds-dialog-close] inside. Backdrop click closes,
   except on <dialog data-ds-dialog-modal>, used for destructive confirmations.
   Busy submit: window.DS.dialog.busy(button, true) gives the button its spinner and focus, disables the dialog's other
   buttons, and stops Esc, the backdrop and repeat clicks from acting until busy(button, false). */
(() => {
  const BUSY = "dialog[data-ds-dialog-busy]";

  const busy = (button, on) => {
    const dialog = button.closest("dialog");
    if (!dialog) throw new Error("dialog: busy needs a button inside a dialog");
    dialog.toggleAttribute("data-ds-dialog-busy", on);
    if (on) button.setAttribute("aria-busy", "true");
    else button.removeAttribute("aria-busy");
    for (const other of dialog.querySelectorAll("button")) {
      if (other === button) continue;
      if (on && !other.disabled) { other.disabled = true; other.setAttribute("data-ds-dialog-held", ""); }
      if (!on && other.hasAttribute("data-ds-dialog-held")) { other.disabled = false; other.removeAttribute("data-ds-dialog-held"); }
    }
    if (on) button.focus();
  };

  /* While busy nothing inside acts: capture runs before any other click handler, and blocks form submission too */
  document.addEventListener("click", (event) => {
    if (!event.target.closest(BUSY)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
  }, true);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && event.target.closest?.(BUSY)) event.preventDefault();
  });
  document.addEventListener("cancel", (event) => { if (event.target.matches?.(BUSY)) event.preventDefault(); }, true);

  document.addEventListener("click", (event) => {
    const opener = event.target.closest("[data-ds-dialog-open]");
    if (opener) {
      const dialog = document.getElementById(opener.dataset.dsDialogOpen);
      if (!dialog) throw new Error(`dialog: no element with id "${opener.dataset.dsDialogOpen}"`);
      dialog.showModal();
      return;
    }
    const closer = event.target.closest("[data-ds-dialog-close]");
    if (closer) {
      closer.closest("dialog").close();
      return;
    }
    const isBackdrop = event.target.matches("dialog.ds-dialog") && !event.target.hasAttribute("data-ds-dialog-modal");
    if (isBackdrop) event.target.close();
  });

  window.DS = window.DS || {};
  window.DS.dialog = { busy };
})();
