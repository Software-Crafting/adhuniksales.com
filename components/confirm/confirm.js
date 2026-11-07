/* Consent before an action. Put data-ds-confirm="Delete this file?" on any button or link. Optional:
   data-ds-confirm-body (one line on what happens), data-ds-confirm-action (confirm label, default the element's text)
   and data-ds-confirm-tone="danger" for destructive actions. The click is held, a dialog asks, and only Confirm
   lets the original click through, so the action's own handlers, links and form submits run unchanged.
   Cancel has focus, Esc cancels, focus returns to the element. Needs dialog.css and button.css. */
(() => {
  const confirmed = new WeakSet();
  let dialog;

  const build = () => {
    dialog = document.createElement("dialog");
    dialog.className = "ds-dialog ds-confirm";
    dialog.setAttribute("role", "alertdialog");
    dialog.setAttribute("aria-labelledby", "ds-confirm-title");
    dialog.setAttribute("aria-describedby", "ds-confirm-body");
    dialog.setAttribute("data-ds-dialog-modal", "");
    dialog.innerHTML = `<form method="dialog">
      <div class="ds-dialog__head"><div><h2 class="ds-dialog__title" id="ds-confirm-title"></h2><p class="ds-dialog__desc" id="ds-confirm-body"></p></div></div>
      <div class="ds-dialog__foot"><button class="ds-btn ds-btn--secondary" value="cancel" autofocus>Cancel</button><button class="ds-btn" value="confirm"></button></div>
    </form>`;
    document.body.append(dialog);
  };

  const ask = (trigger) => {
    if (!dialog) build();
    const { dsConfirm, dsConfirmBody = "", dsConfirmAction, dsConfirmTone } = trigger.dataset;
    dialog.querySelector(".ds-dialog__title").textContent = dsConfirm;
    const body = dialog.querySelector(".ds-dialog__desc");
    body.textContent = dsConfirmBody;
    body.hidden = !dsConfirmBody;
    const yes = dialog.querySelector('[value="confirm"]');
    yes.textContent = dsConfirmAction || trigger.textContent.trim() || "Confirm";
    yes.className = `ds-btn ${dsConfirmTone === "danger" ? "ds-btn--danger" : "ds-btn--primary"}`;
    dialog.returnValue = "";
    dialog.addEventListener("close", () => {
      if (dialog.returnValue !== "confirm") return;
      confirmed.add(trigger);
      trigger.click();
    }, { once: true });
    dialog.showModal();
  };

  // Capture runs before every other click handler, so nothing acts until the person agrees
  document.addEventListener("click", (event) => {
    const trigger = event.target.closest?.("[data-ds-confirm]");
    if (!trigger || trigger.disabled || trigger.getAttribute("aria-disabled") === "true") return;
    if (confirmed.has(trigger)) {
      confirmed.delete(trigger);
      return;
    }
    event.preventDefault();
    event.stopImmediatePropagation();
    ask(trigger);
  }, true);
})();
