#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const repoRoot = path.resolve(new URL("../..", import.meta.url).pathname);
const docsDir = path.join(repoRoot, "docs");
const reviewDir = path.join(repoRoot, "outputs", "review");
const finalPdf = path.join(
  reviewDir,
  "youtube-donation-dsa-method-full-website-anonymized-review-copy.pdf",
);

const bundledNodeModules =
  process.env.PLAYWRIGHT_NODE_MODULES ||
  "/Users/au760299/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules";

const pageSpecs = [
  {
    id: "main-page",
    title: "Main Page",
    source: path.join(docsDir, "index.html"),
  },
  {
    id: "notebooks-page",
    title: "Notebooks Subpage",
    source: path.join(docsDir, "notebooks.html"),
  },
  {
    id: "notebook-01",
    title: "01 Clean Donated YouTube Watch Data",
    source: path.join(docsDir, "scripts", "01_clean_donated_watch_data.html"),
  },
  {
    id: "notebook-02",
    title: "02 Clean Donated YouTube Search Data",
    source: path.join(docsDir, "scripts", "02_clean_donated_search_data.html"),
  },
  {
    id: "notebook-03",
    title: "03 Scrape YouTube Metadata With yt-dlp",
    source: path.join(docsDir, "scripts", "03_scrape_youtube_metadata.html"),
  },
  {
    id: "notebook-04",
    title: "04 Link Watch Data To Metadata, Exposure Context, And Problematic-View Labels",
    source: path.join(docsDir, "scripts", "04_link_watch_metadata.html"),
  },
  {
    id: "notebook-05",
    title: "05 Estimate Watch Time From Enriched Watch Events",
    source: path.join(docsDir, "scripts", "05_estimate_watchtime.html"),
  },
  {
    id: "notebook-06",
    title: "06 Demonstrate Enriched YouTube Exposure Measures",
    source: path.join(docsDir, "scripts", "06_demonstrate_enriched_exposure_measures.html"),
  },
];

const identifyingPatterns = [
  /David\s+Wegmann/gi,
  /Wegmann/gi,
  /2U2N/gi,
  /Aarhus/gi,
  /DATALAB/gi,
  /Social Media Influence/gi,
  /github\.com\/2U2N/gi,
  /au760299/gi,
];

const printCss = `
<style id="anonymous-review-print-css">
  @page {
    size: A4;
    margin: 13mm 12mm 14mm;
  }

  @media print {
    html,
    body {
      background: #fff !important;
      color: #111 !important;
      font-size: 10.2pt !important;
      line-height: 1.34 !important;
    }

    body {
      min-width: 0 !important;
      overflow: visible !important;
    }

    #quarto-header,
    .navbar,
    #quarto-margin-sidebar,
    .margin-sidebar,
    .sidebar,
    .toc-actions,
    .quarto-navbar-tools,
    .code-copy-button,
    .code-copy-outer-scaffold button,
    a.anchorjs-link,
    footer.footer {
      display: none !important;
    }

    #quarto-content,
    #quarto-document-content,
    main.content,
    .page-columns,
    .page-rows-contents,
    .page-layout-article {
      display: block !important;
      grid-template-columns: none !important;
      width: auto !important;
      max-width: none !important;
      margin: 0 !important;
      padding: 0 !important;
    }

    main.content {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
    }

    .quarto-title-block {
      margin-top: 0 !important;
      padding-top: 0 !important;
    }

    h1 {
      font-size: 19pt !important;
      line-height: 1.16 !important;
      margin: 0 0 8mm !important;
    }

    h2 {
      font-size: 14pt !important;
      margin-top: 8mm !important;
      break-after: avoid !important;
      page-break-after: avoid !important;
    }

    h3 {
      font-size: 11.5pt !important;
      margin-top: 6mm !important;
      break-after: avoid !important;
      page-break-after: avoid !important;
    }

    p,
    li {
      orphans: 3;
      widows: 3;
    }

    a {
      color: #174a7c !important;
      text-decoration: none !important;
    }

    pre,
    code,
    kbd,
    samp {
      white-space: pre-wrap !important;
      overflow-wrap: anywhere !important;
      word-break: break-word !important;
    }

    pre,
    pre.sourceCode,
    div.sourceCode {
      overflow: visible !important;
      max-width: 100% !important;
      font-size: 7.1pt !important;
      line-height: 1.22 !important;
    }

    pre.sourceCode code,
    code.sourceCode,
    pre > code.sourceCode > span {
      white-space: pre-wrap !important;
      text-indent: 0 !important;
      padding-left: 0 !important;
      display: inline !important;
    }

    .cell,
    .cell-output,
    .cell-output-display,
    .cell-output-stdout,
    .cell-output-stderr,
    .quarto-figure,
    figure,
    .callout {
      max-width: 100% !important;
      overflow: visible !important;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .cell-output pre {
      font-size: 7.2pt !important;
    }

    table {
      width: 100% !important;
      max-width: 100% !important;
      table-layout: fixed !important;
      border-collapse: collapse !important;
      font-size: 6.9pt !important;
    }

    th,
    td {
      overflow-wrap: anywhere !important;
      word-break: break-word !important;
      vertical-align: top !important;
    }

    img,
    svg,
    canvas {
      max-width: 100% !important;
      height: auto !important;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .mermaid,
    .cell-output-display svg {
      max-width: 100% !important;
    }
  }
</style>`;

function requirePlaywright() {
  const req = createRequire(import.meta.url);
  const searchPaths = [
    ...(process.env.NODE_PATH ? process.env.NODE_PATH.split(path.delimiter) : []),
    bundledNodeModules,
  ].filter(Boolean);
  const playwrightPath = req.resolve("playwright", { paths: searchPaths });
  return req(playwrightPath);
}

function chromeExecutablePath(chromium) {
  const candidates = [
    process.env.CHROME_EXECUTABLE,
    chromium.executablePath(),
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
  ].filter(Boolean);

  const executable = candidates.find((candidate) => existsSync(candidate));
  if (!executable) {
    throw new Error(`No Chromium/Chrome executable found. Tried: ${candidates.join(", ")}`);
  }
  return executable;
}

function assertInputs() {
  const missing = pageSpecs.filter((page) => !existsSync(page.source));
  if (missing.length > 0) {
    throw new Error(`Missing rendered HTML input(s): ${missing.map((page) => page.source).join(", ")}`);
  }
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function coverHtml() {
  const items = pageSpecs
    .map((page) => `<li>${escapeHtml(page.title)}</li>`)
    .join("\n");

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>Enhancing YouTube Data Donations With Platform Metadata</title>
<style>
  @page { size: A4; margin: 18mm 18mm 20mm; }
  body {
    color: #111;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    font-size: 11pt;
    line-height: 1.45;
  }
  h1 {
    font-size: 25pt;
    line-height: 1.12;
    margin: 0 0 7mm;
  }
  .subtitle {
    color: #444;
    font-size: 13pt;
    margin-bottom: 14mm;
  }
  h2 {
    font-size: 14pt;
    margin-top: 14mm;
  }
  ol {
    padding-left: 7mm;
  }
  li {
    margin: 2.3mm 0;
  }
</style>
</head>
<body>
<h1>Enhancing YouTube Data Donations With Platform Metadata</h1>
<p class="subtitle">Anonymized website and full notebook companion for review</p>
<p>This PDF is generated from the rendered companion website. It includes the main page, the notebook guide, and the six full rendered notebooks while omitting identifying repository and authorship material.</p>
<h2>Contents</h2>
<ol>
${items}
</ol>
</body>
</html>`;
}

function stripSectionById(html, id) {
  const escapedId = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const sectionStart = new RegExp(`<section\\s+id="${escapedId}"[^>]*>`, "i");
  const match = sectionStart.exec(html);
  if (!match) {
    return html;
  }

  const start = match.index;
  let depth = 0;
  const sectionTag = /<\/?section\b[^>]*>/gi;
  sectionTag.lastIndex = start;
  let tagMatch;
  while ((tagMatch = sectionTag.exec(html)) !== null) {
    if (tagMatch[0].startsWith("</")) {
      depth -= 1;
      if (depth === 0) {
        return html.slice(0, start) + html.slice(sectionTag.lastIndex);
      }
    } else {
      depth += 1;
    }
  }

  return html.slice(0, start);
}

function sanitizeHtml(rawHtml, page) {
  let html = rawHtml;

  html = stripSectionById(html, "repository");
  html = stripSectionById(html, "authorship-and-responsibility");

  html = html.replace(/<li><a[^>]+href="#repository"[\s\S]*?<\/li>/gi, "");
  html = html.replace(/<li><a[^>]+href="#authorship-and-responsibility"[\s\S]*?<\/li>/gi, "");
  html = html.replace(/<div class="toc-actions"[\s\S]*?<\/div>/gi, "");
  html = html.replace(
    /<div class="toc-actions d-sm-block d-md-none"[\s\S]*?<\/div><\/div><\/div><\/footer>/gi,
    "</div></div></div></footer>",
  );
  html = html.replace(
    /<p>An example of a successful data access request can be found <a href="https:\/\/github\.com\/2U2N\/GRPA_YT\/blob\/main\/GRPA_Share_Copy\.pdf">here<\/a>\.<\/p>/gi,
    "<p>An example data-access request link is omitted from this anonymized review copy.</p>",
  );

  for (const pattern of identifyingPatterns) {
    html = html.replace(pattern, "[redacted]");
  }

  const baseHref = pathToFileURL(path.dirname(page.source) + path.sep).href;
  html = html.replace(/<head>/i, `<head>\n<base href="${baseHref}">`);
  html = html.replace(/<\/head>/i, `${printCss}\n</head>`);
  return html;
}

async function scrubDom(page) {
  await page.evaluate(() => {
    const removeSelectors = [
      "#repository",
      "#authorship-and-responsibility",
      'a[href="#repository"]',
      'a[href="#authorship-and-responsibility"]',
      ".toc-actions",
      ".code-copy-button",
      "footer.footer",
      'a[href*="github.com/2U2N"]',
    ];

    for (const selector of removeSelectors) {
      document.querySelectorAll(selector).forEach((node) => {
        const listItem = node.closest("li");
        if (listItem && selector.includes("#")) {
          listItem.remove();
        } else {
          node.remove();
        }
      });
    }

    const blockedText = [
      /David\s+Wegmann/gi,
      /Wegmann/gi,
      /2U2N/gi,
      /Aarhus/gi,
      /DATALAB/gi,
      /Social Media Influence/gi,
      /github\.com\/2U2N/gi,
      /au760299/gi,
    ];

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) {
      textNodes.push(walker.currentNode);
    }
    for (const node of textNodes) {
      for (const pattern of blockedText) {
        node.nodeValue = node.nodeValue.replace(pattern, "[redacted]");
      }
    }

    document.querySelectorAll("a").forEach((anchor) => {
      anchor.removeAttribute("href");
    });
  });
}

async function waitForVisuals(page) {
  await page.waitForLoadState("load", { timeout: 45000 });
  await page.waitForLoadState("networkidle", { timeout: 45000 }).catch(() => {});
  await page
    .waitForFunction(
      () => Array.from(document.images).every((image) => image.complete),
      { timeout: 10000 },
    )
    .catch(() => {});
  await page.waitForTimeout(1500);
}

async function printHtml(browser, htmlPath, pdfPath) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 1600 } });
  await page.goto(pathToFileURL(htmlPath).href, {
    waitUntil: "load",
    timeout: 60000,
  });
  await waitForVisuals(page);
  await scrubDom(page);
  await page.emulateMedia({ media: "print" });
  await page.pdf({
    path: pdfPath,
    format: "A4",
    printBackground: true,
    preferCSSPageSize: true,
    margin: {
      top: "13mm",
      right: "12mm",
      bottom: "14mm",
      left: "12mm",
    },
  });
  await page.close();
}

function mergePdfs(partPdfs) {
  if (existsSync(finalPdf)) {
    rmSync(finalPdf);
  }
  const result = spawnSync("pdfunite", [...partPdfs, finalPdf], {
    cwd: repoRoot,
    encoding: "utf8",
  });
  if (result.status !== 0) {
    throw new Error(`pdfunite failed: ${result.stderr || result.stdout}`);
  }
}

async function main() {
  assertInputs();

  const { chromium } = requirePlaywright();
  const tempRoot = existsSync("/private/tmp") ? "/private/tmp" : tmpdir();
  const tempDir = mkdtempSync(path.join(tempRoot, "youtube-full-review-pdf-"));
  const htmlDir = path.join(tempDir, "html");
  const pdfDir = path.join(tempDir, "pdf");
  const keepTemp = process.env.KEEP_REVIEW_PDF_TEMP === "1";
  const mkdir = (dir) => spawnSync("mkdir", ["-p", dir], { encoding: "utf8" });
  mkdir(htmlDir);
  mkdir(pdfDir);

  const pages = [
    {
      id: "00-cover",
      title: "Cover",
      html: coverHtml(),
    },
    ...pageSpecs.map((page) => ({
      id: page.id,
      title: page.title,
      html: sanitizeHtml(readFileSync(page.source, "utf8"), page),
    })),
  ];

  try {
    const browser = await chromium.launch({
      executablePath: chromeExecutablePath(chromium),
      headless: true,
    });
    const partPdfs = [];
    try {
      for (const [index, page] of pages.entries()) {
        const htmlPath = path.join(htmlDir, `${String(index).padStart(2, "0")}-${page.id}.html`);
        const pdfPath = path.join(pdfDir, `${String(index).padStart(2, "0")}-${page.id}.pdf`);
        writeFileSync(htmlPath, page.html, "utf8");
        console.log(`Printing ${page.title}`);
        await printHtml(browser, htmlPath, pdfPath);
        partPdfs.push(pdfPath);
      }
    } finally {
      await browser.close();
    }

    mergePdfs(partPdfs);
    console.log(`Wrote ${finalPdf}`);
  } finally {
    if (keepTemp) {
      console.log(`Temporary files: ${tempDir}`);
    } else {
      rmSync(tempDir, { recursive: true, force: true });
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
