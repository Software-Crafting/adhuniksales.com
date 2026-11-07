# Adhunik Sales demo

A local, clickable export coordination demo built with plain HTML, CSS and vanilla JavaScript. No installation, framework, build step or CDN is required.

## Open locally

Open `index.html` in a browser, or serve this directory:

```bash
cd /home/deepak/SC/adhunik-sales-demo
python3 -m http.server 8000
```

Visit http://localhost:8000. A local server provides consistent storage across browser tabs. Direct `file://` navigation also works; when file storage is restricted, keep the walkthrough in one tab.

## Screens

| Screen | File |
| --- | --- |
| Overview | `index.html` |
| Page map | `map.html` |
| Dashboard | `pages/dashboard.html` |
| Enquiries | `pages/enquiries.html` |
| Enquiry detail, stock and quotation | `pages/enquiry-detail.html` |
| Buyers | `pages/buyers.html` |
| Shipments | `pages/shipments.html` |
| Shipment detail | `pages/shipment-detail.html` |

Detail pages accept `?id=ENQ-26048` and `?id=SHP-26017`. The lists link to the correct record. Buyer links filter the enquiry list.

## Suggested walkthrough

1. Open the dashboard and review the enquiry and shipment priorities. Switch between Owner, Sales and Dispatch in the top bar.
2. Open enquiry `ENQ-26048`. Its wheel bearing kit has 56 available against 80 requested.
3. Choose **Edit stock**, enter 80 available, save, then **Mark stock checked**.
4. Open **Quotation**, edit unit prices if needed, and download the quote CSV. The original quotation total is USD 6,380.00.
5. Choose **Mark quote shared**, then **Confirm quote**. These actions only record progress in the demo.
6. Choose **Create shipment**. The confirmed parts and quote value carry across.
7. Choose **Update shipment**. Set cartons, gross weight, carrier, booking reference, departure and arrival, then record a milestone note. Status can advance one stage at a time.
8. Download the sample packing list or invoice preview. Use the linked enquiry to return to the quote.

Also try adding a buyer, adding an enquiry with multiple parts, saving notes, searching, sorting, status filters, paging and selecting rows. On phones and tablets, records become cards and the Sort by control replaces the table header buttons. CSV exports contain the current page or the selected visible rows. The dashboard provides deliberate loading and error previews with a working retry.

Use **About demo → Reset sample data** to restore the starting records. Data edits persist in browser storage; they do not change `assets/demo-data.js`. To change the shipped sample data, edit that file and reset the browser demo.

## Publish with GitHub Pages

The repository is [Software-Crafting/adhuniksales.com](https://github.com/Software-Crafting/adhuniksales.com). In GitHub **Settings → Pages**, choose **Deploy from a branch**, select `main` and **/(root)**. Keep `.nojekyll` in the repository. All asset and page paths are relative, so the demo supports `https://software-crafting.github.io/adhuniksales.com/`.

GitHub Pages activation is managed separately in the repository settings.

## Design system and custom code

Runtime component folders, tokens, the Inter font and icon sprite were copied from [Software Crafting's design system](https://github.com/Software-Crafting/design-system). The reference repository was kept unchanged. Component documentation, tools and templates are not included in the delivered site.

Brand colours live only in `tokens/theme.css`. The orange and grey palette and pink monogram come from [Adhunik Sales' website](https://adhuniksales.com/); action colours are darkened for accessible contrast. The downloaded monogram is `assets/logo.jpg`.

Custom work consists of page assembly, `assets/demo.css` for composition, `assets/demo-data.js` for fictional records, `assets/demo.js` for linked records, browser persistence, validation, workflow transitions and downloads, and `assets/demo-ui.js` for dropdown placement, responsive sorting and overlay focus management. The existing components provide the shell, tables, sorting/filtering/paging, tabs, custom selects, dialogs, chart, scroll areas and toast notifications.

Every page has a top attribution strip linking to Software Crafting Technologies, with `utm_source=adhunik-sales-demo`, `utm_medium=demo`, `utm_campaign=adhunik-sales-demo` and a page-specific `utm_content` such as `index-top`. Its measured height keeps sticky navigation aligned when the text wraps on a phone. The agency credit is not duplicated in the footer.

This is a demonstration, with fictional buyers and commercial records. There is no backend, authentication, real email delivery, shared inventory or carrier integration. Roles are walkthrough views, not access controls. All downloaded documents are illustrative CSV files.
