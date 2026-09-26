# Time on Your Side

A standalone retirement education guide for someone starting in their early 30s. Static HTML, CSS and JavaScript; no build step, analytics, data collection, or application dependencies. Public site files live in `dist/`.

## Preview and verify

Run `npm run preview`, then open http://localhost:4174. Run `npm test` for the calculator's numeric checks. Serve over HTTP rather than opening the HTML directly (JavaScript uses modules).

## GitHub Pages

The workflow publishes only `dist/` to GitHub Pages on pushes to `main`. In repository Settings → Pages, the deployment source is **GitHub Actions**. Expected URL: https://jiminewlander.github.io/ScottFinance/.

## Annual maintenance

Last fact review: September 26, 2026. Before each tax year:

1. Verify the latest IRS employee deferral, IRA, combined defined-contribution, and income phase-out limits using the linked primary sources in the site.
2. Update `LIMITS` in `dist/math.js`, dated limits/eligibility/methodology in `dist/index.html`, and relevant tests. Search the entire project for the old year and dollar amounts.
3. Recheck tax/withdrawal rules and linked fund descriptions. Do not infer future limits or repeat performance promises from investment media.
4. Run tests and check both calculators, over-limit inputs, zero and negative returns, match calculations, inflation display, keyboard controls, and mobile layout.
5. Push to `main` and verify the Pages deployment and public URL.

## Assumptions

Zero initial balance; end-of-month deposits; effective annual return converted to monthly; reinvested dividends; entered returns assumed net of fees. Default: $500/month, 35 years, 7% hypothetical return. Comparison delays: 0, 5 and 10 years, with the same finish date. Today’s buying power uses 2.5% annual inflation. Contributions and gains in the breakdown remain nominal when inflation adjustment is enabled; the nominal total is displayed alongside the explanation.

The account calculators apply fixed 2026 under-50 limits, with no future limit increases or catch-ups. Roth eligibility and compensation are assumed, not verified. The employer match follows the entered salary/rate/cap, subject to compensation and total-additions limits, and is assumed fully vested. No withdrawals, retirement tax estimate, or personalized allocation is modeled. Content cites IRS, SEC, DOL, fund issuer pages and Investing Simplified—Professor G; the site is unaffiliated with them.

Optional, feature-detected WebMCP exposes `configure_retirement_projection` to update the same visible calculator without saving data or transacting.
