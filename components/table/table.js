/* Table behaviour. Sorting: a button[data-ds-table-sort] inside a th; cells may carry data-sort-value. Numbers and
   ISO dates sort as such. Selection: input[data-ds-table-select] in each row and input[data-ds-table-select-all]
   in the header; a .ds-table-bulk[data-ds-table-bulk="<table id>"] bar shows while rows are selected and its
   [data-ds-table-count] says how many. Fires "ds-table-select" with detail { rows }. */
(() => {
  const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });
  const valueOf = (cell) => (cell?.dataset.sortValue ?? cell?.textContent ?? "").trim();
  const compare = (a, b) => {
    const numA = Number(a.replace(/[^0-9.-]/g, ""));
    const numB = Number(b.replace(/[^0-9.-]/g, ""));
    if (a !== "" && b !== "" && /^[^a-z]*$/i.test(a + b) && !Number.isNaN(numA) && !Number.isNaN(numB)) return numA - numB;
    return collator.compare(a, b);
  };

  const sort = (button) => {
    const th = button.closest("th");
    const table = th.closest("table");
    const index = [...th.parentElement.children].indexOf(th);
    const direction = th.getAttribute("aria-sort") === "ascending" ? "descending" : "ascending";
    table.querySelectorAll("thead th[aria-sort]").forEach((other) => other.removeAttribute("aria-sort"));
    th.setAttribute("aria-sort", direction);
    const body = table.tBodies[0];
    const rows = [...body.rows].filter((row) => !row.classList.contains("ds-table__empty"));
    rows.sort((rowA, rowB) => compare(valueOf(rowA.cells[index]), valueOf(rowB.cells[index])) * (direction === "ascending" ? 1 : -1));
    body.append(...rows);
    table.dispatchEvent(new CustomEvent("ds-table-sort", { bubbles: true, detail: { index, direction } }));
  };

  const syncSelection = (table) => {
    const boxes = [...table.querySelectorAll("tbody input[data-ds-table-select]")].filter((box) => !box.closest("tr").hidden);
    const checked = boxes.filter((box) => box.checked);
    boxes.forEach((box) => box.closest("tr").setAttribute("aria-selected", String(box.checked)));
    const all = table.querySelector("input[data-ds-table-select-all]");
    if (all) {
      all.checked = checked.length > 0 && checked.length === boxes.length;
      all.indeterminate = checked.length > 0 && checked.length < boxes.length;
    }
    if (table.id) {
      document.querySelectorAll(`[data-ds-table-bulk="${CSS.escape(table.id)}"]`).forEach((bar) => {
        bar.hidden = checked.length === 0;
        const count = bar.querySelector("[data-ds-table-count]");
        if (count) count.textContent = `${checked.length} selected`;
      });
    }
    table.dispatchEvent(new CustomEvent("ds-table-select", { bubbles: true, detail: { rows: checked.map((box) => box.closest("tr")) } }));
  };

  document.addEventListener("click", (event) => {
    const button = event.target.closest("table [data-ds-table-sort]");
    if (button) sort(button);
  });
  document.addEventListener("change", (event) => {
    const table = event.target.closest("table");
    if (!table) return;
    if (event.target.matches("[data-ds-table-select-all]")) {
      table.querySelectorAll("tbody input[data-ds-table-select]").forEach((box) => { if (!box.closest("tr").hidden) box.checked = event.target.checked; });
    }
    if (event.target.matches("[data-ds-table-select], [data-ds-table-select-all]")) syncSelection(table);
  });

  window.DS = window.DS || {};
  window.DS.table = { syncSelection };
  document.querySelectorAll("table:has([data-ds-table-select])").forEach(syncSelection);
})();
