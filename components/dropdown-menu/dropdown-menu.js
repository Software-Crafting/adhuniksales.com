/* Menu behaviour for every .ds-menu[popover] (dropdown, context menu, menubar). Opening focuses the first item;
   arrows, Home, End and typeahead move; Enter or Space activates; a submenu opens with Right Arrow and closes with
   Left Arrow. Checkbox and radio items toggle aria-checked and keep the menu open. The trigger's aria-expanded
   follows the menu. Items with data-ds-confirm (components/confirm) close the menu and return focus to the trigger
   before the confirm dialog asks. Needs popover.js. */
(() => {
  if (!window.DS?.position) throw new Error("dropdown-menu: load popover.js before dropdown-menu.js");
  let typed = "";
  let typedTimer;

  const items = (menu) => [...menu.querySelectorAll(":scope > .ds-menu__item, :scope > [role=group] > .ds-menu__item")]
    .filter((item) => !item.disabled && item.getAttribute("aria-disabled") !== "true");
  const closeAll = () => document.querySelectorAll(".ds-menu:popover-open").forEach((menu) => menu.hidePopover());
  const invokerOf = (menu) => document.querySelector(`[popovertarget="${CSS.escape(menu.id)}"]`);
  const rootTrigger = (menu) => {
    let invoker = invokerOf(menu);
    while (invoker?.classList.contains("ds-menu__item")) invoker = invokerOf(invoker.closest(".ds-menu"));
    return invoker;
  };

  const openSub = (item, focusFirst) => {
    const sub = document.getElementById(item.getAttribute("popovertarget"));
    if (!sub.matches(":popover-open")) sub.showPopover();
    window.DS.position(sub, item, "right-start");
    item.setAttribute("aria-expanded", "true");
    if (focusFirst) items(sub)[0]?.focus();
  };

  document.addEventListener("toggle", (event) => {
    const menu = event.target;
    if (!menu.matches?.(".ds-menu")) return;
    const invoker = invokerOf(menu);
    invoker?.setAttribute("aria-expanded", String(event.newState === "open"));
    if (event.newState !== "open") return;
    if (invoker) menu.style.setProperty("--ds-menu-anchor-width", `${invoker.getBoundingClientRect().width}px`);
    if (!invoker?.classList.contains("ds-menu__item")) items(menu)[0]?.focus();
  }, true);

  /* Window capture runs before confirm.js (document capture), so the menu is gone and focus is on the trigger when
     the dialog opens, and the dialog gives focus back to the trigger on Cancel */
  addEventListener("click", (event) => {
    const item = event.target.closest?.(".ds-menu .ds-menu__item[data-ds-confirm]");
    if (!item) return;
    const trigger = rootTrigger(item.closest(".ds-menu"));
    closeAll();
    trigger?.focus();
  }, true);

  document.addEventListener("click", (event) => {
    const item = event.target.closest(".ds-menu .ds-menu__item");
    if (!item) return;
    if (item.getAttribute("aria-haspopup") === "menu") {
      event.preventDefault();
      return openSub(item, event.detail === 0);
    }
    const role = item.getAttribute("role");
    if (role === "menuitemcheckbox") return item.setAttribute("aria-checked", String(item.getAttribute("aria-checked") !== "true"));
    if (role === "menuitemradio") {
      item.closest("[role=group]")?.querySelectorAll("[role=menuitemradio]").forEach((radio) => radio.setAttribute("aria-checked", "false"));
      return item.setAttribute("aria-checked", "true");
    }
    closeAll();
  });

  document.addEventListener("pointerover", (event) => {
    const item = event.target.closest(".ds-menu .ds-menu__item");
    if (!item) return;
    const menu = item.closest(".ds-menu");
    menu.querySelectorAll(":scope .ds-menu__item[aria-expanded=true]").forEach((open) => {
      if (open !== item && open.closest(".ds-menu") === menu) document.getElementById(open.getAttribute("popovertarget"))?.hidePopover();
    });
    if (item.getAttribute("aria-haspopup") === "menu") openSub(item, false);
  });

  document.addEventListener("keydown", (event) => {
    const menu = event.target.closest(".ds-menu");
    if (!menu) return;
    const list = items(menu);
    const index = list.indexOf(event.target.closest(".ds-menu__item"));
    const moves = { ArrowDown: index + 1, ArrowUp: index - 1, Home: 0, End: list.length - 1 };
    if (event.key in moves) {
      event.preventDefault();
      list[(moves[event.key] + list.length) % list.length]?.focus();
    } else if (event.key === "ArrowRight" && event.target.getAttribute("aria-haspopup") === "menu") {
      event.preventDefault();
      openSub(event.target, true);
    } else if (event.key === "ArrowLeft") {
      const parentItem = document.querySelector(`[popovertarget="${CSS.escape(menu.id)}"].ds-menu__item`);
      if (!parentItem) return;
      event.preventDefault();
      menu.hidePopover();
      parentItem.focus();
    } else if (event.key === "Tab") {
      closeAll();
    } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && event.key !== " ") {
      clearTimeout(typedTimer);
      typed += event.key.toLowerCase();
      typedTimer = setTimeout(() => { typed = ""; }, 500);
      list.find((item) => item.textContent.trim().toLowerCase().startsWith(typed))?.focus();
    }
  });
})();
