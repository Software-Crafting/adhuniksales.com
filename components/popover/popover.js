/* Positions [popover][data-ds-floating="side-align"] (side: top, right, bottom, left; align: start, center, end)
   next to its trigger: the button with popovertarget, or the element named by data-ds-anchor. Flips when it does
   not fit and stays inside the viewport. Other components call DS.position(floating, anchorElementOrRect, placement). */
(() => {
  const GAP = 6;
  const EDGE = 8;
  const opposite = { top: "bottom", bottom: "top", left: "right", right: "left" };

  const coordinates = (side, align, anchor, width, height) => {
    const vertical = side === "top" || side === "bottom";
    let top = side === "top" ? anchor.top - height - GAP : side === "bottom" ? anchor.bottom + GAP : 0;
    let left = side === "left" ? anchor.left - width - GAP : side === "right" ? anchor.right + GAP : 0;
    if (vertical) left = align === "end" ? anchor.right - width : align === "center" ? anchor.left + (anchor.width - width) / 2 : anchor.left;
    else top = align === "end" ? anchor.bottom - height : align === "center" ? anchor.top + (anchor.height - height) / 2 : anchor.top;
    return { top, left };
  };
  const fits = ({ top, left }, width, height) => top >= EDGE && left >= EDGE && top + height <= innerHeight - EDGE && left + width <= innerWidth - EDGE;

  function position(floating, anchor, placement = "bottom-start") {
    if (floating.hasAttribute("data-ds-sheet-phone") && matchMedia("(max-width: 639px)").matches) return;
    const rect = anchor instanceof Element ? anchor.getBoundingClientRect() : anchor;
    const [side, align = "center"] = placement.split("-");
    const { offsetWidth: width, offsetHeight: height } = floating; // layout size, unaffected by the entrance scale
    let spot = coordinates(side, align, rect, width, height);
    if (!fits(spot, width, height)) {
      const flipped = coordinates(opposite[side], align, rect, width, height);
      if (fits(flipped, width, height)) spot = flipped;
    }
    const finalSide = spot.top >= rect.bottom ? "bottom" : spot.top + height <= rect.top ? "top" : spot.left >= rect.right ? "right" : "left";
    const vertical = finalSide === "top" || finalSide === "bottom";
    const across = align === "end" ? (vertical ? "right" : "bottom") : align === "center" ? "center" : (vertical ? "left" : "top");
    floating.style.setProperty("--ds-origin", vertical ? `${across} ${opposite[finalSide]}` : `${opposite[finalSide]} ${across}`);
    floating.style.left = `${Math.max(EDGE, Math.min(spot.left, innerWidth - width - EDGE))}px`;
    floating.style.top = `${Math.max(EDGE, Math.min(spot.top, innerHeight - height - EDGE))}px`;
  }

  const anchorOf = (floating) => {
    const id = floating.dataset.dsAnchor;
    return id ? document.getElementById(id) : document.querySelector(`[popovertarget="${CSS.escape(floating.id)}"]`);
  };
  const place = (floating) => {
    const anchor = anchorOf(floating);
    if (anchor) position(floating, anchor, floating.dataset.dsFloating || undefined);
  };

  document.addEventListener("toggle", (event) => {
    if (event.newState === "open" && event.target.matches?.("[popover][data-ds-floating]")) place(event.target);
  }, true);
  const repositionOpen = () => document.querySelectorAll("[popover][data-ds-floating]:popover-open").forEach((floating) => {
    if (!floating.hasAttribute("data-ds-fixed-point")) place(floating);
  });
  addEventListener("resize", repositionOpen);
  addEventListener("scroll", repositionOpen, true);

  window.DS = window.DS || {};
  window.DS.position = position;
})();
