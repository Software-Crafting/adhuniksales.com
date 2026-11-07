(() => {
  'use strict';
  const SEED = window.ADHUNIK_DEMO;
  const KEY = 'adhunik-sales-demo-v1';
  const clone = x => JSON.parse(JSON.stringify(x));
  let state = clone(SEED);
  try { const saved = JSON.parse(localStorage.getItem(KEY)); if (saved?.version === SEED.version) state = saved; }
  catch { /* Restricted file storage uses the same-tab fallback below. */ }
  if (window.name.startsWith(KEY + ':')) {
    try { const saved = JSON.parse(window.name.slice(KEY.length + 1)); if (saved?.version === SEED.version && (saved.updatedAt || 0) > (state.updatedAt || 0)) state = saved; } catch { /* Keep the seed. */ }
  }
  const page = document.body.dataset.dsPage;
  const isApp = !['overview', 'map'].includes(page);
  const root = isApp ? '../' : '';
  const main = document.querySelector('[data-ds-content]');
  const params = new URLSearchParams(location.search);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const icon = (name, small = false) => `<svg class="ds-icon${small ? ' ds-icon--sm' : ''}" aria-hidden="true"><use href="#i-${name}"/></svg>`;
  const url = (file, query = '') => `${isApp ? '' : 'pages/'}${file}.html${query ? '?' + query : ''}`;
  const money = n => new Intl.NumberFormat('en-US', {style:'currency', currency:'USD', maximumFractionDigits:2}).format(n);
  const date = value => new Intl.DateTimeFormat('en-GB', {day:'numeric', month:'short', year:'numeric', timeZone:'Asia/Kolkata'}).format(new Date(value + 'T12:00:00Z'));
  const buyerOf = e => state.buyers.find(b => b.id === e.buyer);
  const enquiryOf = s => state.enquiries.find(e => e.id === s.enquiry);
  const shipmentOf = e => state.shipments.find(s => s.enquiry === e.id);
  const total = e => e.items.reduce((sum, i) => sum + i.qty * i.price, 0) + (e.freight || 0);
  const shortages = e => e.items.filter(i => i.stock < i.qty);
  const openEnquiries = () => state.enquiries.filter(e => e.status !== 'Confirmed');
  const today = () => new Intl.DateTimeFormat('en-CA', {timeZone:'Asia/Kolkata', year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  const who = () => ({Owner:'Owner', Sales:'Rohit Mehra', Dispatch:'Neha Sharma'}[state.role]);
  const badge = status => {
    const tone = {'Stock check':'warning','Quote ready':'info','Quoted':'primary','Confirmed':'success','Packing':'warning','Ready to dispatch':'info','In transit':'primary','Delivered':'success'}[status] || 'neutral';
    return `<span class="ds-badge ds-badge--dot ds-badge--${tone}">${esc(status)}</span>`;
  };
  const button = (text, action, name = '', variant = 'secondary', attrs = '') => `<button type="button" class="ds-btn ds-btn--${variant}" data-ds-action="${action}" ${attrs}>${name ? icon(name, true) : ''}${esc(text)}</button>`;
  const link = (text, href, variant = 'secondary', name = '') => `<a class="ds-btn ds-btn--${variant}" href="${href}">${name ? icon(name, true) : ''}${esc(text)}</a>`;
  const card = (title, desc, body, action = '') => `<section class="ds-card"><div class="ds-card__head"><div><h2 class="ds-card__title">${title}</h2>${desc ? `<p class="ds-card__desc">${desc}</p>` : ''}</div>${action}</div><div class="ds-card__body">${body}</div></section>`;
  const alert = (title, text, tone = 'info') => `<div class="ds-alert ds-alert--${tone}" role="status">${icon(tone === 'warning' ? 'alert-triangle' : tone === 'success' ? 'check-circle' : 'info').replace('ds-icon\"', 'ds-icon ds-alert__icon\"')}<div class="ds-alert__body"><p class="ds-alert__title">${esc(title)}</p><p>${esc(text)}</p></div></div>`;
  const dl = items => `<dl class="ds-dl">${items.map(([key,value]) => `<div class="ds-dl__row"><dt>${esc(key)}</dt><dd class="ds-demo__responsive-text">${value}</dd></div>`).join('')}</dl>`;
  const stat = (label,value,note) => `<li class="ds-stat"><p class="ds-stat__label">${label}</p><p class="ds-stat__value">${value}</p><p class="ds-demo__metric-note">${note}</p></li>`;
  const field = (id,label,type = 'text',value = '',attrs = '') => `<div class="ds-field"><label class="ds-field__label" for="${id}">${esc(label)}</label><div class="ds-input"><input class="ds-input__control" id="${id}" name="${id}" type="${type}" value="${esc(value)}" ${attrs}></div></div>`;
  const textarea = (id,label,value = '',attrs = '') => `<div class="ds-field"><label class="ds-field__label" for="${id}">${esc(label)}</label><div class="ds-scroll-area" data-ds-scroll-area><textarea class="ds-textarea ds-scroll ds-scroll--y" id="${id}" name="${id}" rows="3" ${attrs}>${esc(value)}</textarea></div></div>`;
  const select = (id,label,options,value,attrs = '') => `<div class="ds-field"><span class="ds-field__label" id="${id}-label">${esc(label)}</span><div class="ds-select" data-ds-select><button type="button" class="ds-select__trigger" aria-haspopup="listbox" aria-expanded="false" aria-labelledby="${id}-label ${id}-value"><span class="ds-select__value" id="${id}-value">${esc(options.find(o => o[0] === value)?.[1] || options[0][1])}</span>${icon('chevrons-up-down',true)}</button><div class="ds-select__popup ds-scroll-area" data-ds-scroll-area hidden><ul class="ds-select__list ds-scroll ds-scroll--y" role="listbox" tabindex="-1" aria-labelledby="${id}-label">${options.map(([v,l],i) => `<li class="ds-select__option" role="option" id="${id}-option-${i}" data-value="${esc(v)}" aria-selected="${v === value}"><span>${esc(l)}</span>${icon('check',true).replace('ds-icon--sm','ds-icon--sm ds-select__check')}</li>`).join('')}</ul></div><input type="hidden" name="${id}" id="${id}" value="${esc(value)}" ${attrs}></div></div>`;
  const empty = (title,text,action = '') => `<div class="ds-empty ds-demo__empty"><span class="ds-empty__icon">${icon('inbox')}</span><h2 class="ds-empty__title">${esc(title)}</h2><p class="ds-empty__text">${esc(text)}</p>${action ? `<div class="ds-empty__actions">${action}</div>` : ''}</div>`;
  const timeline = events => `<ol class="ds-timeline">${events.map(e => `<li class="ds-timeline__item"><span class="ds-timeline__marker${e.status === 'Delivered' ? ' ds-timeline__marker--success' : ''}">${icon(e.status === 'Delivered' ? 'check' : 'clock',true)}</span><div class="ds-timeline__body"><p class="ds-timeline__title">${esc(e.status || e.title)}</p><time class="ds-timeline__time" datetime="${esc(e.date)}">${date(e.date)}${e.by ? ' · ' + esc(e.by) : ''}</time>${e.text ? `<p class="ds-timeline__text">${esc(e.text)}</p>` : ''}</div></li>`).join('')}</ol>`;

  function save() {
    state.updatedAt = Date.now();
    window.name = KEY + ':' + JSON.stringify(state);
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* Same-tab persistence remains available. */ }
  }
  function go(message,href = location.href) { state.flash = message; save(); const next = new URL(href,location.href).href; if (next === location.href) location.reload(); else location.href = next; }
  function toast(message,tone = 'success') { window.DS.toast({message,tone}); }
  function dialog(id,title,description,body,submit = '',form = '') {
    return `<dialog class="ds-dialog" id="${id}" aria-labelledby="${id}-title"><form class="ds-demo__form" ${form ? `data-ds-form="${form}"` : ''}><div class="ds-dialog__head"><div><h2 class="ds-dialog__title" id="${id}-title">${title}</h2><p class="ds-dialog__desc">${description}</p></div><button type="button" class="ds-btn ds-btn--ghost ds-btn--icon ds-btn--sm" data-ds-dialog-close aria-label="Close ${title.toLowerCase()}">${icon('x')}</button></div><div class="ds-scroll-area" data-ds-scroll-area><div class="ds-dialog__body ds-scroll ds-scroll--y ds-demo__form">${body}<p class="ds-demo__form-error" data-ds-form-error role="alert" hidden></p></div></div><div class="ds-dialog__foot"><button type="button" class="ds-btn ds-btn--secondary" data-ds-dialog-close>${submit ? 'Cancel' : 'Close'}</button>${submit ? `<button class="ds-btn ds-btn--primary" type="submit">${submit}</button>` : ''}</div></form></dialog>`;
  }
  function table(id,label,columns,rows,{search = false,selection = false,filter = '',tools = '',pageSize = false} = {}) {
    const count = columns.length + (selection ? 1 : 0);
    return `<div class="ds-data-table" ${search ? 'data-ds-data-table' : ''}>
      ${search ? `<div class="ds-data-table__toolbar"><div class="ds-input ds-data-table__filter">${icon('search').replace('ds-icon"','ds-icon ds-input__icon"')}<input class="ds-input__control" type="search" value="${esc(filter)}" placeholder="Search ${label.toLowerCase()}" aria-label="Search ${label.toLowerCase()}" data-ds-data-table-filter></div>${tools}<span class="ds-spacer"></span>${button('Export CSV','export','download','secondary',`data-ds-table-id="${id}"`)}</div>` : ''}
      ${selection ? `<div class="ds-table-bulk" data-ds-table-bulk="${id}" hidden><span data-ds-table-count aria-live="polite">0 selected</span><span class="ds-spacer"></span>${button('Export selected','export','download','ghost',`data-ds-table-id="${id}" data-ds-selected`)}</div>` : ''}
      <div class="ds-table-wrap ds-scroll-area" data-ds-scroll-area><div class="ds-scroll ds-scroll--x" tabindex="0" role="region" aria-labelledby="${id}-caption"><table class="ds-table ds-table--stack" id="${id}"><caption class="ds-sr-only" id="${id}-caption">${label}</caption><thead><tr>${selection ? '<th scope="col" class="ds-table__check"><input class="ds-check__input" type="checkbox" data-ds-table-select-all aria-label="Select all rows"></th>' : ''}${columns.map(c => `<th scope="col">${c === 'Action' ? '<span class="ds-sr-only">Action</span>' : `<button type="button" class="ds-table__sort" data-ds-table-sort>${c}${icon('chevrons-up-down',true)}</button>`}</th>`).join('')}</tr></thead><tbody>${rows.map((cells,i) => `<tr>${selection ? `<td class="ds-table__check"><input class="ds-check__input" type="checkbox" data-ds-table-select aria-label="Select row ${i+1}"></td>` : ''}${cells.map((cell,i) => `<td data-label="${columns[i] === 'Action' ? '' : columns[i]}"${columns[i] === 'Action' ? ' class="ds-table__actions"' : ''}${typeof cell === 'object' ? ` data-sort-value="${esc(cell.sort)}"` : ''}>${typeof cell === 'object' ? cell.html : cell}</td>`).join('')}</tr>`).join('')}<tr class="ds-table__empty" ${rows.length ? 'hidden' : ''}><td colspan="${count}"><strong>No ${label.toLowerCase()} found</strong><p>Try another search or clear the filters.</p>${search ? button('Clear search','clear-search','','ghost') : ''}</td></tr></tbody></table></div></div>
      ${search ? `<div class="ds-data-table__pager"><p data-ds-data-table-status aria-live="polite"></p><div class="ds-data-table__pager-controls">${pageSize ? `<div class="ds-data-table__size">${select(id+'-size','Rows per page',[['5','5'],['10','10'],['25','25']],'5','data-ds-data-table-size')}</div>` : ''}<button type="button" class="ds-btn ds-btn--secondary ds-btn--icon ds-btn--sm" data-ds-data-table-prev aria-label="Previous page">${icon('chevron-left',true)}</button><button type="button" class="ds-btn ds-btn--secondary ds-btn--icon ds-btn--sm" data-ds-data-table-next aria-label="Next page">${icon('chevron-right',true)}</button></div></div>` : ''}</div>`;
  }
  const enquiryRow = e => {
    const b = buyerOf(e);
    return [`<a class="ds-table__primary" href="${url('enquiry-detail','id='+e.id)}">${e.id}</a><span class="ds-table__sub">${esc(e.category)}</span>`,`<div class="ds-demo__table-company"><span class="ds-table__primary">${esc(b.name)}</span><span class="ds-table__sub">${esc(b.country)}</span></div>`,badge(e.status),money(total(e)),{html:`<time datetime="${e.due}">${date(e.due)}</time>`,sort:e.due},esc(e.owner),link('Open',url('enquiry-detail','id='+e.id),'ghost','arrow-right')];
  };
  const shipmentRow = s => {
    const e = enquiryOf(s), b = buyerOf(e);
    return [`<a class="ds-table__primary" href="${url('shipment-detail','id='+s.id)}">${s.id}</a><span class="ds-table__sub">${e.id}</span>`,`<div class="ds-demo__table-company"><span class="ds-table__primary">${esc(b.name)}</span><span class="ds-table__sub">${esc(b.port)}, ${esc(b.country)}</span></div>`,badge(s.status),`${s.cartons} cartons`,money(total(e)),{html:`<time datetime="${s.eta}">${date(s.eta)}</time>`,sort:s.eta},link('Track',url('shipment-detail','id='+s.id),'ghost','arrow-right')];
  };

  function common() {
    const nav = document.querySelector('[data-ds-nav]');
    if (nav) {
      nav.innerHTML = `<p class="ds-sidebar__group-label">Export operations</p><ul class="ds-sidebar__list">${[['dashboard','dashboard','Dashboard'],['enquiries','inbox','Enquiries'],['buyers','users','Buyers'],['shipments','truck','Shipments']].map(([file,i,label]) => `<li><a class="ds-sidebar__link" href="${url(file)}" ${page === file || (page === 'enquiry-detail' && file === 'enquiries') || (page === 'shipment-detail' && file === 'shipments') ? 'aria-current="page"' : ''}>${icon(i)}<span class="ds-sidebar__text">${label}</span>${file === 'enquiries' ? `<span class="ds-sidebar__badge">${openEnquiries().length}</span>` : ''}</a></li>`).join('')}</ul><p class="ds-sidebar__group-label">Demo guide</p><ul class="ds-sidebar__list"><li><a class="ds-sidebar__link" href="../index.html">${icon('home')}<span class="ds-sidebar__text">Overview</span></a></li><li><a class="ds-sidebar__link" href="../map.html">${icon('layers')}<span class="ds-sidebar__text">Page map</span></a></li></ul>`;
    }
    const role = document.querySelector('[data-ds-role]');
    if (role) role.innerHTML = select('demo-role','View as',[['Owner','Owner'],['Sales','Sales'],['Dispatch','Dispatch']],state.role);
    const user = document.querySelector('[data-ds-persona]');
    if (user) user.innerHTML = `<span class="ds-sidebar__avatar" aria-hidden="true">${state.role === 'Owner' ? 'AS' : state.role === 'Sales' ? 'RM' : 'NS'}</span><span class="ds-sidebar__user-text">${esc(who())}<br><span class="ds-caption">${state.role} demo view</span></span>`;
    document.querySelector('[data-ds-date]')?.replaceChildren(document.createTextNode(date(state.asOf)));
    const dialogs = document.querySelector('[data-ds-dialogs]');
    dialogs.innerHTML = dialog('about-demo','About this demo','A clickable concept for Adhunik Sales.',`${alert('Fictional sample data','All buyers, quantities, prices, references and shipment updates are illustrative.')}<p>Explore owner, sales and dispatch views using the role menu. Every screen stays available for the walkthrough.</p><p>Changes stay in this browser. No email is sent and no inventory or carrier service is connected.</p><p>For a guided flow, open ENQ-26048, resolve the wheel bearing shortage, check stock, prepare a quote, confirm it, then update its shipment.</p>${button('Reset sample data','reset','refresh','secondary','data-ds-confirm="Reset the demo?" data-ds-confirm-body="This removes your local changes and restores the sample records." data-ds-confirm-action="Reset sample data"')}`);
  }

  const pageList = [
    ['Dashboard','dashboard','dashboard','See pending enquiries, quote value and dispatch priorities.'],
    ['Enquiries','enquiries','inbox','Search buyer requests and add a mixed parts enquiry.'],
    ['Enquiry detail','enquiry-detail','file-text','Check stock, prepare a quotation and confirm the order.'],
    ['Buyers','buyers','users','Keep overseas buyer contacts and their enquiries together.'],
    ['Shipments','shipments','truck','See packing, transit and delivery status in one view.'],
    ['Shipment detail','shipment-detail','package','Follow milestones and download a packing list.']
  ];
  function overview() {
    main.innerHTML = `<section class="ds-hero ds-hero--split" aria-labelledby="overview-title"><div class="ds-container ds-hero__inner"><div class="ds-hero__content"><span class="ds-hero__badge">${icon('globe',true)}Spare parts. Worldwide.</span><h1 class="ds-hero__title" id="overview-title">Adhunik Sales</h1><p class="ds-hero__lead">One place for every buyer enquiry, parts quote and export shipment.</p><p class="ds-small ds-muted">A working demo for the team in Gurugram. Follow a mixed parts list from stock check to dispatch, with the details kept together.</p><div class="ds-hero__actions">${link('Open dashboard',url('dashboard'),'primary','arrow-right')}${link('Explore the page map','map.html')}</div><p class="ds-hero__note">Interactive demo · Fictional data · Changes saved locally</p></div><div class="ds-demo__preview"><div class="ds-demo__preview-head ds-demo__line"><div><p class="ds-eyebrow">From enquiry to export</p><h2 class="ds-h3">Every handoff, connected</h2></div>${icon('globe')}</div>${[['inbox','01','Buyer enquiry','Mixed Land Rover, scooter and truck parts.'],['check-circle','02','Stock and quote','Availability, shortages and agreed prices.'],['package','03','Packing and dispatch','Cartons, documents and shipment milestones.']].map(([i,n,t,d]) => `<div class="ds-demo__preview-stage"><span class="ds-demo__row-icon">${icon(i)}</span><div class="ds-demo__row-body"><small>Step ${n}</small><strong>${t}</strong><small>${d}</small></div></div>`).join('')}<div class="ds-demo__banner">${icon('link',true)}One buyer. One enquiry. A clear trail through shipment.</div></div></div></section><section class="ds-section" aria-labelledby="screens-title"><div class="ds-container"><div class="ds-features__head"><p class="ds-eyebrow">Take a look around</p><h2 class="ds-h2" id="screens-title">Your export workspace</h2><p class="ds-lead">Open any screen, or start with the dashboard.</p></div><div class="ds-demo__grid ds-demo__grid--three">${pageList.map(([title,file,i,desc]) => `<article class="ds-card ds-demo__page-card"><div class="ds-card__body"><span class="ds-feature__icon">${icon(i)}</span><h3 class="ds-card__title">${title}</h3><p class="ds-card__desc">${desc}</p></div><div class="ds-card__foot">${link('Open '+title.toLowerCase(),url(file),'ghost','arrow-right')}</div></article>`).join('')}<article class="ds-card ds-demo__page-card"><div class="ds-card__body"><span class="ds-feature__icon">${icon('layers')}</span><h3 class="ds-card__title">Page map</h3><p class="ds-card__desc">See how each screen connects and who uses it.</p></div><div class="ds-card__foot">${link('Open page map','map.html','ghost','arrow-right')}</div></article></div></div></section><section class="ds-section" aria-labelledby="roles-title"><div class="ds-container"><div class="ds-features__head"><p class="ds-eyebrow">A shared view</p><h2 class="ds-h2" id="roles-title">Built around your team</h2></div><ul class="ds-features__grid">${[['bar-chart','Owner','Review open enquiries, quote values and delivery priorities.'],['users','Sales','Record buyer requests, check availability and prepare quotations.'],['globe','Dispatch','Prepare cartons, keep documents together and update milestones.']].map(([i,title,text]) => `<li class="ds-feature"><span class="ds-feature__icon">${icon(i)}</span><h3 class="ds-feature__title">${title}</h3><p class="ds-feature__text">${text}</p></li>`).join('')}</ul></div></section>`;
  }
  function mapPage() {
    main.innerHTML = `<section class="ds-container ds-section ds-stack"><header class="ds-page-header"><p class="ds-eyebrow">Demo guide</p><h1 class="ds-page-header__title">Page map</h1><p class="ds-page-header__desc">See the screens, the people who use them and the path from enquiry to shipment.</p></header>${alert('Start with an enquiry','Try ENQ-26048 for a stock shortage, or SHP-26017 for an export already in transit.')}<ol class="ds-stepper ds-demo__map-step" aria-label="Export workflow">${['Enquiry','Stock check','Quotation','Shipment'].map((x,i) => `<li class="ds-stepper__step" ${i === 0 ? 'aria-current="step"' : ''}><span class="ds-stepper__marker" aria-hidden="true">${i+1}</span><span class="ds-stepper__label">${x}</span></li>`).join('')}</ol><div class="ds-demo__grid ds-demo__grid--three">${[['Owner','Review the business',[['Dashboard','dashboard','Open enquiries, quote value and shipment focus.'],['Buyers','buyers','Buyer directory with links to their enquiries.']]],['Sales','Move enquiries forward',[['Enquiries','enquiries','Search, filter and add buyer part lists.'],['Enquiry detail','enquiry-detail','Stock check → quotation → linked shipment.']]],['Dispatch','Keep shipments moving',[['Shipments','shipments','Review cartons, destinations and delivery dates.'],['Shipment detail','shipment-detail','Milestones, packing list and source enquiry.']]]].map(([role,desc,pages]) => card(role,desc,`<div class="ds-stack">${pages.map(([title,file,desc]) => `<a class="ds-demo__map-link" href="${url(file)}">${title} ${icon('arrow-right',true)}<small>${desc}</small></a>`).join('')}</div>`)).join('')}</div>${card('How the screens connect','All records remain linked as you move through the demo.',`<div class="ds-stack"><p><a href="${url('buyers')}">Buyer</a> → <a href="${url('enquiries')}">Buyer enquiries</a> → <a href="${url('enquiry-detail')}">Parts, stock and quote</a> → <a href="${url('shipment-detail')}">Shipment milestones</a></p><p class="ds-small ds-muted">The app sidebar reaches all four main areas. Each shipment links back to its enquiry. The overview links to every page.</p><p>${link('Back to overview','index.html')}${link('Open dashboard',url('dashboard'),'primary')}</p></div>`)}</section>`;
  }
  function chartHTML() {
    const labels = [...new Set(state.enquiries.map(e => e.category))];
    return `<figure class="ds-chart" data-ds-chart="bar"><figcaption class="ds-chart__head"><span class="ds-chart__heading"><span class="ds-chart__title">Enquiries by parts family</span><span class="ds-chart__value">${state.enquiries.length} enquiries</span></span><button type="button" class="ds-btn ds-btn--ghost ds-btn--sm" data-ds-chart-table>${icon('list',true)}View as table</button></figcaption><div class="ds-chart__plot"></div><div class="ds-chart__legend"></div><div class="ds-chart__table" hidden></div><script type="application/json">${JSON.stringify({labels,series:[{name:'Enquiries',values:labels.map(l => state.enquiries.filter(e => e.category === l).length)}]})}</script></figure>`;
  }
  function dashboard() {
    const priority = {'Stock check':0,'Quote ready':1,'Quoted':2};
    const enquiries = openEnquiries().sort((a,b) => priority[a.status]-priority[b.status] || a.due.localeCompare(b.due));
    const ships = state.shipments.filter(s => s.status !== 'Delivered').sort((a,b) => a.etd.localeCompare(b.etd));
    const pending = enquiries[0];
    const focus = state.role === 'Dispatch' ? ['Keep the next dispatch moving','Review packing, documents and the next shipment milestone.',ships.length ? url('shipment-detail','id='+ships[0].id) : url('shipments'),'Review shipments'] : state.role === 'Sales' ? ['Turn the next enquiry into a quote',pending ? 'Review '+buyerOf(pending).name+'’s '+pending.id+' enquiry.' : 'All current enquiries are confirmed. Add the next buyer request.',pending ? url('enquiry-detail','id='+pending.id) : url('enquiries'),'Review enquiry'] : ['A clear view of the day’s priorities','Check open enquiries and keep the next export moving.',url('enquiries'),'Review enquiries'];
    main.innerHTML = `<div class="ds-demo__callout ds-demo__line"><div><h2 class="ds-h3">${focus[0]}</h2><p>${focus[1]}</p></div>${link(focus[3],focus[2],'primary','arrow-right')}</div><ul class="ds-stats">${stat('Open enquiries',enquiries.length,'Across '+state.buyers.length+' overseas buyers')}${stat('Awaiting quotation',enquiries.filter(e => ['Stock check','Quote ready'].includes(e.status)).length,'Stock checks and quote preparation')}${stat('Open quote value',money(enquiries.reduce((s,e) => s+total(e),0)),'USD · Draft and shared quotes')}${stat('Active shipments',ships.length,ships.reduce((s,x) => s+x.cartons,0)+' cartons in packing or transit')}</ul><div class="ds-demo__split"><div class="ds-stack">${card('Enquiry mix','Current sample records across all buyers.',`<div data-ds-chart-panel>${chartHTML()}</div><div class="ds-demo__state-controls"><span>Preview panel states:</span>${button('Loading','panel-loading','','ghost')}${button('Error','panel-error','','ghost')}${button('Restore','panel-restore','','ghost')}</div>`)}${card('Needs attention','Open enquiries ordered by the next action.',`<ul class="ds-demo__list">${enquiries.slice(0,4).map(e => `<li><a class="ds-demo__row-link" href="${url('enquiry-detail','id='+e.id)}"><span class="ds-demo__row-icon">${icon(e.status === 'Stock check' ? 'package' : 'file-text')}</span><span class="ds-demo__row-body"><strong>${esc(buyerOf(e).name)}</strong><small>${e.id} · Due ${date(e.due)}</small></span>${badge(e.status)}</a></li>`).join('')}</ul>`,link('View all',url('enquiries'),'ghost'))}</div><div class="ds-stack">${card('Shipment focus','Active exports ordered by departure date.',`<ul class="ds-demo__list">${ships.map(s => `<li><a class="ds-demo__row-link" href="${url('shipment-detail','id='+s.id)}"><span class="ds-demo__row-icon">${icon('truck')}</span><span class="ds-demo__row-body"><strong>${esc(buyerOf(enquiryOf(s)).port)}</strong><small>${s.id} · ETA ${date(s.eta)}</small><br>${badge(s.status)}</span>${icon('chevron-right',true)}</a></li>`).join('') || '<li>No active shipments.</li>'}</ul>`,link('View all',url('shipments'),'ghost'))}${card('Recent milestones','Latest updates from the shipment trail.',timeline(state.shipments.flatMap(s => s.events.map(e => ({...e,title:e.status,status:e.status,text:s.id+' · '+e.text}))).sort((a,b) => b.date.localeCompare(a.date)).slice(0,3)))}</div></div>`;
  }

  function newPart(index) {
    return `<fieldset class="ds-demo__note" data-ds-new-part><legend class="ds-small">Part ${index+1}</legend><div class="ds-demo__form-grid">${field('part-code-'+index,'Part number','text','','required maxlength="40"')}${field('part-name-'+index,'Description','text','','required maxlength="120"')}${field('part-qty-'+index,'Quantity (pcs)','number','1','required min="1" max="100000" step="1"')}${field('part-price-'+index,'Unit price (USD)','number','0','required min="0.01" max="1000000" step="0.01"')}</div></fieldset>`;
  }
  function enquiries() {
    let list = state.enquiries;
    const selected = params.get('status') || 'All statuses';
    if (selected !== 'All statuses') list = list.filter(e => e.status === selected);
    const buyerId = params.get('buyer');
    if (buyerId) list = list.filter(e => e.buyer === buyerId);
    const b = state.buyers.find(b => b.id === buyerId);
    main.innerHTML = `${b ? alert('Enquiries for '+b.name,'Showing this buyer’s records. Use Clear filters to return to all buyers.') : ''}<div class="ds-demo__line"><p class="ds-small ds-muted">${list.length} enquiries · USD prices</p><div class="ds-demo__actions">${selected !== 'All statuses' || buyerId ? link('Clear filters',url('enquiries'),'ghost') : ''}${button('Add enquiry','open-new-enquiry','plus','primary')}</div></div>${table('enquiries-table','Enquiries',['Enquiry','Buyer','Status','Quote value (USD)','Due','Owner','Action'],list.map(enquiryRow),{search:true,selection:true,filter:params.get('q') || '',pageSize:true,tools:select('status-filter','Status',[['All statuses','All statuses'],...['Stock check','Quote ready','Quoted','Confirmed'].map(x => [x,x])],selected,'data-ds-filter-status')})}`;
    document.querySelector('[data-ds-dialogs]').insertAdjacentHTML('beforeend',dialog('new-enquiry','Add enquiry','Record a buyer’s request. Stock starts at zero until checked.',`${select('new-buyer','Buyer',state.buyers.map(b => [b.id,b.name]),b?.id || state.buyers[0].id)}${field('new-subject','Enquiry subject','text','','required maxlength="160"')}${select('new-category','Parts family',['Land Rover spares','Scooter spares','Truck spares','Tractor spares'].map(x => [x,x]),'Land Rover spares')}<div class="ds-demo__form-grid">${select('new-owner','Sales owner',[['Rohit Mehra','Rohit Mehra'],['Priya Khanna','Priya Khanna']],'Rohit Mehra')}${field('new-due','Response due','date',state.asOf,'required')}</div><div data-ds-new-parts>${newPart(0)}</div>${button('Add another part','add-part','plus')}`,'Save enquiry','new-enquiry'));
  }
  function detail() {
    const id = params.get('id') || 'ENQ-26048';
    const e = state.enquiries.find(e => e.id === id);
    if (!e) { main.innerHTML = empty('Enquiry not found','This record is not in the current demo.',link('View enquiries',url('enquiries'),'primary')); return; }
    document.querySelector('h1').textContent = e.id;
    document.querySelector('[data-ds-subtitle]').textContent = e.subject;
    const b = buyerOf(e), s = shipmentOf(e), short = shortages(e);
    const action = e.status === 'Stock check' ? button('Mark stock checked','stock-checked','check','primary') : e.status === 'Quote ready' ? button('Mark quote shared','share-quote','send','primary') : e.status === 'Quoted' ? button('Confirm quote','confirm-quote','check','primary') : s ? link('Open shipment',url('shipment-detail','id='+s.id),'primary','truck') : button('Create shipment','create-shipment','truck','primary');
    const stockTable = table('stock-table','Requested parts',['Part','Description','Requested','Available','Availability'],e.items.map(i => [esc(i.part),esc(i.name),i.qty+' '+i.unit,i.stock+' '+i.unit,badge(i.stock >= i.qty ? 'Confirmed' : 'Stock check').replace('Confirmed','In stock').replace('Stock check',`${i.qty-i.stock} short`)]));
    const quoteTable = table('quote-table','Quote lines',['Part','Description','Quantity','Unit price (USD)','Line total (USD)'],e.items.map(i => [esc(i.part),esc(i.name),i.qty+' '+i.unit,money(i.price),money(i.qty*i.price)]));
    const panels = [
      ['parts','Parts and stock',`<div class="ds-stack">${short.length ? alert(`${short.length} part ${short.length === 1 ? 'line needs' : 'lines need'} a stock decision`,short.map(i => `${i.part}: ${i.qty-i.stock} ${i.unit} short`).join('; '),'warning') : alert('All requested quantities are available','Review the quantities before marking the stock check complete.','success')}${card('Buyer’s parts list',e.items.length+' lines · Quantities in the buyer’s requested units.',stockTable,e.status === 'Confirmed' ? '' : button('Edit stock','open-stock','edit'))}${card('Enquiry details','The buyer, owner and delivery terms.',dl([['Buyer',`<a href="${url('buyers','q='+encodeURIComponent(b.name))}">${esc(b.name)}</a>`],['Contact',esc(b.contact)+' · '+esc(b.email)],['Destination',esc(b.port+', '+b.country)],['Received',date(e.received)],['Response due',date(e.due)],['Sales owner',esc(e.owner)],['Trade terms',esc(e.incoterm)],['Payment terms',esc(b.terms)]]))}</div>`],
      ['quotation','Quotation',`<div class="ds-stack">${card('Quotation '+e.id.replace('ENQ','Q'),'USD · '+esc(e.incoterm)+' · Valid for 14 days from '+date(e.received)+'.',quoteTable,e.status === 'Confirmed' ? '' : button('Edit quotation','open-quote','edit'))}<div class="ds-demo__split">${card('Buyer terms','Review before sharing or confirming.',dl([['Buyer',esc(b.name)],['Payment',esc(b.terms)],['Incoterm',esc(e.incoterm)],['Freight','Not included in this FOB quotation'],['Status',badge(e.status)]]))}${card('Quotation total','Calculated from the same lines shown above.',`<div class="ds-demo__summary"><span class="ds-demo__quote-total">${money(total(e))}</span><p>USD · ${e.items.length} lines</p><p>FOB pricing. Destination taxes, duties and freight excluded.</p><div class="ds-demo__actions">${button('Download quote','download-quote','download')}</div></div>`)}</div>${alert('Demo quote workflow','Marking a quote shared records the action locally. Use Confirm quote after the buyer has accepted; no email or commercial order is sent.')}</div>`],
      ['notes','Notes and activity',`<div class="ds-stack">${card('Coordination notes','Keep buyer instructions and follow-ups with this enquiry.',`<div class="ds-stack">${e.notes.length ? e.notes.map(n => `<article class="ds-demo__note"><p>${esc(n.text)}</p><small>${esc(n.by)} · ${date(n.date)}</small></article>`).join('') : '<p class="ds-small ds-muted">No notes yet. Add packing instructions or a buyer follow-up.</p>'}<form class="ds-demo__form" data-ds-form="note">${textarea('note-text','Add a note','','required maxlength="2000"')}<div>${'<button type="submit" class="ds-btn ds-btn--primary">Save note</button>'}</div></form></div>`)}${card('Activity trail','The enquiry and its linked shipment.',timeline([{date:e.received,status:'Enquiry received',text:e.subject,by:e.owner},...(e.stockDate ? [{date:e.stockDate,status:'Stock checked',text:'All requested quantities reviewed.',by:e.owner}] : []),...(e.sharedDate ? [{date:e.sharedDate,status:'Quote marked shared',text:'Recorded in the demo; no email sent.',by:e.owner}] : []),...(e.confirmedDate ? [{date:e.confirmedDate,status:'Quote confirmed',text:'Buyer acceptance recorded in the demo.',by:e.owner}] : [])].reverse()))}</div>`]
    ];
    main.innerHTML = `<div class="ds-demo__line"><div class="ds-demo__actions">${badge(e.status)}<span class="ds-small ds-muted">${esc(b.name)} · ${esc(b.country)}</span></div><div class="ds-demo__actions">${link('All enquiries',url('enquiries'),'ghost')}${action}</div></div><div class="ds-tabs" data-ds-tabs data-ds-tabs-hash><div class="ds-scroll-area" data-ds-scroll-area><div class="ds-scroll ds-scroll--x"><div class="ds-tabs__list" role="tablist" aria-label="Enquiry sections">${panels.map(([id,label],i) => `<button type="button" class="ds-tabs__tab" role="tab" id="tab-${id}" aria-controls="${id}" aria-selected="${i===0}" tabindex="${i===0 ? 0 : -1}" data-ds-ripple>${label}</button>`).join('')}</div></div></div>${panels.map(([id,label,body],i) => `<div class="ds-tabs__panel" role="tabpanel" id="${id}" aria-labelledby="tab-${id}" tabindex="0" ${i ? 'hidden' : ''}>${body}</div>`).join('')}</div>`;
    if (e.status !== 'Confirmed') document.querySelector('[data-ds-dialogs]').insertAdjacentHTML('beforeend',
      dialog('edit-stock','Edit stock','Record available quantities for this enquiry. This does not update a live inventory.',e.items.map((i,n) => field('stock-'+n,i.part+' · '+i.name+' ('+i.unit+')','number',i.stock,'required min="0" max="1000000" step="1"')).join(''),'Save stock','stock') +
      dialog('edit-quote','Edit quotation','Set unit prices in USD. Totals update from the requested quantities.',e.items.map((i,n) => field('price-'+n,i.part+' · '+i.qty+' '+i.unit,'number',i.price,'required min="0.01" max="1000000" step="0.01"')).join(''),'Save quotation','quote'));
  }

  function buyers() {
    const rows = state.buyers.map(b => {
      const enqs = state.enquiries.filter(e => e.buyer === b.id);
      return [`<div class="ds-demo__table-company"><span class="ds-table__primary">${esc(b.name)}</span><span class="ds-table__sub">${esc(b.category)}</span></div>`,esc(b.city+', '+b.country),`<div class="ds-demo__table-company">${esc(b.contact)}<span class="ds-table__sub">${esc(b.email)}</span></div>`,String(enqs.length),money(enqs.filter(e => e.status !== 'Confirmed').reduce((s,e) => s+total(e),0)),link('View enquiries',url('enquiries','buyer='+b.id),'ghost','arrow-right')];
    });
    main.innerHTML = `<div class="ds-demo__line"><p class="ds-small ds-muted">${state.buyers.length} overseas buyers · Contacts are fictional</p>${button('Add buyer','open-buyer','plus','primary')}</div>${table('buyers-table','Buyers',['Buyer','Location','Contact','Enquiries','Open value (USD)','Action'],rows,{search:true,filter:params.get('q') || '',pageSize:true})}${alert('Buyer to enquiry','Use View enquiries to see every request from a buyer, then open a request to review its parts and quotation.')}`;
    document.querySelector('[data-ds-dialogs]').insertAdjacentHTML('beforeend',dialog('new-buyer-dialog','Add buyer','Add a fictional buyer for your walkthrough.',`${field('buyer-name','Company name','text','','required maxlength="120"')}${field('buyer-contact','Contact name','text','','required maxlength="100"')}${field('buyer-email','Email address','email','','required maxlength="160"')}<div class="ds-demo__form-grid">${field('buyer-city','City','text','','required maxlength="80"')}${field('buyer-country','Country','text','','required maxlength="80"')}</div>${field('buyer-port','Destination port','text','','required maxlength="80"')}${select('buyer-category','Main parts family',['Land Rover spares','Scooter spares','Truck spares','Tractor spares'].map(x => [x,x]),'Land Rover spares')}${field('buyer-terms','Payment terms','text','100% before dispatch','required maxlength="160"')}`,'Save buyer','buyer'));
  }
  function shipments() {
    const filter = params.get('status') || 'All statuses';
    const list = state.shipments.filter(s => filter === 'All statuses' || s.status === filter);
    main.innerHTML = `<ul class="ds-stats">${stat('In packing',state.shipments.filter(s => s.status === 'Packing').length,'Preparing export cartons')}${stat('Ready to dispatch',state.shipments.filter(s => s.status === 'Ready to dispatch').length,'Documents and quantities checked')}${stat('In transit',state.shipments.filter(s => s.status === 'In transit').length,'Manual milestone updates')}${stat('Delivered',state.shipments.filter(s => s.status === 'Delivered').length,'Buyer delivery acknowledged')}</ul>${table('shipments-table','Shipments',['Shipment','Destination','Status','Packing','Quote value (USD)','ETA','Action'],list.map(shipmentRow),{search:true,selection:true,pageSize:true,tools:select('shipment-filter','Status',[['All statuses','All statuses'],...['Packing','Ready to dispatch','In transit','Delivered'].map(x => [x,x])],filter,'data-ds-filter-shipment')})}${alert('Create a shipment from a confirmed quote','Open a confirmed enquiry and choose Create shipment. The buyer, parts and quote value carry through automatically.')}`;
  }
  function shipmentDetail() {
    const id = params.get('id') || 'SHP-26017';
    const s = state.shipments.find(s => s.id === id);
    if (!s) { main.innerHTML = empty('Shipment not found','This record is not in the current demo.',link('View shipments',url('shipments'),'primary')); return; }
    const e = enquiryOf(s), b = buyerOf(e), stages = ['Packing','Ready to dispatch','In transit','Delivered'], current = stages.indexOf(s.status);
    document.querySelector('h1').textContent = s.id;
    document.querySelector('[data-ds-subtitle]').textContent = b.name+' · '+e.category;
    main.innerHTML = `<div class="ds-demo__line"><div class="ds-demo__actions">${badge(s.status)}<span class="ds-small ds-muted">${e.id}</span></div><div class="ds-demo__actions">${link('All shipments',url('shipments'),'ghost')}${s.status === 'Delivered' ? '' : button('Update shipment','open-shipment','edit','primary')}</div></div><ol class="ds-stepper" aria-label="Shipment progress">${stages.map((stage,i) => `<li class="ds-stepper__step" ${i < current || current === 3 ? 'data-state="done"' : ''} ${i === current ? 'aria-current="step"' : ''}><span class="ds-stepper__marker" aria-hidden="true">${i < current || current === 3 ? icon('check',true) : i+1}</span><span class="ds-stepper__label"><span class="ds-sr-only">${i < current ? 'Completed: ' : i === current ? 'Current: ' : ''}</span>${stage}</span></li>`).join('')}</ol><div class="ds-demo__split"><div class="ds-stack">${card('Shipment overview','Gurugram → Nhava Sheva → '+esc(b.port),`<p class="ds-demo__route">${esc(b.port)}, ${esc(b.country)}</p>${dl([['Buyer',esc(b.name)],['Carrier',esc(s.carrier)],['Booking reference',esc(s.reference)],['Scheduled departure',date(s.etd)],['Expected arrival',date(s.eta)],['Packing',s.cartons+' cartons · '+s.weight+' kg gross'],['Trade terms',esc(e.incoterm)],['Linked enquiry',`<a href="${url('enquiry-detail','id='+e.id)}">${e.id}: ${esc(e.subject)}</a>`],['Quote value',money(total(e))+' USD']])}`)}${card('Milestone history','Manually recorded updates, newest first.',timeline([...s.events].reverse()))}</div><div class="ds-stack">${card('Shipment documents','Generated from the linked enquiry.',`<ul class="ds-demo__list"><li><div class="ds-demo__row-link"><span class="ds-demo__row-icon">${icon('file-text')}</span><span class="ds-demo__row-body"><strong>Packing list</strong><small>Parts, quantities, cartons and weight</small></span></div><div class="ds-demo__actions">${button('Download CSV','download-packing','download')}</div></li><li><div class="ds-demo__row-link"><span class="ds-demo__row-icon">${icon('receipt')}</span><span class="ds-demo__row-body"><strong>Invoice preview</strong><small>Illustrative quotation value in USD</small></span></div><div class="ds-demo__actions">${button('Download preview','download-invoice','download')}</div></li></ul>`)}${card('Buyer instructions','Notes from the source enquiry.',e.notes.length ? e.notes.map(n => `<article class="ds-demo__note"><p>${esc(n.text)}</p><small>${esc(n.by)}</small></article>`).join('') : '<p class="ds-small ds-muted">No special packing instructions have been recorded.</p>')}${alert('Manual tracking demo','These milestones are sample updates. No carrier tracking service is connected.')}</div></div>${card('Packed parts','The same quantities and prices as the confirmed enquiry.',table('packing-parts','Packed parts',['Part','Description','Quantity','Line value (USD)'],e.items.map(i => [esc(i.part),esc(i.name),i.qty+' '+i.unit,money(i.qty*i.price)])))}`;
    if (s.status !== 'Delivered') document.querySelector('[data-ds-dialogs]').insertAdjacentHTML('beforeend',dialog('update-shipment','Update shipment','Add the next milestone and keep the packing details current.',`${select('ship-status','Milestone',stages.slice(current,current+2).map(x => [x,x]),s.status)}<div class="ds-demo__form-grid">${field('ship-cartons','Cartons','number',s.cartons,'required min="1" max="100000" step="1"')}${field('ship-weight','Gross weight (kg)','number',s.weight,'required min="0.1" max="1000000" step="0.1"')}</div>${field('ship-carrier','Carrier','text',s.carrier,'required maxlength="120"')}${field('ship-reference','Booking reference','text',s.reference,'required maxlength="100"')}<div class="ds-demo__form-grid">${field('ship-etd','Scheduled departure','date',s.etd,'required')}${field('ship-eta','Expected arrival','date',s.eta,'required')}</div>${textarea('ship-note','Update note','','required maxlength="1000"')}`,'Save update','shipment'));
  }

  const currentEnquiry = () => state.enquiries.find(e => e.id === (params.get('id') || 'ENQ-26048'));
  const currentShipment = () => state.shipments.find(s => s.id === (params.get('id') || 'SHP-26017'));
  function newId(prefix,records,start) { const max = Math.max(start-1,...records.map(x => Number(x.id.split('-')[1]))); return prefix+'-'+(max+1); }
  function download(name,text,type = 'text/plain;charset=utf-8') {
    const blob = new Blob([text],{type});
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href),1000);
    toast(name+' downloaded');
  }
  function csv(rows) {
    return '\uFEFF'+rows.map(row => row.map(v => {
      let value = String(v ?? '');
      if (/^[=+@\-\t\r]/.test(value)) value = "'"+value;
      return '"'+value.replace(/"/g,'""')+'"';
    }).join(',')).join('\r\n');
  }
  const clean = (form,id) => form.elements.namedItem(id).value.trim();
  const formError = (form,message) => { const node = form.querySelector('[data-ds-form-error]'); if (node) { node.textContent = message; node.hidden = false; } else toast(message,'danger'); };

  document.addEventListener('change',event => {
    const el = event.target;
    if (el.id === 'demo-role') { state.role = el.value; go('Switched to '+state.role+' view'); }
    if (el.matches('[data-ds-filter-status], [data-ds-filter-shipment]')) {
      const next = new URL(location.href); next.searchParams.set('status',el.value); location.href = next.href;
    }
  });
  document.addEventListener('click',event => {
    const el = event.target.closest('[data-ds-action]');
    if (!el) return;
    const action = el.dataset.dsAction, e = currentEnquiry();
    const open = id => document.getElementById(id).showModal();
    if (action === 'open-new-enquiry') open('new-enquiry');
    if (action === 'add-part') { const list = document.querySelector('[data-ds-new-parts]'); list.insertAdjacentHTML('beforeend',newPart(list.children.length)); list.lastElementChild.querySelector('input').focus(); }
    if (action === 'open-buyer') open('new-buyer-dialog');
    if (action === 'open-stock') open('edit-stock');
    if (action === 'open-quote') open('edit-quote');
    if (action === 'open-shipment') open('update-shipment');
    if (action === 'reset') { state = clone(SEED); go('Sample data restored',root+'index.html'); }
    if (action === 'clear-search') { const input = el.closest('[data-ds-data-table]').querySelector('[data-ds-data-table-filter]'); input.value = ''; input.dispatchEvent(new Event('input',{bubbles:true})); input.focus(); }
    if (action === 'stock-checked') {
      if (shortages(e).length) return toast('Resolve the stock shortage before completing this check.','warning');
      e.stockChecked = true; e.stockDate = today(); e.status = 'Quote ready'; go('Stock checked. Quotation is ready to review.',url('enquiry-detail','id='+e.id)+'#quotation');
    }
    if (action === 'share-quote') { e.status = 'Quoted'; e.sharedDate = today(); go('Quote marked shared in the demo. No email was sent.'); }
    if (action === 'confirm-quote') {
      if (shortages(e).length || !e.stockChecked) return toast('Complete the stock check before confirming.','warning');
      e.status = 'Confirmed'; e.confirmedDate = today(); go('Quote confirmed. You can now create a shipment.');
    }
    if (action === 'create-shipment') {
      if (e.status !== 'Confirmed') return toast('Confirm the quote before creating a shipment.','warning');
      if (shipmentOf(e)) { location.href = url('shipment-detail','id='+shipmentOf(e).id); return; }
      const id = newId('SHP',state.shipments,26019);
      state.shipments.unshift({id,enquiry:e.id,status:'Packing',carrier:'To be assigned',reference:'Booking pending',cartons:0,weight:0,etd:state.asOf,eta:state.asOf,events:[{date:today(),status:'Packing',text:'Shipment created from confirmed quotation. Add cartons, weight and schedule before dispatch.',by:who()}]});
      go('Shipment created. Add packing and schedule details.',url('shipment-detail','id='+id));
    }
    if (action === 'export') {
      const t = document.getElementById(el.dataset.dsTableId);
      const selected = el.hasAttribute('data-ds-selected');
      const headers = [...t.tHead.rows[0].cells].filter(c => !c.classList.contains('ds-table__check') && c.textContent.trim() !== 'Action').map(c => c.textContent.trim());
      const rows = [...t.tBodies[0].rows].filter(r => !r.hidden && !r.classList.contains('ds-table__empty') && (!selected || r.querySelector('[data-ds-table-select]:checked'))).map(r => [...r.cells].filter(c => !c.classList.contains('ds-table__check') && !c.classList.contains('ds-table__actions')).map(c => c.innerText.replace(/\n/g,' ').trim()));
      if (!rows.length) return toast('There are no visible rows to export.','warning');
      download(t.id+'.csv',csv([headers,...rows]),'text/csv;charset=utf-8');
    }
    if (action === 'download-quote') {
      download(e.id.replace('ENQ','QUOTE')+'.csv',csv([['Adhunik Sales','Illustrative quotation'],['Enquiry',e.id],['Buyer',buyerOf(e).name],['Currency','USD'],['Terms',e.incoterm],['Part','Description','Quantity','Unit','Unit price (USD)','Line total (USD)'],...e.items.map(i => [i.part,i.name,i.qty,i.unit,i.price,(i.qty*i.price).toFixed(2)]),['Total USD',total(e).toFixed(2)],['Exclusions','Freight, destination taxes and duties']]),'text/csv;charset=utf-8');
    }
    if (action === 'download-packing' || action === 'download-invoice') {
      const s = currentShipment(), q = enquiryOf(s), b = buyerOf(q);
      const packing = action === 'download-packing';
      download(s.id+(packing ? '-packing-list.csv' : '-invoice-preview.csv'),csv([['Adhunik Sales',packing ? 'Sample packing list' : 'Illustrative invoice preview'],['Shipment',s.id],['Enquiry',q.id],['Buyer',b.name],['Destination',b.port+', '+b.country],['Cartons',s.cartons],['Gross weight kg',s.weight],['Currency','USD'],['Part','Description','Quantity','Unit',...(packing ? [] : ['Unit price USD','Line total USD'])],...q.items.map(i => [i.part,i.name,i.qty,i.unit,...(packing ? [] : [i.price,(i.qty*i.price).toFixed(2)])]),...(packing ? [] : [['Total USD',total(q).toFixed(2)],['Terms',q.incoterm],['Exclusions','Freight, destination taxes and duties']]),['Notice','Fictional demo document. Not a commercial export document.']]),'text/csv;charset=utf-8');
    }
    if (action.startsWith('panel-')) {
      const panel = document.querySelector('[data-ds-chart-panel]');
      if (action === 'panel-loading') panel.innerHTML = '<div role="status" aria-busy="true" class="ds-stack"><span class="ds-sr-only">Loading enquiry chart preview</span><span class="ds-skeleton ds-skeleton--title"></span><span class="ds-skeleton ds-skeleton--media"></span><p class="ds-small ds-muted">Loading preview. Choose Restore to return to the chart.</p></div>';
      if (action === 'panel-error') panel.innerHTML = empty('Enquiry mix could not load','This is an error-state preview. Retry restores the sample chart.',button('Try again','panel-restore','refresh'));
      if (action === 'panel-restore') { panel.innerHTML = chartHTML(); window.DS.chart.init(panel.querySelector('[data-ds-chart]')); }
    }
  });
  document.addEventListener('submit',event => {
    const form = event.target.closest('[data-ds-form]');
    if (!form) return;
    event.preventDefault();
    if (!form.reportValidity()) return;
    const type = form.dataset.dsForm, e = currentEnquiry();
    if (type === 'new-enquiry') {
      const items = [...form.querySelectorAll('[data-ds-new-part]')].map((_,n) => ({part:clean(form,'part-code-'+n),name:clean(form,'part-name-'+n),qty:Number(clean(form,'part-qty-'+n)),price:Number(clean(form,'part-price-'+n)),stock:0,unit:'pcs'}));
      if (!clean(form,'new-subject') || items.some(i => !i.part || !i.name)) return formError(form,'Enter a subject, part number and description.');
      if (new Set(items.map(i => i.part.toLowerCase())).size !== items.length) return formError(form,'Each part number must be unique within the enquiry.');
      if (clean(form,'new-due') < state.asOf) return formError(form,'Choose a response date on or after '+date(state.asOf)+'.');
      const id = newId('ENQ',state.enquiries,26049);
      state.enquiries.unshift({id,buyer:clean(form,'new-buyer'),subject:clean(form,'new-subject'),category:clean(form,'new-category'),owner:clean(form,'new-owner'),received:state.asOf,due:clean(form,'new-due'),status:'Stock check',incoterm:'FOB Nhava Sheva',freight:0,stockChecked:false,items,notes:[]});
      go('Enquiry saved. Review availability in Parts and stock.',url('enquiry-detail','id='+id));
    }
    if (type === 'stock') {
      e.items.forEach((i,n) => i.stock = Number(clean(form,'stock-'+n)));
      e.stockChecked = false; e.status = 'Stock check';
      go('Availability saved. Mark stock checked when all quantities are ready.');
    }
    if (type === 'quote') {
      e.items.forEach((i,n) => i.price = Number(clean(form,'price-'+n)));
      if (e.status === 'Quoted') e.status = 'Quote ready';
      go('Quotation saved. Review the total before sharing.',url('enquiry-detail','id='+e.id)+'#quotation');
    }
    if (type === 'note') {
      const text = clean(form,'note-text');
      if (!text) return formError(form,'Enter a note before saving.');
      e.notes.unshift({date:today(),text,by:who()}); go('Note saved.',url('enquiry-detail','id='+e.id)+'#notes');
    }
    if (type === 'buyer') {
      const fields = ['buyer-name','buyer-contact','buyer-email','buyer-city','buyer-country','buyer-port','buyer-terms'];
      if (fields.some(id => !clean(form,id))) return formError(form,'Complete all buyer fields.');
      if (state.buyers.some(b => b.name.toLowerCase() === clean(form,'buyer-name').toLowerCase())) return formError(form,'A buyer with this company name already exists.');
      state.buyers.push({id:'B-'+(Math.max(100,...state.buyers.map(b => Number(b.id.slice(2))))+1),name:clean(form,'buyer-name'),contact:clean(form,'buyer-contact'),email:clean(form,'buyer-email'),city:clean(form,'buyer-city'),country:clean(form,'buyer-country'),port:clean(form,'buyer-port'),terms:clean(form,'buyer-terms'),category:clean(form,'buyer-category')});
      go('Buyer saved. You can now add an enquiry for this buyer.');
    }
    if (type === 'shipment') {
      const s = currentShipment();
      if (clean(form,'ship-eta') < clean(form,'ship-etd')) return formError(form,'Expected arrival must be on or after departure.');
      if (!clean(form,'ship-note') || !clean(form,'ship-carrier') || !clean(form,'ship-reference')) return formError(form,'Enter a carrier, booking reference and update note.');
      const stage = clean(form,'ship-status');
      if (['Ready to dispatch','In transit','Delivered'].includes(stage) && (['To be assigned',''].includes(clean(form,'ship-carrier')) || ['Booking pending',''].includes(clean(form,'ship-reference')))) return formError(form,'Assign a carrier and booking reference before progressing beyond packing.');
      Object.assign(s,{status:stage,cartons:Number(clean(form,'ship-cartons')),weight:Number(clean(form,'ship-weight')),carrier:clean(form,'ship-carrier'),reference:clean(form,'ship-reference'),etd:clean(form,'ship-etd'),eta:clean(form,'ship-eta')});
      s.events.push({date:today(),status:stage,text:clean(form,'ship-note'),by:who()});
      go('Shipment update saved.');
    }
  });

  common();
  ({overview,map:mapPage,dashboard,enquiries,'enquiry-detail':detail,buyers,shipments,'shipment-detail':shipmentDetail})[page]();
  const flash = state.flash; delete state.flash; save();
  window.addEventListener('load',() => { if (flash) toast(flash); });
})();
