/* Overlay scrollbars for .ds-scroll-area[data-ds-scroll-area] > .ds-scroll. Native scrolling, keyboard and
   touch stay untouched; this only draws the bars, shows them while in use and lets the thumb be dragged.
   The scrolling element can be any block or a textarea. Areas added to the page later are picked up too. */
(() => {
  if (window.DS?.scrollArea) return;
  const IDLE_MS = 700;

  const makeBar = (axis) => {
    const bar = document.createElement("div");
    bar.className = `ds-scroll-area__bar ds-scroll-area__bar--${axis}`;
    bar.setAttribute("aria-hidden", "true");
    bar.append(Object.assign(document.createElement("div"), { className: "ds-scroll-area__thumb" }));
    return bar;
  };

  const enhance = (area) => {
    const viewport = area.querySelector(":scope > .ds-scroll");
    if (!viewport) throw new Error("scroll-area: [data-ds-scroll-area] needs a direct .ds-scroll child");
    const bars = { y: makeBar("y"), x: makeBar("x") };
    area.append(bars.y, bars.x);
    let idleTimer;
    let hovering = false;

    const layout = () => {
      const { clientHeight, scrollHeight, clientWidth, scrollWidth, scrollTop, scrollLeft } = viewport;
      const sides = [
        ["y", clientHeight, scrollHeight, scrollTop, "height", "translateY"],
        ["x", clientWidth, scrollWidth, scrollLeft, "width", "translateX"],
      ];
      for (const [axis, client, total, offset, size, move] of sides) {
        const bar = bars[axis];
        bar.hidden = total <= client + 1;
        if (bar.hidden) continue;
        const track = (axis === "y" ? bar.clientHeight : bar.clientWidth) - 4;
        const thumbSize = Math.max(24, (client / total) * track);
        const thumb = bar.firstElementChild;
        thumb.style[size] = `${thumbSize}px`;
        thumb.style.transform = `${move}(${(offset / (total - client)) * (track - thumbSize)}px)`;
      }
      bars.x.style.right = bars.y.hidden ? "0" : "10px";
    };

    const show = () => {
      area.setAttribute("data-active", "");
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        if (!hovering && !area.hasAttribute("data-dragging")) area.removeAttribute("data-active");
      }, IDLE_MS);
    };

    const drag = (axis) => (event) => {
      if (event.button !== 0) return;
      event.preventDefault();
      const bar = bars[axis];
      const thumb = bar.firstElementChild;
      const vertical = axis === "y";
      const thumbRect = thumb.getBoundingClientRect();
      const barRect = bar.getBoundingClientRect();
      const range = (vertical ? barRect.height - thumbRect.height : barRect.width - thumbRect.width) - 4;
      const scrollRange = vertical ? viewport.scrollHeight - viewport.clientHeight : viewport.scrollWidth - viewport.clientWidth;
      const onThumb = thumb.contains(event.target);
      if (!onThumb) {
        // Track click: centre the thumb on the pointer, then keep dragging from there.
        const along = (vertical ? event.clientY - barRect.top : event.clientX - barRect.left) - (vertical ? thumbRect.height : thumbRect.width) / 2;
        viewport[vertical ? "scrollTop" : "scrollLeft"] = (along / range) * scrollRange;
      }
      const startPointer = vertical ? event.clientY : event.clientX;
      const startScroll = viewport[vertical ? "scrollTop" : "scrollLeft"];
      area.setAttribute("data-dragging", "");
      bar.setPointerCapture(event.pointerId);
      const move = (moveEvent) => {
        const delta = (vertical ? moveEvent.clientY : moveEvent.clientX) - startPointer;
        viewport[vertical ? "scrollTop" : "scrollLeft"] = startScroll + (delta / range) * scrollRange;
      };
      const end = () => {
        area.removeAttribute("data-dragging");
        bar.removeEventListener("pointermove", move);
        show();
      };
      bar.addEventListener("pointermove", move);
      bar.addEventListener("pointerup", end, { once: true });
      bar.addEventListener("pointercancel", end, { once: true });
    };

    bars.y.addEventListener("pointerdown", drag("y"));
    bars.x.addEventListener("pointerdown", drag("x"));
    viewport.addEventListener("scroll", () => { layout(); show(); }, { passive: true });
    viewport.addEventListener("focus", show);
    if (viewport.matches("textarea")) viewport.addEventListener("input", layout);
    area.addEventListener("pointerenter", () => { hovering = true; layout(); show(); });
    area.addEventListener("pointerleave", () => { hovering = false; show(); });
    const observer = new ResizeObserver(layout);
    observer.observe(viewport);
    for (const child of viewport.children) observer.observe(child);
    area.setAttribute("data-ready", "");
    layout();
  };

  const init = () => document.querySelectorAll("[data-ds-scroll-area]:not([data-ready])").forEach(enhance);
  window.DS = window.DS || {};
  window.DS.scrollArea = { init };
  init();
  new MutationObserver((records) => {
    if (records.some((record) => record.addedNodes.length)) init();
  }).observe(document.documentElement, { childList: true, subtree: true });
})();
