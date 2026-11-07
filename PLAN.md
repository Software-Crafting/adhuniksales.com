# Adhunik Sales demo plan

Plain HTML, CSS and vanilla JS. Local first; GitHub Pages ready. Inter, orange primary, pink accent and grey neutrals derived from adhuniksales.com branding.

| Page | File | Starting screen and components | Sample data |
| --- | --- | --- | --- |
| Overview | index.html | templates/site/landing; hero, feature-grid, card, badge | Owner, sales, dispatch; links to every screen |
| Page map | map.html | templates/site/landing; card, stepper, link-list | Enquiry to shipment navigation by role |
| Dashboard | pages/dashboard.html | templates/states/error-retry; app-shell, sidebar, page-header, stat, chart, timeline, card | Shared enquiry totals, quote values, shipment milestones |
| Enquiries | pages/enquiries.html | templates/states/no-results; data-table, select, dialog, toast | Eight export enquiries, mixed part lists, owners and due dates |
| Enquiry detail | pages/enquiry-detail.html | templates/states/error-retry; tabs, table, description-list, dialog, timeline, alert | Stock quantities, USD quotes, notes and linked shipment |
| Buyers | pages/buyers.html | templates/states/no-results; data-table, dialog, description-list | Six fictional importers in UK, Kenya, Sri Lanka, UAE, South Africa, NZ |
| Shipments | pages/shipments.html | templates/states/no-results; data-table, badge, stat | Three shipments linked to confirmed quotes |
| Shipment detail | pages/shipment-detail.html | templates/states/error-retry; stepper, timeline, table, description-list, dialog | Cartons, weights, carrier, destination, milestones and document download |

Navigation: overview links to every page and map. All app pages share Dashboard / Enquiries / Buyers / Shipments navigation. Buyer rows filter enquiries; enquiry rows open their detail; confirmed quotes create or open a shipment; shipment rows open shipment detail; shipment detail returns to the source enquiry. Roles change the dashboard's suggested task, with every demo screen available.

All sample records live in assets/demo-data.js. Local browser storage saves edits; same-tab fallback supports restricted file storage. Build search, sorting, new enquiries, stock editing, quote preparation/approval, CSV/document downloads, notes, shipment updates, and deliberate loading/error previews using the copied components.
