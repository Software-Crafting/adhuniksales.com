/* Tooltip: add data-ds-tooltip="Text" (and optionally data-ds-tooltip-side="top|right|bottom|left") to any focusable
   element. Shows after a short delay on hover, at once on keyboard focus, hides on leave, blur or Esc.
   Never put essential information in a tooltip: touch screens do not show it. Needs popover.js. */
(() => {
  if (!window.DS?.position) throw new Error("tooltip: load popover.js before tooltip.js");
  const DELAY_MS = 500;
  const tip = document.createElement("div");
  tip.className = "ds-tooltip";
  tip.id = "ds-tooltip";
  tip.setAttribute("role", "tooltip");
  tip.setAttribute("popover", "manual");
  tip.setAttribute("data-ds-floating", "top-center");
  document.body.append(tip);

  let current = null;
  let timer;
  let warmUntil = 0;

  const show = (trigger) => {
    clearTimeout(timer);
    current = trigger;
    tip.textContent = trigger.dataset.dsTooltip;
    if (!tip.matches(":popover-open")) tip.showPopover();
    window.DS.position(tip, trigger, `${trigger.dataset.dsTooltipSide || "top"}-center`);
    if (trigger.getAttribute("aria-label") !== trigger.dataset.dsTooltip) trigger.setAttribute("aria-describedby", tip.id);
  };
  const hide = () => {
    clearTimeout(timer);
    if (current?.getAttribute("aria-describedby") === tip.id) current.removeAttribute("aria-describedby");
    if (current) warmUntil = Date.now() + 300;
    current = null;
    if (tip.matches(":popover-open")) tip.hidePopover();
  };

  document.addEventListener("pointerover", (event) => {
    if (event.pointerType === "touch") return;
    const trigger = event.target.closest("[data-ds-tooltip]");
    if (!trigger || trigger === current) return;
    clearTimeout(timer);
    timer = setTimeout(() => show(trigger), Date.now() < warmUntil ? 0 : DELAY_MS);
  });
  document.addEventListener("pointerout", (event) => {
    const trigger = event.target.closest("[data-ds-tooltip]");
    if (trigger && !trigger.contains(event.relatedTarget)) hide();
  });
  document.addEventListener("focusin", (event) => {
    const trigger = event.target.closest("[data-ds-tooltip]");
    if (trigger && trigger.matches(":focus-visible")) show(trigger);
  });
  document.addEventListener("focusout", (event) => { if (event.target.closest("[data-ds-tooltip]")) hide(); });
  document.addEventListener("keydown", (event) => { if (event.key === "Escape" && current) hide(); });
  document.addEventListener("pointerdown", hide);
})();
