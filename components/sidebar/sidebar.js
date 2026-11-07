/* Sidebar: aside.ds-sidebar[data-ds-sidebar][id]. [data-ds-sidebar-open="<id>"] opens it off-canvas below 1024px,
   [data-ds-sidebar-close] closes it, [data-ds-sidebar-collapse] toggles the icon rail from 1024px.
   Off-canvas: a scrim, Esc and focus return; links close it after navigating. */
(() => {
  const opener = new WeakMap();

  const open = (sidebar, button) => {
    opener.set(sidebar, button);
    sidebar.setAttribute("data-open", "");
    button?.setAttribute("aria-expanded", "true");
    const scrim = Object.assign(document.createElement("div"), { className: "ds-sidebar__scrim" });
    scrim.setAttribute("data-ds-sidebar-close", "");
    sidebar.after(scrim);
    [...sidebar.querySelectorAll("a, button, summary")].find((node) => node.checkVisibility())?.focus();
  };
  const close = (sidebar) => {
    if (!sidebar.hasAttribute("data-open")) return;
    sidebar.removeAttribute("data-open");
    sidebar.nextElementSibling?.matches(".ds-sidebar__scrim") && sidebar.nextElementSibling.remove();
    const button = opener.get(sidebar);
    button?.setAttribute("aria-expanded", "false");
    button?.focus();
  };
  const sidebarFor = (node) => {
    const sidebar = node.dataset.dsSidebarOpen ? document.getElementById(node.dataset.dsSidebarOpen) : node.closest("[data-ds-sidebar]") ?? node.previousElementSibling;
    if (!sidebar?.matches("[data-ds-sidebar]")) throw new Error("sidebar: control is not linked to a [data-ds-sidebar]");
    return sidebar;
  };

  document.addEventListener("click", (event) => {
    const openButton = event.target.closest("[data-ds-sidebar-open]");
    if (openButton) return open(sidebarFor(openButton), openButton);
    const closeButton = event.target.closest("[data-ds-sidebar-close]");
    if (closeButton) return close(sidebarFor(closeButton));
    const collapse = event.target.closest("[data-ds-sidebar-collapse]");
    if (collapse) {
      const sidebar = sidebarFor(collapse);
      const collapsed = sidebar.toggleAttribute("data-collapsed");
      collapse.setAttribute("aria-expanded", String(!collapsed));
      sidebar.querySelectorAll(".ds-sidebar__link").forEach((link) => {
        if (collapsed) link.setAttribute("data-ds-tooltip", link.querySelector(".ds-sidebar__text")?.textContent.trim() ?? "");
        else link.removeAttribute("data-ds-tooltip");
      });
      return;
    }
    const link = event.target.closest("[data-ds-sidebar][data-open] a");
    if (link) close(link.closest("[data-ds-sidebar]"));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    document.querySelectorAll("[data-ds-sidebar][data-open]").forEach(close);
  });
})();
