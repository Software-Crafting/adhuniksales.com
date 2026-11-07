/* Ripple from the press point (pointer) or the centre (Enter or Space) on .ds-btn and [data-ds-ripple] hosts.
   Disabled, busy and read-only hosts, and labels around a disabled input, do not ripple. */
(() => {
  const HOSTS = ".ds-btn, [data-ds-ripple]";
  const inactive = (host) => host.disabled
    || host.matches('[aria-disabled="true"], [aria-busy="true"], [aria-readonly="true"]')
    || host.querySelector(":scope > input:disabled") !== null;

  const layerOf = (host) => {
    let layer = host.querySelector(":scope > .ds-ripple");
    if (!layer) {
      if (getComputedStyle(host).position === "static") host.style.position = "relative";
      layer = document.createElement("span");
      layer.className = "ds-ripple";
      layer.setAttribute("aria-hidden", "true");
      host.append(layer);
    }
    return layer;
  };

  const ripple = (host, x, y) => {
    if (inactive(host)) return;
    const { width, height } = host.getBoundingClientRect();
    const wave = document.createElement("span");
    wave.className = "ds-ripple__wave";
    wave.style.setProperty("--ds-ripple-x", `${x}px`);
    wave.style.setProperty("--ds-ripple-y", `${y}px`);
    wave.style.setProperty("--ds-ripple-size", `${2 * Math.hypot(Math.max(x, width - x), Math.max(y, height - y))}px`);
    wave.addEventListener("animationend", () => wave.remove(), { once: true });
    layerOf(host).append(wave);
  };

  document.addEventListener("pointerdown", (event) => {
    const host = event.target.closest(HOSTS);
    if (!host || event.button !== 0) return;
    const rect = host.getBoundingClientRect();
    ripple(host, event.clientX - rect.left, event.clientY - rect.top);
  }, { passive: true });

  document.addEventListener("keydown", (event) => {
    const host = event.target.closest?.(HOSTS);
    if (!host || event.repeat || (event.key !== "Enter" && event.key !== " ")) return;
    ripple(host, host.offsetWidth / 2, host.offsetHeight / 2);
  });
})();
