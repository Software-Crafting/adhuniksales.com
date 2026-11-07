/* window.DS.toast({ message, tone, action: { label, onClick } }). Tones: neutral (default, dark), success, info, warning, danger (tinted).
   Toasts dismiss on their own, pause while hovered or focused, and return focus to where it was when removed.
   window.DS.toast.promise(promise, { loading, success, error }) shows one toast with a spinner that stays while the
   promise runs, then turns into a success or danger toast. success and error may be functions of the result or reason.
   The polite live region announces each message. Returns the promise. Needs spinner.css. */
(() => {
  const ICONS = { success: "check-circle", info: "info", warning: "alert-triangle", danger: "alert-circle" };
  const DURATION = 5000;
  const DURATION_WITH_ACTION = 8000;

  const region = document.createElement("div");
  region.className = "ds-toaster";
  region.setAttribute("role", "status");
  region.setAttribute("aria-live", "polite");
  region.setAttribute("aria-atomic", "false");
  region.setAttribute("aria-label", "Notifications");
  document.body.append(region);

  const icon = (name, className) => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    svg.setAttribute("class", className);
    svg.setAttribute("aria-hidden", "true");
    use.setAttribute("href", `#i-${name}`);
    svg.append(use);
    return svg;
  };
  const spinner = () => {
    const node = document.createElement("span");
    node.className = "ds-spinner ds-spinner--sm";
    node.setAttribute("aria-hidden", "true");
    return node;
  };

  const button = (className, onClick) => {
    const node = document.createElement("button");
    node.type = "button";
    node.className = className;
    node.addEventListener("click", onClick);
    return node;
  };
  const toneClass = (tone) => (tone === "neutral" ? "ds-toast" : `ds-toast ds-toast--${tone}`);

  const show = ({ message, tone = "neutral", action, pending = false }) => {
    if (!message) throw new Error("toast: message is required");
    if (tone !== "neutral" && !ICONS[tone]) throw new Error(`toast: unknown tone "${tone}"`);
    if (action && (!action.label || typeof action.onClick !== "function")) throw new Error("toast: action needs label and onClick");

    const returnFocus = document.activeElement;
    const node = document.createElement("div");
    node.className = toneClass(tone);
    let remaining = action ? DURATION_WITH_ACTION : DURATION;
    let startedAt = 0;
    let timer = 0;
    let waiting = pending;

    const dismiss = () => {
      clearTimeout(timer);
      if (node.dataset.leaving !== undefined) return;
      node.dataset.leaving = "";
      if (node.contains(document.activeElement)) returnFocus?.focus?.();
      node.addEventListener("animationend", () => node.remove(), { once: true });
    };
    const resume = () => {
      if (waiting || node.matches(":hover, :focus-within")) return;
      startedAt = Date.now();
      clearTimeout(timer);
      timer = setTimeout(dismiss, remaining);
    };
    const pause = () => {
      if (!timer) return;
      clearTimeout(timer);
      timer = 0;
      remaining -= Date.now() - startedAt;
    };

    if (pending) node.append(spinner());
    else if (ICONS[tone]) node.append(icon(ICONS[tone], "ds-icon"));
    const text = document.createElement("p");
    text.className = "ds-toast__message";
    text.textContent = message;
    node.append(text);
    if (action) {
      const actionButton = button("ds-toast__action", () => { action.onClick(); dismiss(); });
      actionButton.textContent = action.label;
      node.append(actionButton);
    }
    const close = button("ds-toast__close", dismiss);
    close.setAttribute("aria-label", "Dismiss");
    close.append(icon("x", "ds-icon ds-icon--sm"));
    node.append(close);

    node.addEventListener("pointerenter", pause);
    node.addEventListener("pointerleave", () => requestAnimationFrame(resume));
    node.addEventListener("focusin", pause);
    node.addEventListener("focusout", () => requestAnimationFrame(resume));
    node.addEventListener("keydown", (event) => { if (event.key === "Escape") dismiss(); });

    /* A pending toast settles in place: same node, new tone, icon and message, then its timer starts */
    const settle = (nextMessage, nextTone) => {
      waiting = false;
      node.className = toneClass(nextTone);
      node.querySelector(".ds-spinner").replaceWith(icon(ICONS[nextTone], "ds-icon"));
      text.textContent = nextMessage;
      resume();
    };

    region.append(node);
    resume();
    return { dismiss, settle };
  };

  const toast = ({ message, tone, action } = {}) => {
    const { dismiss } = show({ message, tone, action });
    return { dismiss };
  };

  toast.promise = (promise, { loading, success, error } = {}) => {
    if (typeof promise?.then !== "function") throw new Error("toast.promise: first argument must be a promise");
    if (!loading || !success || !error) throw new Error("toast.promise: needs loading, success and error messages");
    const { settle } = show({ message: loading, pending: true });
    const text = (message, value) => (typeof message === "function" ? message(value) : message);
    promise.then((value) => settle(text(success, value), "success"), (reason) => settle(text(error, reason), "danger"));
    return promise;
  };

  window.DS = window.DS || {};
  window.DS.toast = toast;
})();
