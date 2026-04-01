import { Router, type IRouter, type RequestHandler } from "express";
import multer from "multer";
import sharp from "sharp";
import path from "path";
import { PDFDocument } from "pdf-lib";
import { createWorker } from "tesseract.js";
import { Document, Packer, Paragraph, TextRun } from "docx";
import * as XLSX from "xlsx";
import * as pdfParseModule from "pdf-parse";
import archiver from "archiver";
import mammoth from "mammoth";
type PdfParseResult = { text: string; numpages: number; info: Record<string, unknown> };
type PdfParseFn = (buf: Buffer) => Promise<PdfParseResult>;
const pdfParse: PdfParseFn = ((pdfParseModule as unknown as { default?: PdfParseFn }).default ?? pdfParseModule) as unknown as PdfParseFn;

const router: IRouter = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

// ── ICO Binary Builder ─────────────────────────────────────────────────────────
// Writes a proper ICO container with multiple sizes
async function buildIco(inputBuffer: Buffer): Promise<Buffer> {
  const sizes = [16, 32, 48];
  const pngs: Buffer[] = [];
  for (const size of sizes) {
    const png = await sharp(inputBuffer).resize(size, size).png().toBuffer();
    pngs.push(png);
  }
  const n = pngs.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  const dataOffset = headerSize + n * dirEntrySize;

  let totalSize = dataOffset;
  const offsets: number[] = [];
  for (const p of pngs) {
    offsets.push(totalSize);
    totalSize += p.length;
  }

  const buf = Buffer.alloc(totalSize);
  // ICO header
  buf.writeUInt16LE(0, 0);  // reserved
  buf.writeUInt16LE(1, 2);  // type = 1 (ICO)
  buf.writeUInt16LE(n, 4);  // image count

  for (let i = 0; i < n; i++) {
    const de = headerSize + i * dirEntrySize;
    const size = sizes[i] === 256 ? 0 : sizes[i]; // 0 means 256 in ICO spec
    buf.writeUInt8(size, de + 0);   // width
    buf.writeUInt8(size, de + 1);   // height
    buf.writeUInt8(0, de + 2);      // palette colors
    buf.writeUInt8(0, de + 3);      // reserved
    buf.writeUInt16LE(1, de + 4);   // color planes
    buf.writeUInt16LE(32, de + 6);  // bits per pixel
    buf.writeUInt32LE(pngs[i].length, de + 8);  // image data size
    buf.writeUInt32LE(offsets[i], de + 12);     // image data offset
  }

  for (let i = 0; i < n; i++) {
    pngs[i].copy(buf, offsets[i]);
  }

  return buf;
}

// ── Image Format Conversion ────────────────────────────────────────────────────
router.post("/convert-image", upload.single("file"), (async (req, res) => {
  try {
    if (!req.file) { res.status(400).json({ error: "No file uploaded" }); return; }
    const targetFormat = req.body.targetFormat as string;
    const allowed = ["jpg", "png", "webp", "gif", "avif"];
    if (!allowed.includes(targetFormat)) {
      res.status(400).json({ error: "Invalid target format" }); return;
    }
    const sharpInstance = sharp(req.file.buffer);
    let output: Buffer;
    if (targetFormat === "jpg") {
      output = await sharpInstance.jpeg({ quality: 90 }).toBuffer();
    } else if (targetFormat === "png") {
      output = await sharpInstance.png().toBuffer();
    } else if (targetFormat === "webp") {
      output = await sharpInstance.webp({ quality: 90 }).toBuffer();
    } else if (targetFormat === "gif") {
      output = await sharpInstance.gif().toBuffer();
    } else {
      output = await sharpInstance.avif({ quality: 80 }).toBuffer();
    }
    const mimeMap: Record<string, string> = {
      jpg: "image/jpeg",
      png: "image/png",
      webp: "image/webp",
      gif: "image/gif",
      avif: "image/avif",
    };
    const origName = path.parse(req.file.originalname || "image").name;
    res.set("Content-Type", mimeMap[targetFormat]);
    res.set("Content-Disposition", `attachment; filename="${origName}.${targetFormat}"`);
    res.send(output);
  } catch (err) {
    req.log.error({ err }, "Error converting image");
    res.status(500).json({ error: "Conversion failed", details: String(err) });
  }
}) as RequestHandler);

// ── SVG to PNG ─────────────────────────────────────────────────────────────────
router.post("/svg-to-png", upload.single("file"), (async (req, res) => {
  try {
    if (!req.file) { res.status(400).json({ error: "No file uploaded" }); return; }
    const width = Math.min(Number(req.body.width) || 1024, 4096);
    const density = Math.min(Number(req.body.density) || 150, 300);
    const png = await sharp(req.file.buffer, { density }).resize(width).png().toBuffer();
    const origName = path.parse(req.file.originalname || "image").name;
    res.set("Content-Type", "image/png");
    res.set("Content-Disposition", `attachment; filename="${origName}.png"`);
    res.send(png);
  } catch (err) {
    req.log.error({ err }, "Error converting SVG to PNG");
    res.status(500).json({ error: "Conversion failed", details: String(err) });
  }
}) as RequestHandler);

// ── HEIC to JPG/PNG ────────────────────────────────────────────────────────────
router.post("/heic-convert", upload.single("file"), (async (req, res) => {
  try {
    if (!req.file) { res.status(400).json({ error: "No file uploaded" }); return; }
    const targetFormat = (req.body.targetFormat as string) || "jpg";
    const allowed = ["jpg", "png", "webp"];
    if (!allowed.includes(targetFormat)) {
      res.status(400).json({ error: "Invalid target format. Use jpg, png, or webp" }); return;
    }
    let output: Buffer;
    const sharpInst = sharp(req.file.buffer);
    if (targetFormat === "jpg") {
      output = await sharpInst.jpeg({ quality: 90 }).toBuffer();
    } else if (targetFormat === "webp") {
      output = await sharpInst.webp({ quality: 90 }).toBuffer();
    } else {
      output = await sharpInst.png().toBuffer();
    }
    const mimeMap: Record<string, string> = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" };
    const origName = path.parse(req.file.originalname || "image").name;
    res.set("Content-Type", mimeMap[targetFormat]);
    res.set("Content-Disposition", `attachment; filename="${origName}.${targetFormat}"`);
    res.send(output);
  } catch (err) {
    req.log.error({ err }, "Error converting HEIC");
    res.status(500).json({ error: "HEIC conversion failed", details: String(err) });
  }
}) as RequestHandler);

// ── Images to PDF ──────────────────────────────────────────────────────────────
router.post("/images-to-pdf", upload.array("files", 50), (async (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) { res.status(400).json({ error: "No files uploaded" }); return; }

    const pdfDoc = await PDFDocument.create();
    for (const file of files) {
      const jpgBuf = await sharp(file.buffer).jpeg({ quality: 90 }).toBuffer();
      const jpgImage = await pdfDoc.embedJpg(jpgBuf);
      const page = pdfDoc.addPage([jpgImage.width, jpgImage.height]);
      page.drawImage(jpgImage, { x: 0, y: 0, width: jpgImage.width, height: jpgImage.height });
    }
    const pdfBytes = await pdfDoc.save();
    res.set("Content-Type", "application/pdf");
    res.set("Content-Disposition", "attachment; filename=\"images.pdf\"");
    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    req.log.error({ err }, "Error creating PDF");
    res.status(500).json({ error: "Failed to create PDF", details: String(err) });
  }
}) as RequestHandler);

// ── PDF to Images ──────────────────────────────────────────────────────────────
// Renders each page as a PNG at 150 DPI using sharp's built-in PDF rasteriser (requires libvips with PDF support)
router.post("/pdf-to-images", upload.single("file"), (async (req, res) => {
  try {
    if (!req.file) { res.status(400).json({ error: "No file uploaded" }); return; }

    const density = Math.min(Number(req.body.density) || 150, 300);
    const format = (req.body.format as string) || "png";
    const allowedFormats = ["png", "jpg", "webp"];
    if (!allowedFormats.includes(format)) {
      res.status(400).json({ error: "Invalid format. Use png, jpg, or webp" }); return;
    }

    // Use sharp to load PDF and render all pages
    // sharp supports PDF input via libvips (pdfium), returns array of pages
    const metadata = await sharp(req.file.buffer, { density }).metadata();
    const pageCount = metadata.pages ?? 1;

    if (pageCount === 1) {
      // Single page: return the image directly
      let img: Buffer;
      if (format === "jpg") {
        img = await sharp(req.file.buffer, { density, page: 0 }).jpeg({ quality: 90 }).toBuffer();
      } else if (format === "webp") {
        img = await sharp(req.file.buffer, { density, page: 0 }).webp({ quality: 90 }).toBuffer();
      } else {
        img = await sharp(req.file.buffer, { density, page: 0 }).png().toBuffer();
      }
      const mime = format === "jpg" ? "image/jpeg" : format === "webp" ? "image/webp" : "image/png";
      res.set("Content-Type", mime);
      res.set("Content-Disposition", `attachment; filename="page-1.${format}"`);
      res.send(img);
    } else {
      // Multi-page: produce a ZIP archive containing one image file per page
      const maxPages = Math.min(pageCount, 20);
      const ext = format === "jpg" ? "jpg" : format;
      const archive = archiver("zip", { zlib: { level: 6 } });
      res.set("Content-Type", "application/zip");
      res.set("Content-Disposition", "attachment; filename=\"pdf-pages.zip\"");
      archive.pipe(res);
      for (let p = 0; p < maxPages; p++) {
        let pageBuf: Buffer;
        if (format === "jpg") {
          pageBuf = await sharp(req.file.buffer, { density, page: p }).jpeg({ quality: 90 }).toBuffer();
        } else if (format === "webp") {
          pageBuf = await sharp(req.file.buffer, { density, page: p }).webp({ quality: 90 }).toBuffer();
        } else {
          pageBuf = await sharp(req.file.buffer, { density, page: p }).png().toBuffer();
        }
        archive.append(pageBuf, { name: `page-${String(p + 1).padStart(3, "0")}.${ext}` });
      }
      await archive.finalize();
      return;
    }
  } catch (err) {
    req.log.error({ err }, "Error converting PDF to images");
    res.status(500).json({ error: "Failed to convert PDF", details: String(err) });
  }
}) as RequestHandler);

// ── PDF to Text ────────────────────────────────────────────────────────────────
router.post("/pdf-to-text", upload.single("file"), (async (req, res) => {
  try {
    if (!req.file) { res.status(400).json({ error: "No file uploaded" }); return; }
    const data = await pdfParse(req.file.buffer);
    res.json({ text: data.text });
  } catch (err) {
    req.log.error({ err }, "Error parsing PDF");
    res.status(500).json({ error: "Failed to parse PDF", details: String(err) });
  }
}) as RequestHandler);

// ── Image to Text (OCR) ────────────────────────────────────────────────────────
router.post("/image-to-text", upload.single("file"), (async (req, res) => {
  try {
    if (!req.file) { res.status(400).json({ error: "No file uploaded" }); return; }
    const worker = await createWorker("eng");
    const { data } = await worker.recognize(req.file.buffer);
    await worker.terminate();
    res.json({ text: data.text, confidence: data.confidence });
  } catch (err) {
    req.log.error({ err }, "Error performing OCR");
    res.status(500).json({ error: "OCR failed", details: String(err) });
  }
}) as RequestHandler);

// ── Image to DOCX ──────────────────────────────────────────────────────────────
router.post("/image-to-docx", upload.single("file"), (async (req, res) => {
  try {
    if (!req.file) { res.status(400).json({ error: "No file uploaded" }); return; }
    const worker = await createWorker("eng");
    const { data } = await worker.recognize(req.file.buffer);
    await worker.terminate();

    const lines = data.text.split("\n").filter(Boolean);
    const doc = new Document({
      sections: [{
        children: lines.map((line) => new Paragraph({ children: [new TextRun(line)] }))
      }]
    });
    const docBuf = await Packer.toBuffer(doc);
    res.set("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    res.set("Content-Disposition", "attachment; filename=\"extracted.docx\"");
    res.send(docBuf);
  } catch (err) {
    req.log.error({ err }, "Error creating DOCX");
    res.status(500).json({ error: "Failed to create DOCX", details: String(err) });
  }
}) as RequestHandler);

// ── Image to XLSX ──────────────────────────────────────────────────────────────
router.post("/image-to-xlsx", upload.single("file"), (async (req, res) => {
  try {
    if (!req.file) { res.status(400).json({ error: "No file uploaded" }); return; }
    const worker = await createWorker("eng");
    const { data } = await worker.recognize(req.file.buffer);
    await worker.terminate();

    const lines = data.text.split("\n").filter(l => l.trim());
    const rows = lines.map(line => line.split(/\t|  +/).map(cell => cell.trim()));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, "Extracted");
    const xlsxBuf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;

    res.set("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.set("Content-Disposition", "attachment; filename=\"extracted.xlsx\"");
    res.send(xlsxBuf);
  } catch (err) {
    req.log.error({ err }, "Error creating XLSX");
    res.status(500).json({ error: "Failed to create XLSX", details: String(err) });
  }
}) as RequestHandler);

// ── Image to CSV ───────────────────────────────────────────────────────────────
router.post("/image-to-csv", upload.single("file"), (async (req, res) => {
  try {
    if (!req.file) { res.status(400).json({ error: "No file uploaded" }); return; }
    const worker = await createWorker("eng");
    const { data } = await worker.recognize(req.file.buffer);
    await worker.terminate();

    const lines = data.text.split("\n").filter(l => l.trim());
    const rows = lines.map(line =>
      line.split(/\t|  +/)
        .map(cell => {
          const c = cell.trim();
          return c.includes(",") ? `"${c.replace(/"/g, '""')}"` : c;
        })
        .join(",")
    );
    const csv = rows.join("\n");
    res.set("Content-Type", "text/csv");
    res.set("Content-Disposition", "attachment; filename=\"extracted.csv\"");
    res.send(csv);
  } catch (err) {
    req.log.error({ err }, "Error creating CSV");
    res.status(500).json({ error: "Failed to create CSV", details: String(err) });
  }
}) as RequestHandler);

// ── JSON to Excel ──────────────────────────────────────────────────────────────
router.post("/json-to-excel", (async (req, res) => {
  try {
    const { json } = req.body;
    if (!json) { res.status(400).json({ error: "Missing json" }); return; }
    let data: unknown[];
    try {
      data = typeof json === "string" ? JSON.parse(json) : json;
    } catch {
      res.status(400).json({ error: "Invalid JSON" }); return;
    }
    if (!Array.isArray(data)) {
      res.status(400).json({ error: "JSON must be an array of objects" }); return;
    }
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
    res.set("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.set("Content-Disposition", "attachment; filename=\"data.xlsx\"");
    res.send(buf);
  } catch (err) {
    req.log.error({ err }, "Error creating Excel from JSON");
    res.status(500).json({ error: "Failed to create Excel", details: String(err) });
  }
}) as RequestHandler);

// ── EXIF Data Extractor ────────────────────────────────────────────────────────
router.post("/exif-data", upload.single("file"), (async (req, res) => {
  try {
    if (!req.file) { res.status(400).json({ error: "No file uploaded" }); return; }
    const exifr = (await import("exifr")).default;
    const data = await exifr.parse(req.file.buffer, true);
    res.json({ data: data || {} });
  } catch (err) {
    req.log.error({ err }, "Error extracting EXIF");
    res.status(500).json({ error: "Failed to extract EXIF data", details: String(err) });
  }
}) as RequestHandler);

// ── Image Hash ─────────────────────────────────────────────────────────────────
router.post("/image-hash", upload.single("file"), (async (req, res) => {
  try {
    if (!req.file) { res.status(400).json({ error: "No file uploaded" }); return; }

    const img = await sharp(req.file.buffer).resize(8, 8).grayscale().raw().toBuffer();
    const pixels = Array.from(img);

    const avg = pixels.reduce((s, v) => s + v, 0) / pixels.length;
    const ahash = pixels.map(p => (p >= avg ? 1 : 0)).join("");

    const dImg = await sharp(req.file.buffer).resize(9, 8).grayscale().raw().toBuffer();
    const dPixels = Array.from(dImg);
    let dhash = "";
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        dhash += dPixels[row * 9 + col] < dPixels[row * 9 + col + 1] ? "1" : "0";
      }
    }

    const pImg = await sharp(req.file.buffer).resize(32, 32).grayscale().raw().toBuffer();
    const pPixels = Array.from(pImg);
    const median = [...pPixels].sort((a, b) => a - b)[Math.floor(pPixels.length / 2)];
    const phash = pPixels.slice(0, 64).map(p => (p >= median ? 1 : 0)).join("");

    const toHex = (bits: string) =>
      bits.match(/.{4}/g)?.map(b => parseInt(b, 2).toString(16)).join("") ?? "";

    res.json({ ahash: toHex(ahash), phash: toHex(phash), dhash: toHex(dhash) });
  } catch (err) {
    req.log.error({ err }, "Error computing image hash");
    res.status(500).json({ error: "Failed to compute image hash", details: String(err) });
  }
}) as RequestHandler);

// ── Image ELA ──────────────────────────────────────────────────────────────────
router.post("/image-ela", upload.single("file"), (async (req, res) => {
  try {
    if (!req.file) { res.status(400).json({ error: "No file uploaded" }); return; }

    const original = await sharp(req.file.buffer).toFormat("png").raw().toBuffer({ resolveWithObject: true });
    const recompressed = await sharp(req.file.buffer).jpeg({ quality: 75 }).png().raw().toBuffer({ resolveWithObject: true });

    const { info } = original;
    const channels = info.channels;
    const len = original.data.length;
    const elaData = Buffer.alloc(len);
    for (let i = 0; i < len; i++) {
      elaData[i] = Math.min(255, Math.abs((original.data as Buffer)[i] - (recompressed.data as Buffer)[i]) * 10);
    }

    const elaImg = await sharp(elaData, { raw: { width: info.width, height: info.height, channels } })
      .jpeg({ quality: 90 })
      .toBuffer();

    res.set("Content-Type", "image/jpeg");
    res.set("Content-Disposition", "attachment; filename=\"ela-result.jpg\"");
    res.send(elaImg);
  } catch (err) {
    req.log.error({ err }, "Error performing ELA");
    res.status(500).json({ error: "ELA failed", details: String(err) });
  }
}) as RequestHandler);

// ── Duplicate Image Finder ────────────────────────────────────────────────────
router.post("/duplicate-finder", upload.array("files", 20), (async (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length < 2) { res.status(400).json({ error: "Need at least 2 files" }); return; }

    const hashes: Array<{ name: string; hash: string }> = [];
    for (const file of files) {
      const img = await sharp(file.buffer).resize(8, 8).grayscale().raw().toBuffer();
      const pixels = Array.from(img);
      const avg = pixels.reduce((s, v) => s + v, 0) / pixels.length;
      const bits = pixels.map(p => (p >= avg ? 1 : 0)).join("");
      const hash = bits.match(/.{4}/g)?.map(b => parseInt(b, 2).toString(16)).join("") ?? "";
      hashes.push({ name: file.originalname || `file-${hashes.length}`, hash });
    }

    const groups: Array<{ files: string[]; similarity: number }> = [];
    const visited = new Set<number>();

    for (let i = 0; i < hashes.length; i++) {
      if (visited.has(i)) continue;
      const group: string[] = [hashes[i].name];
      for (let j = i + 1; j < hashes.length; j++) {
        if (visited.has(j)) continue;
        const h1 = hashes[i].hash;
        const h2 = hashes[j].hash;
        const maxLen = Math.max(h1.length, h2.length);
        let matches = 0;
        for (let k = 0; k < Math.min(h1.length, h2.length); k++) {
          if (h1[k] === h2[k]) matches++;
        }
        const similarity = matches / maxLen;
        if (similarity >= 0.85) {
          group.push(hashes[j].name);
          visited.add(j);
        }
      }
      if (group.length > 1) {
        groups.push({ files: group, similarity: 1 });
        visited.add(i);
      }
    }

    res.json({ groups, totalFiles: files.length });
  } catch (err) {
    req.log.error({ err }, "Error finding duplicates");
    res.status(500).json({ error: "Duplicate finding failed", details: String(err) });
  }
}) as RequestHandler);

// ── Favicon Generator ──────────────────────────────────────────────────────────
// Returns a proper multi-size ICO binary
router.post("/favicon-generator", upload.single("file"), (async (req, res) => {
  try {
    if (!req.file) { res.status(400).json({ error: "No file uploaded" }); return; }
    const ico = await buildIco(req.file.buffer);
    res.set("Content-Type", "image/x-icon");
    res.set("Content-Disposition", "attachment; filename=\"favicon.ico\"");
    res.send(ico);
  } catch (err) {
    req.log.error({ err }, "Error generating favicon");
    res.status(500).json({ error: "Failed to generate favicon", details: String(err) });
  }
}) as RequestHandler);

export default router;
