/* Tabs: [data-ds-tabs] with role=tablist, role=tab buttons (aria-controls) and role=tabpanel panels.
   Arrows, Home and End move and select. Add data-ds-tabs-hash to select the tab whose panel id is in the URL hash. */
(() => {
  const tabsOf = (root) => [...root.querySelectorAll(":scope [role=tab]")].filter((tab) => tab.closest("[data-ds-tabs]") === root);

  const select = (root, tab, { focus = false, hash = false } = {}) => {
    for (const other of tabsOf(root)) {
      const selected = other === tab;
      other.setAttribute("aria-selected", String(selected));
      other.tabIndex = selected ? 0 : -1;
      const panel = document.getElementById(other.getAttribute("aria-controls"));
      if (!panel) throw new Error(`tabs: no panel with id "${other.getAttribute("aria-controls")}"`);
      panel.hidden = !selected;
    }
    if (focus) tab.focus();
    tab.scrollIntoView({ block: "nearest", inline: "nearest" });
    if (hash && root.hasAttribute("data-ds-tabs-hash")) history.replaceState(null, "", `#${tab.getAttribute("aria-controls")}`);
  };

  document.addEventListener("click", (event) => {
    const tab = event.target.closest("[data-ds-tabs] [role=tab]");
    if (tab && !tab.disabled) select(tab.closest("[data-ds-tabs]"), tab, { hash: true });
  });

  document.addEventListener("keydown", (event) => {
    const tab = event.target.closest("[data-ds-tabs] [role=tab]");
    if (!tab) return;
    const root = tab.closest("[data-ds-tabs]");
    const tabs = tabsOf(root).filter((item) => !item.disabled);
    const index = tabs.indexOf(tab);
    const vertical = tab.closest("[role=tablist]").getAttribute("aria-orientation") === "vertical";
    const keys = { [vertical ? "ArrowDown" : "ArrowRight"]: index + 1, [vertical ? "ArrowUp" : "ArrowLeft"]: index - 1, Home: 0, End: tabs.length - 1 };
    if (!(event.key in keys)) return;
    event.preventDefault();
    select(root, tabs[(keys[event.key] + tabs.length) % tabs.length], { focus: true, hash: true });
  });

  for (const root of document.querySelectorAll("[data-ds-tabs]")) {
    const fromHash = root.hasAttribute("data-ds-tabs-hash") && location.hash && tabsOf(root).find((tab) => `#${tab.getAttribute("aria-controls")}` === location.hash);
    select(root, fromHash || tabsOf(root).find((tab) => tab.getAttribute("aria-selected") === "true") || tabsOf(root)[0]);
  }
})();
