/* Dismiss: any [data-ds-alert-dismiss] inside .ds-alert removes it and moves focus to the next control on the page. */
(() => {
  const FOCUSABLE = "a[href], button:not(:disabled), input:not(:disabled), textarea:not(:disabled), [tabindex='0']";

  const nextFocusable = (alert) => [...document.querySelectorAll(FOCUSABLE)]
    .find((node) => !alert.contains(node) && (alert.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_FOLLOWING));

  document.addEventListener("click", (event) => {
    const dismiss = event.target.closest("[data-ds-alert-dismiss]");
    if (!dismiss) return;
    const alert = dismiss.closest(".ds-alert");
    if (!alert) throw new Error("alert: data-ds-alert-dismiss must sit inside .ds-alert");
    nextFocusable(alert)?.focus();
    alert.setAttribute("data-leaving", "");
    alert.addEventListener("animationend", () => alert.remove(), { once: true });
  });
})();
