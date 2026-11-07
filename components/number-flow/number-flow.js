/* Rolling numbers: DS.numberFlow.set(element, next) animates element from its current text to next (a string as it
   should read, such as "$48,290", or a number formatted with the page language). Direction comes from the numeric
   values. Screen readers get the final text at once; the element is plain text again when the roll ends and then
   fires "ds-number-flow-end". Elements need class ds-number-flow. */
(() => {
  const numeric = (text) => Number(String(text).replace(/[^\d.-]/g, "")) || 0;
  const format = (value) => (typeof value === "number" ? new Intl.NumberFormat(document.documentElement.lang || undefined).format(value) : String(value));
  const escape = (text) => text.replace(/[&<>"]/g, (char) => `&#${char.charCodeAt(0)};`);

  const set = (element, value) => {
    if (!element.classList.contains("ds-number-flow")) throw new Error("number-flow: element needs class ds-number-flow");
    const previous = element.dataset.dsNumberFlowValue ?? element.textContent.trim();
    const next = format(value);
    element.dataset.dsNumberFlowValue = next;
    if (previous === next) return;
    const direction = numeric(next) >= numeric(previous) ? "up" : "down";

    // Align from the right so units line up with units; a longer value adds cells on the left
    const offset = next.length - previous.length;
    let changed = 0;
    const cells = [...next].map((char, index) => {
      const old = previous[index - offset];
      if (old === char) return `<span>${escape(char)}</span>`;
      const i = changed++;
      if (old === undefined) return `<span class="ds-number-flow__cell" data-dir="in" style="--i: ${i}"><span class="ds-number-flow__roll"><span>${escape(char)}</span></span></span>`;
      const strip = direction === "up" ? [old, char] : [char, old];
      return `<span class="ds-number-flow__cell" data-dir="${direction}" style="--i: ${i}"><span class="ds-number-flow__roll"><span>${escape(strip[0])}</span><span>${escape(strip[1])}</span></span></span>`;
    });
    element.innerHTML = `<span class="ds-sr-only">${escape(next)}</span><span aria-hidden="true">${cells.join("")}</span>`;

    const rolls = element.querySelectorAll(".ds-number-flow__roll");
    let pending = rolls.length;
    const finish = () => {
      if (element.dataset.dsNumberFlowValue !== next) return; // a newer value took over
      element.textContent = next;
      element.dispatchEvent(new CustomEvent("ds-number-flow-end", { bubbles: true, detail: { value: next } }));
    };
    if (!pending) return finish();
    rolls.forEach((roll) => roll.addEventListener("animationend", () => { if (--pending === 0) finish(); }, { once: true }));
  };

  window.DS = window.DS || {};
  window.DS.numberFlow = { set };
})();
