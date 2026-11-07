/* Layout fixes around the copied controls. Component markup, selection and keyboard behavior stay intact. */
(() => {
  const credit = document.querySelector('.ds-demo__credit');
  if (credit) {
    const fitCredit = () => document.documentElement.style.setProperty('--ds-demo-credit-height', `${credit.offsetHeight}px`);
    fitCredit();
    new ResizeObserver(fitCredit).observe(credit);
  }
  const popups = [...document.querySelectorAll('.ds-select__popup')];
  const topLayer = typeof HTMLElement.prototype.showPopover === 'function';
  let frame;

  const close = popup => {
    popup.hidden = true;
    popup.closest('[data-ds-select]').querySelector('.ds-select__trigger').setAttribute('aria-expanded', 'false');
    if (topLayer && popup.matches(':popover-open')) popup.hidePopover();
  };

  function place(popup) {
    const trigger = popup.closest('[data-ds-select]').querySelector('.ds-select__trigger');
    const anchor = trigger.getBoundingClientRect();
    const scroller = trigger.closest('.ds-scroll');
    const clip = scroller?.getBoundingClientRect();
    if (!trigger.checkVisibility() || (clip && (anchor.bottom <= clip.top || anchor.top >= clip.bottom))) return close(popup);
    const viewport = window.visualViewport;
    const edge = 12;
    const leftEdge = (viewport?.offsetLeft || 0) + edge;
    const topEdge = (viewport?.offsetTop || 0) + edge;
    const rightEdge = leftEdge + (viewport?.width || innerWidth) - edge * 2;
    const bottomEdge = topEdge + (viewport?.height || innerHeight) - edge * 2;
    const below = bottomEdge - anchor.bottom - 6;
    const above = anchor.top - topEdge - 6;
    const side = below >= 200 || below >= above ? 'bottom' : 'top';
    const available = Math.max(0, side === 'bottom' ? below : above);
    const width = Math.min(Math.max(anchor.width, 192), rightEdge - leftEdge);
    popup.style.width = `${width}px`;
    popup.style.setProperty('--ds-scroll-max', `${Math.max(0, Math.min(280, available - 10))}px`);
    popup.dataset.side = side;

    if (topLayer) {
      window.DS.position(popup, trigger, `${side}-${trigger.closest('[data-ds-role]') ? 'end' : 'start'}`);
      const left = Math.max(leftEdge, Math.min(parseFloat(popup.style.left), rightEdge - width));
      const top = Math.max(topEdge, Math.min(parseFloat(popup.style.top), bottomEdge - popup.offsetHeight));
      popup.style.left = `${left}px`;
      popup.style.top = `${top}px`;
    } else {
      // Older browsers retain the component's absolute popup, fitted inside the closest scroll region.
      const roomAbove = clip ? anchor.top - clip.top - 6 : above;
      const roomBelow = clip ? clip.bottom - anchor.bottom - 6 : below;
      const localSide = roomBelow >= 200 || roomBelow >= roomAbove ? 'bottom' : 'top';
      popup.dataset.side = localSide;
      popup.style.setProperty('--ds-scroll-max', `${Math.max(0, Math.min(280, (localSide === 'bottom' ? roomBelow : roomAbove) - 10))}px`);
      popup.style.insetInlineStart = `${Math.min(0, rightEdge - anchor.left - width)}px`;
      popup.style.insetInlineEnd = 'auto';
    }
  }

  for (const popup of popups) {
    popup.classList.add('ds-demo__select-popup');
    if (topLayer) popup.setAttribute('popover', 'manual');
  }

  new MutationObserver(records => {
    for (const { target: popup } of records) {
      if (!popup.matches('.ds-demo__select-popup')) continue;
      if (popup.hidden) {
        if (topLayer && popup.matches(':popover-open')) popup.hidePopover();
      } else {
        if (topLayer && !popup.matches(':popover-open')) popup.showPopover();
        place(popup);
        if (!popup.hidden) {
          popup.querySelector('[role=listbox]').focus({ preventScroll: true });
          popup.querySelector('[data-active]')?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        }
      }
    }
  }).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['hidden'] });

  const reposition = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => popups.filter(p => !p.hidden).forEach(place));
  };
  addEventListener('resize', reposition);
  window.visualViewport?.addEventListener('resize', reposition);
  addEventListener('scroll', event => {
    if (!event.target.closest?.('.ds-demo__select-popup')) reposition();
  }, true);
  document.addEventListener('close', event => {
    if (event.target.matches?.('dialog')) event.target.querySelectorAll('.ds-demo__select-popup').forEach(close);
  }, true);

  // Card layouts expose sorting through a select instead of sending keyboard focus into a clipped table head.
  const tables = [...document.querySelectorAll('.ds-demo__records table')];
  const initialRows = new WeakMap(tables.map(table => [table, [...table.tBodies[0].rows].filter(row => !row.classList.contains('ds-table__empty'))]));
  function syncTableControls() {
    const stacked = matchMedia('(max-width: 1279px)').matches;
    tables.forEach(table => table.querySelectorAll('thead button, thead input').forEach(control => control.tabIndex = stacked ? -1 : 0));
  }
  document.addEventListener('change', event => {
    const control = event.target.closest('[data-ds-sort-table]');
    if (!control) return;
    const table = document.getElementById(control.dataset.dsSortTable);
    if (control.value === 'default') {
      table.tBodies[0].append(...initialRows.get(table));
      table.querySelectorAll('th[aria-sort]').forEach(th => th.removeAttribute('aria-sort'));
      table.dispatchEvent(new CustomEvent('ds-table-sort', { bubbles: true, detail: { reset: true } }));
    } else {
      const [index, direction] = control.value.split(':');
      const header = table.tHead.rows[0].cells[Number(index) + (table.querySelector('[data-ds-table-select-all]') ? 1 : 0)];
      header.setAttribute('aria-sort', direction === 'ascending' ? 'descending' : 'ascending');
      header.querySelector('[data-ds-table-sort]').click();
    }
  });
  document.addEventListener('ds-table-sort', event => {
    const control = document.querySelector(`[data-ds-sort-table="${event.target.id}"]`);
    if (!control) return;
    const offset = event.target.querySelector('[data-ds-table-select-all]') ? 1 : 0;
    const value = event.detail.reset ? 'default' : `${event.detail.index - offset}:${event.detail.direction}`;
    const root = control.closest('[data-ds-select]');
    const option = [...root.querySelectorAll('[role=option]')].find(option => option.dataset.value === value);
    if (!option) return;
    control.value = value;
    root.querySelector('.ds-select__value').textContent = option.firstElementChild.textContent;
    root.querySelectorAll('[role=option]').forEach(item => item.setAttribute('aria-selected', String(item === option)));
  });
  addEventListener('resize', syncTableControls);
  syncTableControls();

  // Keep the mobile navigation and modal background still, with keyboard focus inside the open sidebar.
  const sidebar = document.querySelector('[data-ds-sidebar]');
  let sidebarWasOpen = false;
  function syncOverlays() {
    const desktop = matchMedia('(min-width: 1024px)').matches;
    if (desktop && sidebar?.hasAttribute('data-open')) {
      sidebar.querySelector('[data-ds-sidebar-close]').click();
    }
    const open = !!sidebar?.hasAttribute('data-open') && !desktop;
    const appMain = document.querySelector('.ds-app__main');
    if (appMain) appMain.inert = open;
    if (open && !sidebarWasOpen) {
      // Wait for the off-canvas visibility change before moving keyboard focus into the panel.
      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (!sidebar.hasAttribute('data-open')) return;
        [...sidebar.querySelectorAll('a, button, summary')].find(el => el.checkVisibility({ visibilityProperty: true }) && !el.disabled && !el.closest('[inert]'))?.focus({ preventScroll: true });
      }));
    }
    if (sidebar) {
      if (open) { sidebar.setAttribute('role', 'dialog'); sidebar.setAttribute('aria-modal', 'true'); }
      else { sidebar.removeAttribute('role'); sidebar.removeAttribute('aria-modal'); }
      sidebar.querySelector('.ds-sidebar__brand').inert = desktop && sidebar.hasAttribute('data-collapsed');
      const collapse = sidebar.querySelector('[data-ds-sidebar-collapse]');
      const label = sidebar.hasAttribute('data-collapsed') ? 'Expand sidebar' : 'Collapse sidebar';
      collapse.setAttribute('aria-label', label);
      collapse.setAttribute('data-ds-tooltip', label);
    }
    document.documentElement.classList.toggle('ds-demo--locked', open || !!document.querySelector('dialog[open]'));
    if (sidebarWasOpen && !open) document.querySelector('[data-ds-sidebar-open]')?.focus({ preventScroll: true });
    sidebarWasOpen = open;
  }
  new MutationObserver(syncOverlays).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['open', 'data-open', 'data-collapsed'] });
  addEventListener('resize', syncOverlays);
  document.addEventListener('keydown', event => {
    if (event.key !== 'Tab' || !sidebar?.hasAttribute('data-open') || matchMedia('(min-width: 1024px)').matches) return;
    const controls = [...sidebar.querySelectorAll('a, button, summary')].filter(el => el.checkVisibility({ visibilityProperty: true }) && !el.disabled && !el.closest('[inert]'));
    const first = controls[0], last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  syncOverlays();
})();
