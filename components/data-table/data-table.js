/* Data table: [data-ds-data-table] holding a table, input[data-ds-data-table-filter], column toggles
   ([role=menuitemcheckbox][data-column="<index>"]), [data-ds-data-table-size] select, [data-ds-data-table-prev|next]
   buttons and [data-ds-data-table-status]. Filters, pages and hides columns on the client; for server data, keep the
   markup and replace render(). Needs table.js. */
(() => {
  if (!window.DS?.table) throw new Error("data-table: load table.js before data-table.js");
  const state = new WeakMap();

  const parts = (root) => {
    const table = root.querySelector("table");
    if (!table) throw new Error("data-table: needs a table");
    return {
      table, rows: [...table.tBodies[0].rows].filter((row) => !row.classList.contains("ds-table__empty")),
      empty: table.querySelector(".ds-table__empty"), filter: root.querySelector("[data-ds-data-table-filter]"),
      size: root.querySelector("[data-ds-data-table-size]"), status: root.querySelector("[data-ds-data-table-status]"),
      prev: root.querySelector("[data-ds-data-table-prev]"), next: root.querySelector("[data-ds-data-table-next]"),
    };
  };

  const render = (root) => {
    const p = parts(root);
    const s = state.get(root);
    const query = (p.filter?.value ?? "").trim().toLowerCase();
    const matching = p.rows.filter((row) => !query || row.textContent.toLowerCase().includes(query));
    const size = Number(p.size?.value ?? matching.length) || matching.length || 1;
    const pages = Math.max(1, Math.ceil(matching.length / size));
    s.page = Math.min(s.page, pages - 1);
    const start = s.page * size;
    const shown = new Set(matching.slice(start, start + size));
    p.rows.forEach((row) => { row.hidden = !shown.has(row); });
    if (p.empty) p.empty.hidden = matching.length > 0;
    if (p.status) p.status.textContent = matching.length ? `Showing ${start + 1} to ${start + shown.size} of ${matching.length}` : "No results";
    if (p.prev) p.prev.disabled = s.page === 0;
    if (p.next) p.next.disabled = s.page >= pages - 1;
    window.DS.table.syncSelection(p.table);
  };

  const toggleColumn = (root, index, visible) => {
    const { table } = parts(root);
    for (const row of table.rows) if (row.cells[index]) row.cells[index].hidden = !visible;
  };

  document.addEventListener("input", (event) => {
    const root = event.target.closest("[data-ds-data-table]");
    if (root && event.target.matches("[data-ds-data-table-filter]")) { state.get(root).page = 0; render(root); }
  });
  document.addEventListener("change", (event) => {
    const root = event.target.closest("[data-ds-data-table]");
    if (root && event.target.matches("[data-ds-data-table-size]")) { state.get(root).page = 0; render(root); }
  });
  document.addEventListener("click", (event) => {
    const root = event.target.closest("[data-ds-data-table]");
    if (root && event.target.closest("[data-ds-data-table-prev], [data-ds-data-table-next]")) {
      state.get(root).page += event.target.closest("[data-ds-data-table-next]") ? 1 : -1;
      return render(root);
    }
    const toggle = event.target.closest("[role=menuitemcheckbox][data-column]");
    if (toggle) {
      const owner = document.querySelector(`[data-ds-data-table] [popovertarget="${CSS.escape(toggle.closest(".ds-menu").id)}"]`)?.closest("[data-ds-data-table]");
      if (owner) toggleColumn(owner, Number(toggle.dataset.column), toggle.getAttribute("aria-checked") === "true");
    }
  });
  document.addEventListener("ds-table-sort", (event) => {
    const root = event.target.closest("[data-ds-data-table]");
    if (root) render(root);
  });

  document.querySelectorAll("[data-ds-data-table]").forEach((root) => { state.set(root, { page: 0 }); render(root); });
})();
