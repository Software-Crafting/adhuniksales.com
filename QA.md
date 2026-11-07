# Verification

Verified locally on 7 November 2026 using Chromium and the existing Playwright tooling. No test dependencies were added to this project.

- All eight pages opened at 320, 375, 390, 640, 768, 1024, 1280, 1440 and 1920 px (72 page/viewport checks): one h1 per page, no document-level horizontal overflow, split currency values, hidden record actions, missing icons, JavaScript errors or failed asset requests.
- Touch-device emulation at 320, 375, 390 and 768 px passed all eight pages (32 additional checks), including tapping role and form dropdowns.
- 35 open-menu checks verified placement within the viewport, readable role/status labels and clickable options in dialogs. Forms were checked at every width, plus short landscape and small phone viewports.
- All rendered page links resolved successfully.
- WCAG A/AA automated scans: no violations on the eight desktop pages and the new-enquiry dialog, or the eight mobile pages with open role-menu, sidebar and dialog-menu states. Automated scanning does not replace a full accessibility audit.
- All 33 design-system colour contrast pairs passed after rebranding.
- Stock shortage blocked completion; editing availability allowed stock confirmation, quote preparation, price editing, quote confirmation and shipment creation.
- Quotation total recalculated from USD 6,380.00 to USD 6,440.00 when the first unit price changed from USD 18.50 to USD 19.00. The quote download contained the same total.
- Shipment update validation rejected arrival before departure. Saved cartons, gross weight, booking details and milestone status persisted across navigation. Packing-list downloads contained the saved data.
- Multi-part enquiry creation, buyer creation, note saving, search, no-results clearing, paging, sorting and selected-row CSV export passed.
- Owner/Sales role switching, chart/table view switching, loading/error previews and retry passed.
- Mobile dialog scrolling, Escape dismissal, sidebar focus trapping and return, resize-to-desktop cleanup, tab arrow-key navigation and skip-link focus passed.
- Duplicate step numbers were removed. Record cards keep actions visible on tablets, with a working Sort by control, reset to default order, and synchronized desktop header sorting. Header buttons leave the keyboard tab sequence while the card layout is active.
- The dashboard uses the existing donut chart to keep family labels readable on small screens. Stat grids stay balanced, currency values remain on one line, and mobile headers retain the company name.
- Custom-select keyboard filtering and reset confirmation/cancellation passed.
- Direct `file://` navigation and creating an enquiry in the same tab passed.
- Page-specific CSS uses semantic colour tokens. Copied component CSS and JavaScript match the reference files. The design-system repository has no changes.

Reference design-system commit: `f0428d62a374f64fde7af9552b98e0378bde634a`.

Only Chromium was exercised. No live email, carrier, inventory, authentication or backend integration is part of this demo.
