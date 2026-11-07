/* Charts: <figure class="ds-chart" data-ds-chart="line|area|bar|donut|spark"> holding .ds-chart__plot, optional
   .ds-chart__legend, .ds-chart__table and a [data-ds-chart-table] toggle that names the view it opens, and
   <script type="application/json">{ "labels": [...], "series": [{ "name": "...", "values": [...] }], "prefix": "", "suffix": "" }</script>.
   Redraws on resize. Hover, touch or arrow keys show a readout. Series differ by marker shape as well as colour.
   No values (or a donut that sums to zero) draws an empty state with the optional "empty" message. Figures on the page
   draw on load; for data that arrives later, add the attribute and the script, then call window.DS.chart.init(figure).
   Call init again after changing the script to redraw. Marks grow in on first draw and when the data changes. */
(() => {
  const NS = "http://www.w3.org/2000/svg";
  const SHAPES = ["circle", "square", "triangle", "diamond", "circle", "square"];
  const color = (index) => `var(--color-chart-${(index % 6) + 1})`;
  const calm = matchMedia("(prefers-reduced-motion: reduce)");
  const lang = () => document.documentElement.lang || undefined;

  const svgEl = (name, attrs = {}) => {
    const node = document.createElementNS(NS, name);
    for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
    return node;
  };
  const marker = (shape, x, y, size, fill) => {
    const r = size / 2;
    if (shape === "circle") return svgEl("circle", { cx: x, cy: y, r, fill });
    if (shape === "square") return svgEl("rect", { x: x - r, y: y - r, width: size, height: size, fill });
    if (shape === "triangle") return svgEl("path", { d: `M${x} ${y - r * 1.2}L${x + r * 1.1} ${y + r * .8}L${x - r * 1.1} ${y + r * .8}Z`, fill });
    return svgEl("path", { d: `M${x} ${y - r * 1.25}L${x + r * 1.25} ${y}L${x} ${y + r * 1.25}L${x - r * 1.25} ${y}Z`, fill });
  };
  const niceMax = (value) => {
    if (value <= 0) return 1;
    const power = 10 ** Math.floor(Math.log10(value));
    return [1, 2, 2.5, 5, 10].map((step) => step * power).find((step) => step >= value);
  };

  const read = (root) => {
    const script = root.querySelector('script[type="application/json"]');
    if (!script) throw new Error("chart: needs a script[type=application/json] with labels and series");
    const data = JSON.parse(script.textContent);
    if (!Array.isArray(data.labels) || !Array.isArray(data.series)) throw new Error("chart: data needs labels and series arrays");
    const full = new Intl.NumberFormat(lang(), { maximumFractionDigits: 2 });
    const compact = new Intl.NumberFormat(lang(), { notation: "compact", maximumFractionDigits: 1 });
    data.format = (value, short) => `${data.prefix ?? ""}${(short ? compact : full).format(value)}${data.suffix ?? ""}`;
    return data;
  };

  const isEmpty = (root, data) => !data.labels.length || !data.series.some((series) => series.values.length)
    || (root.dataset.dsChart === "donut" && !data.series[0].values.some(Boolean));
  const emptyState = (message) => {
    const box = Object.assign(document.createElement("div"), { className: "ds-empty" });
    const badge = Object.assign(document.createElement("span"), { className: "ds-empty__icon" });
    const glyph = svgEl("svg", { class: "ds-icon ds-icon--lg", "aria-hidden": "true" });
    glyph.append(svgEl("use", { href: "#i-bar-chart" }));
    badge.append(glyph);
    box.append(badge, Object.assign(document.createElement("p"), { className: "ds-empty__text", textContent: message }));
    return box;
  };

  const readout = (root, plot, data, index, x, y) => {
    let box = plot.querySelector(".ds-chart__readout");
    if (!box) { box = Object.assign(document.createElement("div"), { className: "ds-chart__readout" }); box.setAttribute("aria-hidden", "true"); plot.append(box); }
    const kind = root.dataset.dsChart;
    const rows = kind === "donut"
      ? [[0, data.series[0].values[index], data.labels[index], index]]
      : data.series.map((series, seriesIndex) => [seriesIndex, series.values[index], series.name, seriesIndex]);
    box.innerHTML = `<b></b>${rows.map(() => '<div class="ds-chart__row"><svg class="ds-chart__swatch" viewBox="0 0 12 12"></svg><span></span><span></span></div>').join("")}`;
    box.querySelector("b").textContent = kind === "donut" ? data.series[0].name : data.labels[index];
    box.querySelectorAll(".ds-chart__row").forEach((row, rowIndex) => {
      const [, value, name, colorIndex] = rows[rowIndex];
      row.querySelector("svg").append(marker(SHAPES[colorIndex], 6, 6, 9, color(colorIndex)));
      row.children[1].textContent = name;
      const share = kind === "donut" ? ` (${Math.round((value / data.series[0].values.reduce((sum, item) => sum + item, 0)) * 100)}%)` : "";
      row.children[2].textContent = `${data.format(value)}${share}`;
    });
    const left = Math.min(Math.max(0, x + 12), plot.clientWidth - box.offsetWidth);
    box.style.left = `${x + 12 + box.offsetWidth > plot.clientWidth ? Math.max(0, x - box.offsetWidth - 12) : left}px`;
    box.style.top = `${Math.max(0, Math.min(y - box.offsetHeight / 2, plot.clientHeight - box.offsetHeight))}px`;
    plot.setAttribute("data-active", "");
  };
  const clear = (plot) => {
    plot.querySelector(".ds-chart__readout")?.remove();
    plot.removeAttribute("data-active");
    plot.querySelectorAll("[data-active]").forEach((node) => node.removeAttribute("data-active"));
    plot.querySelector(".ds-chart__guide")?.setAttribute("visibility", "hidden");
    plot.querySelectorAll(".ds-chart__focus").forEach((node) => node.remove());
  };

  const drawCartesian = (root, plot, data, svg, width, height) => {
    const kind = root.dataset.dsChart;
    const spark = kind === "spark";
    const pad = spark ? { top: 4, right: 4, bottom: 4, left: 4 } : { top: 8, right: 8, bottom: 24, left: 44 };
    const innerW = width - pad.left - pad.right;
    const innerH = height - pad.top - pad.bottom;
    const max = niceMax(Math.max(...data.series.flatMap((series) => series.values)));
    const min = spark ? Math.min(...data.series.flatMap((series) => series.values)) : 0;
    const count = data.labels.length;
    const bar = kind === "bar";
    const step = bar ? innerW / count : innerW / Math.max(1, count - 1);
    const xAt = (index) => pad.left + (bar ? step * index + step / 2 : step * index);
    const yAt = (value) => pad.top + innerH - ((value - min) / ((spark ? Math.max(...data.series[0].values) : max) - min || 1)) * innerH;

    if (!spark) {
      for (let tick = 0; tick <= 4; tick++) {
        const value = (max / 4) * tick;
        const y = yAt(value);
        svg.append(svgEl("line", { class: "ds-chart__grid", x1: pad.left, x2: width - pad.right, y1: y, y2: y }));
        const label = svgEl("text", { class: "ds-chart__axis", x: pad.left - 8, y: y + 4, "text-anchor": "end" });
        label.textContent = data.format(value, true);
        svg.append(label);
      }
      const every = Math.ceil(count / Math.max(1, Math.floor(innerW / 56)));
      data.labels.forEach((text, index) => {
        if (index % every) return;
        const label = svgEl("text", { class: "ds-chart__axis", x: xAt(index), y: height - 6, "text-anchor": bar ? "middle" : index === 0 ? "start" : index === count - 1 ? "end" : "middle" });
        label.textContent = text;
        svg.append(label);
      });
    }

    if (bar) {
      const groupW = step * .7;
      const barW = groupW / data.series.length;
      data.series.forEach((series, seriesIndex) => series.values.forEach((value, index) => {
        const x = xAt(index) - groupW / 2 + barW * seriesIndex;
        const rect = svgEl("rect", { class: "ds-chart__bar", x: x + 1, y: yAt(value), width: Math.max(1, barW - 2), height: Math.max(0, yAt(0) - yAt(value)), rx: Math.min(4, barW / 4), fill: color(seriesIndex), "data-index": index });
        svg.append(rect);
      }));
    } else {
      data.series.forEach((series, seriesIndex) => {
        const points = series.values.map((value, index) => [xAt(index), yAt(value)]);
        const d = points.map(([x, y], index) => `${index ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join("");
        if (kind === "area") svg.append(svgEl("path", { class: "ds-chart__area", d: `${d}L${points.at(-1)[0]} ${yAt(min)}L${points[0][0]} ${yAt(min)}Z`, fill: color(seriesIndex) }));
        svg.append(svgEl("path", { class: "ds-chart__line", d, stroke: color(seriesIndex), pathLength: 1 }));
        const marks = spark ? [points.at(-1)] : points;
        const markEvery = spark ? 1 : Math.ceil(count / Math.max(1, Math.floor(innerW / 28)));
        marks.forEach(([x, y], index) => {
          if (!spark && index % markEvery && index !== count - 1) return;
          const point = marker(SHAPES[seriesIndex], x, y, spark ? 6 : 7, color(seriesIndex));
          point.classList.add("ds-chart__marker");
          svg.append(point);
        });
      });
    }
    if (spark) return null;
    const guide = svgEl("line", { class: "ds-chart__guide", y1: pad.top, y2: pad.top + innerH, visibility: "hidden" });
    svg.append(guide);
    return {
      count,
      indexAt: (px) => Math.max(0, Math.min(count - 1, Math.round(bar ? (px - pad.left - step / 2) / step : (px - pad.left) / step))),
      show: (index) => {
        const x = xAt(index);
        if (bar) svg.querySelectorAll(".ds-chart__bar").forEach((rect) => rect.toggleAttribute("data-active", Number(rect.dataset.index) === index));
        else {
          guide.setAttribute("x1", x); guide.setAttribute("x2", x); guide.setAttribute("visibility", "visible");
          svg.querySelectorAll(".ds-chart__focus").forEach((node) => node.remove());
          data.series.forEach((series, seriesIndex) => {
            const point = marker(SHAPES[seriesIndex], x, yAt(series.values[index]), 11, color(seriesIndex));
            point.classList.add("ds-chart__marker", "ds-chart__focus");
            svg.append(point);
          });
        }
        readout(root, plot, data, index, x, yAt(Math.max(...data.series.map((series) => series.values[index]))));
      },
    };
  };

  const drawDonut = (root, plot, data, svg, width, height) => {
    const values = data.series[0].values;
    const total = values.reduce((sum, value) => sum + value, 0);
    const cx = width / 2;
    const cy = height / 2;
    const outer = Math.min(width, height) / 2 - 4;
    const inner = outer * .62;
    let angle = -Math.PI / 2;
    const arcs = values.map((value, index) => {
      const sweep = (value / total) * Math.PI * 2;
      const start = angle;
      angle += sweep;
      const large = sweep > Math.PI ? 1 : 0;
      const p = (r, a) => `${(cx + r * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)}`;
      const d = `M${p(outer, start)}A${outer} ${outer} 0 ${large} 1 ${p(outer, angle)}L${p(inner, angle)}A${inner} ${inner} 0 ${large} 0 ${p(inner, start)}Z`;
      const slice = svgEl("path", { class: "ds-chart__slice", d, fill: color(index), "data-index": index });
      svg.append(slice);
      return { mid: start + sweep / 2 };
    });
    const center = svgEl("text", { class: "ds-chart__center", x: cx, y: cy + 4 });
    center.textContent = data.format(total, true);
    const label = svgEl("text", { class: "ds-chart__center-label", x: cx, y: cy + 22 });
    label.textContent = data.totalLabel ?? "Total";
    svg.append(center, label);
    return {
      count: values.length,
      indexAt: null,
      show: (index) => {
        svg.querySelectorAll(".ds-chart__slice").forEach((slice) => slice.toggleAttribute("data-active", Number(slice.dataset.index) === index));
        const a = arcs[index].mid;
        readout(root, plot, data, index, cx + Math.cos(a) * outer * .8, cy + Math.sin(a) * outer * .8);
      },
    };
  };

  const legend = (root, data) => {
    const box = root.querySelector(".ds-chart__legend");
    if (!box) return;
    box.hidden = isEmpty(root, data);
    const donut = root.dataset.dsChart === "donut";
    const total = donut ? data.series[0].values.reduce((sum, value) => sum + value, 0) : 0;
    const items = donut ? data.labels.map((label, index) => `${label}, ${Math.round((data.series[0].values[index] / total) * 100)}%`) : data.series.map((series) => series.name);
    box.replaceChildren(...items.map((text, index) => {
      const key = Object.assign(document.createElement("span"), { className: "ds-chart__key" });
      const swatch = svgEl("svg", { class: "ds-chart__swatch", viewBox: "0 0 12 12", "aria-hidden": "true" });
      swatch.append(marker(SHAPES[index], 6, 6, 9, color(index)));
      key.append(swatch, text);
      return key;
    }));
  };

  const table = (root, data) => {
    const box = root.querySelector(".ds-chart__table");
    if (!box) return;
    const cell = (tag, text, attrs = {}) => Object.assign(document.createElement(tag), { textContent: text }, attrs);
    const head = document.createElement("tr");
    head.append(cell("th", root.dataset.dsChart === "donut" ? "Segment" : "Label", { scope: "col" }));
    data.series.forEach((series) => head.append(cell("th", series.name, { scope: "col", className: "ds-table__num" })));
    const body = document.createElement("tbody");
    data.labels.forEach((label, index) => {
      const row = document.createElement("tr");
      row.append(cell("th", label, { scope: "row" }));
      data.series.forEach((series) => row.append(cell("td", data.format(series.values[index]), { className: "ds-table__num" })));
      body.append(row);
    });
    const tableNode = Object.assign(document.createElement("table"), { className: "ds-table ds-table--compact" });
    tableNode.createTHead().append(head);
    tableNode.append(body);
    const viewport = Object.assign(document.createElement("div"), { className: "ds-scroll ds-scroll--x", tabIndex: 0 });
    viewport.setAttribute("role", "region");
    viewport.setAttribute("aria-label", "Chart data");
    viewport.append(tableNode);
    const area = Object.assign(document.createElement("div"), { className: "ds-table-wrap ds-scroll-area" });
    area.setAttribute("data-ds-scroll-area", "");
    area.append(viewport);
    box.replaceChildren(area);
  };

  const draw = (root) => {
    const data = read(root);
    const plot = root.querySelector(".ds-chart__plot");
    if (!plot) throw new Error("chart: needs a .ds-chart__plot");
    const width = plot.clientWidth;
    const height = plot.clientHeight;
    if (!width || !height) return;
    const title = root.querySelector(".ds-chart__title")?.textContent ?? "Chart";
    if (isEmpty(root, data)) {
      const message = data.empty ?? "No data for this period";
      plot.dsChart = null;
      plot.replaceChildren(emptyState(message));
      if (!plot.hasAttribute("aria-label")) {
        plot.setAttribute("role", "img");
        plot.setAttribute("aria-label", `${title}: ${message}`);
      }
      return;
    }
    const svg = svgEl("svg", { viewBox: `0 0 ${width} ${height}`, "aria-hidden": "true" });
    const drawn = JSON.stringify([data.labels, data.series]);
    if (plot.dsChartDrawn !== drawn && !calm.matches) svg.setAttribute("data-ds-chart-grow", "");
    plot.dsChartDrawn = drawn;
    plot.replaceChildren(svg);
    const api = root.dataset.dsChart === "donut" ? drawDonut(root, plot, data, svg, width, height) : drawCartesian(root, plot, data, svg, width, height);
    plot.dsChart = api;
    if (!plot.hasAttribute("aria-label")) {
      const summary = root.dataset.dsChart === "donut"
        ? data.labels.map((label, index) => `${label} ${data.format(data.series[0].values[index])}`).join(", ")
        : data.series.map((series) => `${series.name} from ${data.format(series.values[0])} to ${data.format(series.values.at(-1))}`).join("; ");
      plot.setAttribute("role", "img");
      plot.setAttribute("aria-label", `${title}: ${summary}`);
    }
  };

  const init = (root) => {
    const data = read(root);
    legend(root, data);
    table(root, data);
    if (root.dsChartBound) return draw(root);
    root.dsChartBound = true;
    const plot = root.querySelector(".ds-chart__plot");
    if (root.dataset.dsChart !== "spark") plot.tabIndex = 0;
    let index = -1;
    plot.addEventListener("pointermove", (event) => {
      const api = plot.dsChart;
      if (!api) return;
      if (api.indexAt) index = api.indexAt(event.clientX - plot.getBoundingClientRect().left);
      else {
        const slice = event.target.closest(".ds-chart__slice");
        if (!slice) return clear(plot);
        index = Number(slice.dataset.index);
      }
      api.show(index);
    });
    plot.addEventListener("pointerleave", () => clear(plot));
    plot.addEventListener("blur", () => clear(plot));
    plot.addEventListener("keydown", (event) => {
      const api = plot.dsChart;
      if (!api || !["ArrowLeft", "ArrowRight", "Home", "End", "Escape"].includes(event.key)) return;
      event.preventDefault();
      if (event.key === "Escape") return clear(plot);
      index = { ArrowLeft: Math.max(0, index - 1), ArrowRight: Math.min(api.count - 1, index + 1), Home: 0, End: api.count - 1 }[event.key];
      api.show(index);
    });
    new ResizeObserver(() => draw(root)).observe(plot);
    draw(root);
  };

  /* View switch: the outgoing view fades out fast, then the figure height springs to the incoming view as it rises in.
     A click mid switch starts from the current height, so rapid toggles never jump. */
  const token = (root, name) => getComputedStyle(root).getPropertyValue(name).trim();
  const ms = (root, name) => parseFloat(token(root, name));

  const label = (toggle, showTable) => {
    toggle.querySelector("use")?.setAttribute("href", showTable ? "#i-bar-chart" : "#i-list");
    [...toggle.childNodes].filter((node) => node.nodeType === Node.TEXT_NODE).forEach((node) => node.remove());
    toggle.append(showTable ? "View as chart" : "View as table");
  };

  const switchView = async (root, showTable) => {
    const plot = root.querySelector(".ds-chart__plot");
    const box = root.querySelector(".ds-chart__table");
    const [from, to] = showTable ? [plot, box] : [box, plot];
    const startHeight = root.getBoundingClientRect().height;
    const fromOpacity = from.hidden ? 0 : Number(getComputedStyle(from).opacity);
    const toOpacity = to.hidden ? 0 : Number(getComputedStyle(to).opacity);
    [root, plot, box].forEach((node) => node.getAnimations().forEach((animation) => animation.cancel()));
    if (calm.matches) {
      from.hidden = true;
      to.hidden = false;
      return;
    }
    root.style.height = `${startHeight}px`;
    root.style.overflow = "clip";
    try {
      if (!from.hidden && fromOpacity > 0) {
        await from.animate([{ opacity: fromOpacity }, { opacity: 0, transform: "translateY(-4px)" }],
          { duration: ms(root, "--duration-fast") * fromOpacity, easing: token(root, "--ease-in") }).finished;
      }
      from.hidden = true;
      to.hidden = false;
      root.style.height = "";
      const endHeight = root.getBoundingClientRect().height;
      const duration = ms(root, "--duration-spring");
      to.animate([{ opacity: toOpacity, transform: `translateY(${(1 - toOpacity) * 8}px)` }, { opacity: 1, transform: "none" }], { duration, easing: token(root, "--ease-spring") });
      await root.animate([{ height: `${startHeight}px` }, { height: `${endHeight}px` }], { duration, easing: token(root, "--ease-spring-soft") }).finished;
      root.style.overflow = "";
    } catch (error) {
      if (error.name !== "AbortError") throw error;
    }
  };

  document.addEventListener("click", (event) => {
    const toggle = event.target.closest("[data-ds-chart-table]");
    if (!toggle) return;
    const root = toggle.closest(".ds-chart");
    root.dsChartTable = !root.dsChartTable;
    label(toggle, root.dsChartTable);
    switchView(root, root.dsChartTable);
  });

  window.DS = window.DS || {};
  window.DS.chart = { init };
  document.querySelectorAll(".ds-chart[data-ds-chart]").forEach(init);
})();
