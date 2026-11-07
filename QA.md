# Verification

Verified locally on 7 November 2026 using Chromium and the existing Playwright tooling. No test dependencies were added to this project.

- All eight pages opened at 375, 768, 1024 and 1440 px: one h1 per page, no document-level horizontal overflow, missing icons, JavaScript errors or failed asset requests.
- All rendered page links resolved successfully.
- WCAG A/AA automated scan: no violations on the eight pages and the new-enquiry dialog. Automated scanning does not replace a full accessibility audit.
- All 33 design-system colour contrast pairs passed after rebranding.
- Stock shortage blocked completion; editing availability allowed stock confirmation, quote preparation, price editing, quote confirmation and shipment creation.
- Quotation total recalculated from USD 6,380.00 to USD 6,440.00 when the first unit price changed from USD 18.50 to USD 19.00. The quote download contained the same total.
- Shipment update validation rejected arrival before departure. Saved cartons, gross weight, booking details and milestone status persisted across navigation. Packing-list downloads contained the saved data.
- Multi-part enquiry creation, buyer creation, note saving, search, no-results clearing, paging, sorting and selected-row CSV export passed.
- Owner/Sales role switching, chart/table view switching, loading/error previews and retry passed.
- Mobile dialog scrolling, Escape dismissal, sidebar opening and closing, tab arrow-key navigation and skip-link focus passed.
- Custom-select keyboard filtering and reset confirmation/cancellation passed.
- Direct `file://` navigation and creating an enquiry in the same tab passed.
- Page-specific CSS uses semantic colour tokens. Copied component CSS and JavaScript match the reference files. The design-system repository has no changes.

Reference design-system commit: `f0428d62a374f64fde7af9552b98e0378bde634a`.

Only Chromium was exercised. No live email, carrier, inventory, authentication or backend integration is part of this demo.
