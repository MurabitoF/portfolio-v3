// Prints /cv and /es/cv from the built site to public/cv-<lang>.pdf.
// Run after `astro build`; build again afterwards so the site links the PDFs (they only render when the file exists).
import { preview } from 'astro';
import { chromium } from 'playwright';

const port = 4329;
const server = await preview({ root: '.', server: { port }, logLevel: 'warn' });
// Always Playwright's own Chromium (npx playwright install chromium): another build lays text out differently
// and can push the one-page CV onto a second page.
const browser = await chromium.launch();
try {
  for (const [lang, path] of [['en', '/cv/'], ['es', '/es/cv/']]) {
    const page = await browser.newPage();
    const res = await page.goto(`http://localhost:${port}${path}`, { waitUntil: 'networkidle' });
    if (!res?.ok()) throw new Error(`${path} answered ${res?.status()}`);
    await page.evaluate(() => document.fonts.ready);
    // How full the A4 page is: the print content box (210x297mm minus the 15/12mm @page margins) at 96px/in.
    await page.emulateMedia({ media: 'print' });
    await page.setViewportSize({ width: Math.round((180 / 25.4) * 96), height: 1200 });
    const used = await page.evaluate(() => document.querySelector('.sheet').getBoundingClientRect().height);
    const fill = Math.round((used / ((273 / 25.4) * 96)) * 100);
    const pdf = await page.pdf({ path: `public/cv-${lang}.pdf`, preferCSSPageSize: true, printBackground: true });
    const pages = (pdf.toString('latin1').match(/\/Type\s*\/Page\b(?!s)/g) ?? []).length;
    console.log(`public/cv-${lang}.pdf: ${pages} page(s), ${fill}% of the page used`);
    // The CV is a one-pager; a second page with three lines on it is worse than a failed build.
    if (pages !== 1) throw new Error(`cv-${lang}.pdf has ${pages} pages; trim the content or spacing in src/components/CvSheet.astro`);
  }
} finally {
  await browser.close();
  await server.stop();
}
