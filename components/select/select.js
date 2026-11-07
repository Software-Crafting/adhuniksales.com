/* Custom select. Markup: .ds-select[data-ds-select] > button.ds-select__trigger, .ds-select__popup > [role=listbox],
   input[type=hidden]. Keyboard follows the WAI-ARIA select-only combobox pattern.
   Read only: aria-readonly="true" on the trigger keeps the list shut.
   Loading: set aria-busy="true" on the listbox, fill it, then set aria-busy="false". A [role=status] in the root
   announces the .ds-select__loading text, then the option count. */
(() => {
  let typed = "";
  let typedTimer;

  const parts = (root) => {
    const trigger = root.querySelector(".ds-select__trigger");
    const popup = root.querySelector(".ds-select__popup");
    const list = root.querySelector("[role=listbox]");
    const input = root.querySelector("input[type=hidden]");
    if (!trigger || !popup || !list || !input) throw new Error("select: needs a trigger, popup, listbox and hidden input");
    return { trigger, popup, list, input, value: root.querySelector(".ds-select__value"), status: root.querySelector("[role=status]") };
  };
  const options = (list) => [...list.querySelectorAll("[role=option]:not([aria-disabled=true])")];
  const active = (list) => list.querySelector("[role=option][data-active]");

  const setActive = (list, option) => {
    active(list)?.removeAttribute("data-active");
    if (!option) return list.removeAttribute("aria-activedescendant");
    option.setAttribute("data-active", "");
    list.setAttribute("aria-activedescendant", option.id);
    option.scrollIntoView({ block: "nearest" });
  };

  const busy = (list) => list.getAttribute("aria-busy") === "true";
  const announce = (root) => {
    const { list, status } = parts(root);
    const count = options(list).length;
    if (status) status.textContent = busy(list) ? root.querySelector(".ds-select__loading")?.textContent.trim() || "Loading" : `${count} ${count === 1 ? "option" : "options"}`;
  };

  const open = (root, focusLast = false) => {
    const { trigger, popup, list } = parts(root);
    if (trigger.getAttribute("aria-readonly") === "true") return;
    document.querySelectorAll("[data-ds-select] .ds-select__trigger[aria-expanded=true]").forEach((other) => other !== trigger && close(other.closest("[data-ds-select]")));
    popup.hidden = false;
    trigger.setAttribute("aria-expanded", "true");
    const below = window.innerHeight - trigger.getBoundingClientRect().bottom;
    popup.dataset.side = below < popup.offsetHeight + 8 && trigger.getBoundingClientRect().top > below ? "top" : "bottom";
    const all = options(list);
    setActive(list, list.querySelector("[aria-selected=true]") ?? (focusLast ? all.at(-1) : all[0]));
    list.focus();
    if (busy(list)) announce(root);
  };

  const close = (root, refocus = false) => {
    const { trigger, popup } = parts(root);
    popup.hidden = true;
    trigger.setAttribute("aria-expanded", "false");
    if (refocus) trigger.focus();
  };

  const choose = (root, option) => {
    const { list, input, value } = parts(root);
    list.querySelectorAll("[aria-selected=true]").forEach((item) => item.setAttribute("aria-selected", "false"));
    option.setAttribute("aria-selected", "true");
    input.value = option.dataset.value;
    value.textContent = option.firstElementChild.textContent;
    value.removeAttribute("data-placeholder");
    input.dispatchEvent(new Event("change", { bubbles: true }));
    close(root, true);
  };

  const typeahead = (list, key) => {
    clearTimeout(typedTimer);
    typed += key.toLowerCase();
    typedTimer = setTimeout(() => { typed = ""; }, 500);
    const match = options(list).find((option) => option.textContent.trim().toLowerCase().startsWith(typed));
    if (match) setActive(list, match);
  };

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-ds-select] .ds-select__trigger");
    if (trigger) {
      const root = trigger.closest("[data-ds-select]");
      return trigger.getAttribute("aria-expanded") === "true" ? close(root, true) : open(root);
    }
    const option = event.target.closest("[data-ds-select] [role=option]");
    if (option && option.getAttribute("aria-disabled") !== "true") return choose(option.closest("[data-ds-select]"), option);
    document.querySelectorAll("[data-ds-select]").forEach((root) => { if (!root.contains(event.target)) close(root); });
  });

  document.addEventListener("pointermove", (event) => {
    const option = event.target.closest("[data-ds-select] [role=option]:not([aria-disabled=true])");
    if (option && !option.hasAttribute("data-active")) setActive(option.closest("[role=listbox]"), option);
  });

  document.addEventListener("keydown", (event) => {
    const trigger = event.target.closest("[data-ds-select] .ds-select__trigger");
    if (trigger) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
        event.preventDefault();
        open(trigger.closest("[data-ds-select]"), event.key === "ArrowUp");
      }
      return;
    }
    const list = event.target.closest("[data-ds-select] [role=listbox]");
    if (!list) return;
    const root = list.closest("[data-ds-select]");
    const all = options(list);
    const index = all.indexOf(active(list));
    const moves = { ArrowDown: index + 1, ArrowUp: index - 1, Home: 0, End: all.length - 1, PageDown: index + 10, PageUp: index - 10 };
    if (event.key in moves) {
      event.preventDefault();
      setActive(list, all[Math.max(0, Math.min(all.length - 1, moves[event.key]))]);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (active(list)) choose(root, active(list));
    } else if (event.key === "Escape") {
      event.preventDefault();
      close(root, true);
    } else if (event.key === "Tab") {
      close(root);
    } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
      typeahead(list, event.key);
    }
  });

  document.addEventListener("focusout", (event) => {
    const root = event.target.closest("[data-ds-select]");
    if (root && event.relatedTarget && !root.contains(event.relatedTarget)) close(root);
  });

  new MutationObserver((records) => {
    for (const { target } of records) {
      const root = target.closest("[data-ds-select]");
      if (!root || target !== parts(root).list) continue;
      announce(root);
      if (!busy(target) && !parts(root).popup.hidden && !active(target)) setActive(target, target.querySelector("[aria-selected=true]") ?? options(target)[0]);
    }
  }).observe(document.body, { subtree: true, attributes: true, attributeFilter: ["aria-busy"] });
})();
