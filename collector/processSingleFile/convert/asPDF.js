const { v4 } = require("uuid");
const path = require("path");
const { execFile } = require("child_process");
const { promisify } = require("util");
const { PDFLoader } = require("langchain/document_loaders/fs/pdf");
const pdfParse = require("pdf-parse");
const {
  createdDate,
  trashFile,
  writeToServerDocuments,
} = require("../../utils/files");
const { tokenizeString } = require("../../utils/tokenizer");
const { default: slugify } = require("slugify");
const fs = require("fs");
const os = require("os");
const { PAGES_PER_SET, extractTextFromImage } = require("../../utils/qwenOcr");

const execFileAsync = promisify(execFile);

const IMAGE_ONLY_HINT =
  " If the PDF is a scanned document or image-only, it has no selectable text; use an OCR tool or export a version with selectable text, then upload again.";

/** @type {((path: string, opts?: object) => { (page: number, opts?: object): Promise<{ base64?: string }> }) | null} */
let pdf2picFromPath = null;
try {
  const pdf2pic = require("pdf2pic");
  pdf2picFromPath = pdf2pic.fromPath;
} catch {
  // pdf2pic optional; requires GraphicsMagick
}

const GS_CMDS_WIN = ["gswin64c", "gswin32c", "gs"];
const GS_CMD_UNIX = "gs";

/**
 * Resolve Ghostscript executable. On Windows, if not on PATH, check common install locations.
 */
function getGhostscriptPaths() {
  if (process.platform === "win32") {
    const paths = [];
    const prog = process.env["ProgramFiles"] || "C:\\Program Files";
    const prog86 =
      process.env["ProgramFiles(x86)"] || "C:\\Program Files (x86)";
    try {
      const dirs = [prog, prog86]
        .flatMap((p) => {
          const gsDir = path.join(p, "gs");
          if (!fs.existsSync(gsDir)) return [];
          return fs.readdirSync(gsDir, { withFileTypes: true })
            .filter((d) => d.isDirectory())
            .map((d) => path.join(gsDir, d.name, "bin"));
        })
        .filter((d) => fs.existsSync(d));
      for (const binDir of dirs) {
        for (const name of ["gswin64c.exe", "gswin32c.exe"]) {
          const full = path.join(binDir, name);
          if (fs.existsSync(full)) paths.push(full);
        }
      }
    } catch (_) {}
    return [...paths, ...GS_CMDS_WIN];
  }
  return [GS_CMD_UNIX];
}

let cachedGsPaths = null;
function getGsPathsToTry() {
  if (cachedGsPaths === null) cachedGsPaths = getGhostscriptPaths();
  return cachedGsPaths;
}

let puppeteerBrowser = null;
async function getPuppeteerBrowser() {
  if (puppeteerBrowser && puppeteerBrowser.connected) return puppeteerBrowser;
  try {
    const puppeteer = require("puppeteer");
    puppeteerBrowser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    return puppeteerBrowser;
  } catch (e) {
    console.warn("Puppeteer launch failed:", e.message);
    return null;
  }
}

const PDF_PAGE_RENDER_HTML = `
<!DOCTYPE html>
<html><head>
<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
</head><body><script>
window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
window.renderPdfPage = async function(pdfBase64, pageNum) {
  try {
    const binary = atob(pdfBase64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');
    await page.render({ canvasContext: ctx, viewport: viewport }).promise;
    return canvas.toDataURL('image/png');
  } catch (e) {
    return null;
  }
};
</script></body></html>
`;

/**
 * Convert a single PDF page to PNG using Puppeteer + PDF.js (no Ghostscript needed).
 */
async function getPageAsImageDataUrlViaPuppeteer(
  fullFilePath,
  pageNum1Based
) {
  const browser = await getPuppeteerBrowser();
  if (!browser) return null;
  let page;
  try {
    const pdfBuffer = fs.readFileSync(fullFilePath);
    const pdfBase64 = pdfBuffer.toString("base64");
    page = await browser.newPage();
    await page.setContent(PDF_PAGE_RENDER_HTML, {
      waitUntil: "networkidle0",
      timeout: 25000,
    });
    const dataUrl = await page.evaluate(
      async (base64, num) => window.renderPdfPage(base64, num),
      pdfBase64,
      pageNum1Based
    );
    return dataUrl || null;
  } catch (e) {
    if (e.name !== "TimeoutError") {
      console.warn(
        `Puppeteer PDF render failed for page ${pageNum1Based}:`,
        e.message
      );
    }
    return null;
  } finally {
    if (page) await page.close().catch(() => {});
  }
}

/**
 * Convert a single PDF page to PNG using Ghostscript (no GraphicsMagick needed).
 * Uses PATH first; on Windows also checks Program Files for Ghostscript.
 */
async function getPageAsImageDataUrlViaGhostscript(
  fullFilePath,
  pageNum1Based
) {
  const tmpDir = os.tmpdir();
  const outFile = path.join(
    tmpDir,
    `pdf-page-${Date.now()}-${pageNum1Based}.png`
  );
  const gsArgs = [
    "-q",
    "-dNOPAUSE",
    "-dBATCH",
    "-dSAFER",
    "-sDEVICE=png16m",
    "-r150",
    `-dFirstPage=${pageNum1Based}`,
    `-dLastPage=${pageNum1Based}`,
    `-sOutputFile=${outFile}`,
    fullFilePath,
  ];
  const toTry = getGsPathsToTry();
  for (const gsCmd of toTry) {
    try {
      await execFileAsync(gsCmd, gsArgs, { timeout: 30000 });
      if (!fs.existsSync(outFile)) continue;
      const buf = fs.readFileSync(outFile);
      fs.unlinkSync(outFile);
      return `data:image/png;base64,${buf.toString("base64")}`;
    } catch (e) {
      try {
        if (fs.existsSync(outFile)) fs.unlinkSync(outFile);
      } catch {}
      if (e.code === "ENOENT" && toTry.indexOf(gsCmd) < toTry.length - 1) {
        continue;
      }
      if (e.code !== "ENOENT" && e.killed !== true) {
        console.warn(
          `Ghostscript failed for page ${pageNum1Based}:`,
          e.message
        );
      }
      return null;
    }
  }
  return null;
}

/**
 * Get a single PDF page as base64 data URL. Tries pdf2pic, then pdf-to-img (if installed), then Ghostscript.
 */
async function getPageAsImageDataUrl(
  fullFilePath,
  pageNum1Based,
  usePdfToImg,
  useGhostscript
) {
  if (useGhostscript) {
    return getPageAsImageDataUrlViaGhostscript(
      fullFilePath,
      pageNum1Based
    );
  }
  if (usePdfToImg) {
    try {
      const { pdf } = await import("pdf-to-img");
      const doc = await pdf(fullFilePath, { scale: 2 });
      const pageBuffer = await doc.getPage(pageNum1Based);
      if (!pageBuffer || !Buffer.isBuffer(pageBuffer)) return null;
      const base64 = pageBuffer.toString("base64");
      return `data:image/png;base64,${base64}`;
    } catch (e) {
      if (e.code !== "MODULE_NOT_FOUND") {
        console.warn(`pdf-to-img failed for page ${pageNum1Based}:`, e.message);
      }
      return null;
    }
  }
  if (!pdf2picFromPath) return null;
  const options = {
    density: 150,
    format: "png",
    width: 1200,
    height: 1600,
  };
  const convert = pdf2picFromPath(fullFilePath, options);
  const result = await convert(pageNum1Based, { responseType: "base64" });
  const base64 =
    typeof result === "string"
      ? result
      : result?.base64 ?? result?.base64Image ?? result?.data;
  return base64 ? `data:image/png;base64,${base64}` : null;
}

/**
 * Extract text from a range of PDF pages using Qwen (Alibaba DashScope) OCR.
 * Tries pdf2pic → pdf-to-img (if installed) → Ghostscript (no GraphicsMagick needed).
 */
async function extractSetWithQwen(fullFilePath, startPage1Based, endPage1Based) {
  if (!process.env.DASHSCOPE_API_KEY) {
    return null;
  }
  let backend = pdf2picFromPath ? "pdf2pic" : "ghostscript";
  const parts = [];
  for (let p = startPage1Based; p <= endPage1Based; p++) {
    let dataUrl = null;
    try {
      if (backend === "pdf2pic") {
        dataUrl = await getPageAsImageDataUrl(
          fullFilePath,
          p,
          false,
          false
        );
        if (!dataUrl) {
          console.warn(
            `pdf2pic failed for page ${p} (GraphicsMagick may be missing), trying Ghostscript...`
          );
          backend = "ghostscript";
          dataUrl = await getPageAsImageDataUrl(
            fullFilePath,
            p,
            false,
            true
          );
        }
        if (!dataUrl) {
          console.warn(
            `Ghostscript failed for page ${p}, trying Puppeteer (no install needed)...`
          );
          dataUrl = await getPageAsImageDataUrlViaPuppeteer(
            fullFilePath,
            p
          );
        }
      } else if (backend === "pdf-to-img") {
        dataUrl = await getPageAsImageDataUrl(
          fullFilePath,
          p,
          true,
          false
        );
        if (!dataUrl) {
          backend = "ghostscript";
          dataUrl = await getPageAsImageDataUrl(
            fullFilePath,
            p,
            false,
            true
          );
        }
        if (!dataUrl) {
          dataUrl = await getPageAsImageDataUrlViaPuppeteer(
            fullFilePath,
            p
          );
        }
      } else {
        dataUrl = await getPageAsImageDataUrl(
          fullFilePath,
          p,
          false,
          true
        );
        if (!dataUrl) {
          console.warn(
            `Ghostscript failed for page ${p}, trying Puppeteer (no install needed)...`
          );
          dataUrl = await getPageAsImageDataUrlViaPuppeteer(
            fullFilePath,
            p
          );
        }
      }
      if (dataUrl) {
        const text = await extractTextFromImage(dataUrl);
        if (text) parts.push(text);
      }
    } catch (e) {
      if (backend === "pdf2pic") {
        console.warn(
          `pdf2pic failed for page ${p}, trying Ghostscript...`
        );
        backend = "ghostscript";
        try {
          dataUrl = await getPageAsImageDataUrl(
            fullFilePath,
            p,
            false,
            true
          );
          if (!dataUrl) {
            dataUrl = await getPageAsImageDataUrlViaPuppeteer(
              fullFilePath,
              p
            );
          }
          if (dataUrl) {
            const text = await extractTextFromImage(dataUrl);
            if (text) parts.push(text);
          }
        } catch (e2) {
          console.warn(`Qwen OCR failed for page ${p}:`, e2.message);
        }
      } else {
        if (backend === "ghostscript" && !dataUrl) {
          try {
            dataUrl = await getPageAsImageDataUrlViaPuppeteer(
              fullFilePath,
              p
            );
            if (dataUrl) {
              const text = await extractTextFromImage(dataUrl);
              if (text) parts.push(text);
            }
          } catch (_) {}
        }
        if (!dataUrl) {
          console.warn(`Qwen OCR failed for page ${p}:`, e.message);
        }
      }
    }
  }
  return parts.length ? parts.join("\n\n") : null;
}

async function asPDF({ fullFilePath = "", filename = "" }) {
  const pdfLoader = new PDFLoader(fullFilePath, { splitPages: true });

  console.log(`-- Working ${filename} --`);
  let docs = [];
  try {
    docs = await pdfLoader.load();
  } catch (e) {
    console.error("PDFLoader failed:", e.message);
  }

  let totalPages = docs.length;

  // If loader returned no pages, try pdf-parse for page count (and optional fallback text)
  if (totalPages === 0) {
    try {
      const dataBuffer = fs.readFileSync(fullFilePath);
      const data = await pdfParse(dataBuffer);
      totalPages = data?.numpages || 0;
      if (totalPages === 0 && data?.text?.trim()) {
        totalPages = 1;
        docs = [
          {
            pageContent: data.text.trim(),
            metadata: { loc: { pageNumber: 1 } },
          },
        ];
      }
    } catch (e) {
      console.error("pdf-parse fallback failed:", e.message);
    }
  }

  if (totalPages === 0) {
    console.error(`No pages found for ${filename}.`);
    trashFile(fullFilePath);
    return {
      success: false,
      reason: `No pages found in ${filename}.${IMAGE_ONLY_HINT}`,
      documents: [],
    };
  }

  const qwenAvailable = !!process.env.DASHSCOPE_API_KEY;

  const allDocuments = [];
  const baseMeta = {
    url: "file://" + fullFilePath,
    title: filename,
    docAuthor: docs[0]?.metadata?.pdf?.info?.Creator || "no author found",
    description: docs[0]?.metadata?.pdf?.info?.Title || "No description found.",
    docSource: "pdf file uploaded by the user.",
    chunkSource: "",
    published: createdDate(fullFilePath),
  };

  const numSets = Math.ceil(totalPages / PAGES_PER_SET);

  for (let setIndex = 0; setIndex < numSets; setIndex++) {
    const startPage0 = setIndex * PAGES_PER_SET;
    const endPage0 = Math.min(startPage0 + PAGES_PER_SET, totalPages) - 1;
    const startPage1 = startPage0 + 1;
    const endPage1 = endPage0 + 1;
    const setLabel = `pages ${startPage1}-${endPage1}`;
    console.log(`-- Processing set ${setIndex + 1}/${numSets} (${setLabel}) --`);

    // 1) Try conventional extraction (selectable text) first
    let content = "";
    if (docs.length > 0) {
      const setDocs = docs.slice(startPage0, endPage0 + 1);
      const parts = setDocs.map((d) => d?.pageContent).filter(Boolean);
      content = parts.join("\n\n");
    }

    // 2) Fallback: scanned/image-only PDF — use Qwen (Alibaba) OCR when configured
    if ((!content || !content.trim()) && qwenAvailable) {
      console.log(`-- No selectable text for ${setLabel}; using Qwen OCR --`);
      const qwenText = await extractSetWithQwen(
        fullFilePath,
        startPage1,
        endPage1
      );
      if (qwenText) content = qwenText;
    }

    if (!content || !content.trim()) {
      console.warn(
        `No text extracted for set ${setIndex + 1} (${setLabel}). Skipping.`
      );
      continue;
    }

    const data = {
      id: v4(),
      ...baseMeta,
      title: numSets > 1 ? `${filename} (${setLabel})` : filename,
      wordCount: content.split(/\s+/).length,
      pageContent: content,
      token_count_estimate: tokenizeString(content).length,
    };

    const docFilename =
      numSets > 1
        ? `${slugify(filename)}-set-${startPage1}-${endPage1}-${data.id}`
        : `${slugify(filename)}-${data.id}`;
    const document = writeToServerDocuments(data, docFilename);
    allDocuments.push(document);
  }

  trashFile(fullFilePath);

  if (allDocuments.length === 0) {
    const ocrHint = qwenAvailable
      ? " Qwen OCR was attempted but could not extract text. The collector will try Puppeteer (no install). If it still fails, install Ghostscript (https://ghostscript.com/releases/gsdnload.html) and add its bin folder to PATH, then restart the document processor."
      : " To support scanned PDFs: add DASHSCOPE_API_KEY to the collector's .env file (in the collector folder), then restart the document processor. Puppeteer is used to render PDFs when Ghostscript is not installed.";
    return {
      success: false,
      reason: `No text content could be extracted from ${filename}.${ocrHint}${!qwenAvailable ? IMAGE_ONLY_HINT : ""}`,
      documents: [],
    };
  }

  console.log(
    `[SUCCESS]: ${filename} converted into ${allDocuments.length} set(s) & ready for embedding.\n`
  );
  return { success: true, reason: null, documents: allDocuments };
}

module.exports = asPDF;
