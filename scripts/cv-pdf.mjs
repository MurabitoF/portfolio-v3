// Prints /cv and /es/cv from the built site to public/cv-<lang>.pdf.
// Run after `astro build`; build again afterwards so the site links the PDFs (they only render when the file exists).
import { preview } from 'astro';
import { chromium } from 'playwright';

const port = 4329;
const server = await preview({ root: '.', server: { port }, logLevel: 'warn' });
// CHROMIUM_PATH lets a local machine use its system Chromium instead of Playwright's download.
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
try {
  for (const [lang, path] of [['en', '/cv/'], ['es', '/es/cv/']]) {
    const page = await browser.newPage();
    const res = await page.goto(`http://localhost:${port}${path}`, { waitUntil: 'networkidle' });
    if (!res?.ok()) throw new Error(`${path} answered ${res?.status()}`);
    await page.evaluate(() => document.fonts.ready);
    await page.pdf({ path: `public/cv-${lang}.pdf`, preferCSSPageSize: true, printBackground: true });
    console.log(`public/cv-${lang}.pdf`);
  }
} finally {
  await browser.close();
  await server.stop();
}
