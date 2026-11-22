/**
 * Tiny dependency-free PDF writer: A4 pages, Helvetica / Helvetica-Bold,
 * wrapped paragraphs, bullets, tables, coloured boxes and PNG images (the
 * logo). Enough for the partner program documents, which are built from the
 * live program settings.
 */
import zlib from "node:zlib";

/** A decoded PNG, ready to embed: deflated RGB pixels plus a deflated alpha mask. */
export interface PdfImage { w: number; h: number; rgb: Buffer; alpha?: Buffer }

/** Decodes an 8-bit, non-interlaced RGB or RGBA PNG (what our logo files are). */
export function decodePng(buf: Buffer): PdfImage {
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error("not a PNG");
  let pos = 8, w = 0, h = 0, depth = 0, type = 0, interlace = 0;
  const idat: Buffer[] = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const kind = buf.toString("latin1", pos + 4, pos + 8);
    const data = buf.subarray(pos + 8, pos + 8 + len);
    if (kind === "IHDR") {
      w = data.readUInt32BE(0); h = data.readUInt32BE(4); depth = data[8]; type = data[9]; interlace = data[12];
    } else if (kind === "IDAT") idat.push(data);
    else if (kind === "IEND") break;
    pos += 12 + len;
  }
  if (depth !== 8 || interlace || (type !== 2 && type !== 6)) throw new Error("unsupported PNG");
  const ch = type === 6 ? 4 : 3;
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = w * ch;
  const px = Buffer.alloc(stride * h);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)];
    const row = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    for (let x = 0; x < stride; x++) {
      const a = x >= ch ? px[y * stride + x - ch] : 0;
      const b = y ? px[(y - 1) * stride + x] : 0;
      const c = y && x >= ch ? px[(y - 1) * stride + x - ch] : 0;
      let v = row[x];
      if (f === 1) v += a;
      else if (f === 2) v += b;
      else if (f === 3) v += (a + b) >> 1;
      else if (f === 4) {
        const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
        v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      }
      px[y * stride + x] = v & 255;
    }
  }
  if (ch === 3) return { w, h, rgb: zlib.deflateSync(px) };
  const rgb = Buffer.alloc(w * h * 3);
  const alpha = Buffer.alloc(w * h);
  for (let i = 0; i < w * h; i++) {
    rgb[i * 3] = px[i * 4]; rgb[i * 3 + 1] = px[i * 4 + 1]; rgb[i * 3 + 2] = px[i * 4 + 2];
    alpha[i] = px[i * 4 + 3];
  }
  return { w, h, rgb: zlib.deflateSync(rgb), alpha: zlib.deflateSync(alpha) };
}

type RGB = [number, number, number];
export const hex = (h: string): RGB => [parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255];

// Glyph widths (1/1000 em) for ASCII 32..126 from the standard AFM metrics.
const W_REG = [278,278,355,556,556,889,667,191,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,278,278,584,584,584,556,1015,667,667,722,722,667,611,778,722,278,500,667,556,833,722,778,667,778,722,667,611,722,667,944,667,667,611,278,278,278,469,556,333,556,556,500,556,556,278,556,556,222,222,500,222,833,556,556,556,556,333,500,278,556,500,722,500,500,500,334,260,334,584];
const W_BOLD = [278,333,474,556,556,889,722,238,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,333,333,584,584,584,611,975,722,722,722,722,667,611,778,722,278,556,722,611,833,722,778,667,778,722,667,611,722,667,944,667,667,611,333,278,333,584,556,333,556,611,556,611,556,333,611,611,278,278,556,278,889,611,611,611,611,389,556,333,611,556,778,556,556,500,389,280,389,584];
// WinAnsi extras we use: code → [regular, bold] width.
const EXTRA: Record<string, [number, number[]]> = {
  "–": [0x96, [556, 556]], "—": [0x97, [1000, 1000]], "•": [0x95, [350, 350]], "·": [0xb7, [278, 278]],
  "’": [0x92, [222, 278]], "‘": [0x91, [222, 278]], "“": [0x93, [333, 500]], "”": [0x94, [333, 500]], "…": [0x85, [1000, 1000]], "×": [0xd7, [584, 584]], "✓": [0xb7, [278, 278]],
};
const ASCII_FALLBACK: Record<string, string> = { "→": "->", "≥": ">=", " ": " ", "€": "EUR" };

function norm(s: string) {
  return s.replace(/[→≥ €]/g, (c) => ASCII_FALLBACK[c] || "");
}

function charWidth(c: string, bold: boolean) {
  const code = c.charCodeAt(0);
  if (code >= 32 && code <= 126) return (bold ? W_BOLD : W_REG)[code - 32];
  const e = EXTRA[c];
  return e ? e[1][bold ? 1 : 0] : 556;
}

export function textWidth(s: string, size: number, bold = false) {
  let w = 0;
  for (const c of norm(s)) w += charWidth(c, bold);
  return (w * size) / 1000;
}

/** PDF string literal in WinAnsi, with octal escapes. */
function pdfStr(s: string) {
  let out = "(";
  for (const c of norm(s)) {
    const code = c.charCodeAt(0);
    if (c === "(" || c === ")" || c === "\\") out += "\\" + c;
    else if (code >= 32 && code <= 126) out += c;
    else if (EXTRA[c]) out += "\\" + EXTRA[c][0].toString(8).padStart(3, "0");
  }
  return out + ")";
}

const f = (n: number) => (Math.round(n * 100) / 100).toString();

export interface TextOpts { size?: number; bold?: boolean; color?: string; }

export class Pdf {
  readonly W = 595.28;
  readonly H = 841.89;
  readonly M = 54; // margin
  private pages: string[][] = [];
  private cur: string[] = [];
  private images: PdfImage[] = [];
  y = 0; // distance from the top of the page
  footer = "";
  /** Drawn at the top of every page after the first (running header). */
  header?: (pdf: Pdf) => void;

  constructor() {
    this.newPage();
  }

  get contentWidth() {
    return this.W - this.M * 2;
  }

  newPage() {
    this.cur = [];
    this.pages.push(this.cur);
    this.y = this.M;
    if (this.pages.length > 1 && this.header) this.header(this);
  }

  /** Registers an image; returns its index for drawImage. */
  addImage(img: PdfImage) {
    this.images.push(img);
    return this.images.length - 1;
  }

  /** Draws an image with its top-left corner at (x, y from top), `w` wide (height keeps the ratio). Returns the height. */
  drawImage(index: number, x: number, y: number, w: number) {
    const img = this.images[index];
    const h = (w * img.h) / img.w;
    this.cur.push(`q ${f(w)} 0 0 ${f(h)} ${f(x)} ${f(this.H - y - h)} cm /Im${index} Do Q`);
    return h;
  }

  /** Start a new page if fewer than `h` points are left. */
  ensure(h: number) {
    if (this.y + h > this.H - this.M - 20) this.newPage();
  }

  rect(x: number, y: number, w: number, h: number, color: string) {
    const [r, g, b] = hex(color);
    this.cur.push(`${f(r)} ${f(g)} ${f(b)} rg ${f(x)} ${f(this.H - y - h)} ${f(w)} ${f(h)} re f`);
  }

  line(x1: number, y1: number, x2: number, y2: number, color = "#e2e8f0", width = 0.8) {
    const [r, g, b] = hex(color);
    this.cur.push(`${f(r)} ${f(g)} ${f(b)} RG ${f(width)} w ${f(x1)} ${f(this.H - y1)} m ${f(x2)} ${f(this.H - y2)} l S`);
  }

  /** Text with its baseline at (x, y from top). */
  text(x: number, y: number, s: string, o: TextOpts = {}) {
    const [r, g, b] = hex(o.color || "#0f172a");
    this.cur.push(`BT /${o.bold ? "F2" : "F1"} ${f(o.size || 10)} Tf ${f(r)} ${f(g)} ${f(b)} rg ${f(x)} ${f(this.H - y)} Td ${pdfStr(s)} Tj ET`);
  }

  wrap(s: string, width: number, size: number, bold = false): string[] {
    const lines: string[] = [];
    for (const para of s.split("\n")) {
      let line = "";
      for (const word of para.split(/\s+/).filter(Boolean)) {
        const test = line ? `${line} ${word}` : word;
        if (textWidth(test, size, bold) <= width || !line) line = test;
        else {
          lines.push(line);
          line = word;
        }
      }
      lines.push(line);
    }
    return lines;
  }

  /** Paragraph at the cursor, wrapped to the content width (or `width`). */
  para(s: string, o: TextOpts & { x?: number; width?: number; gap?: number; lead?: number } = {}) {
    const size = o.size || 10.5;
    const lead = o.lead || size * 1.45;
    const x = o.x ?? this.M;
    const lines = this.wrap(s, o.width ?? this.W - this.M - x, size, o.bold);
    for (const l of lines) {
      this.ensure(lead);
      this.y += lead;
      this.text(x, this.y - lead * 0.28, l, { ...o, size });
    }
    this.y += o.gap ?? 6;
  }

  heading(s: string, size = 15, color = "#0f172a") {
    this.ensure(size * 3);
    this.y += 10;
    this.para(s, { size, bold: true, color, gap: 4 });
  }

  /** Small coloured label above a heading. */
  eyebrow(s: string, color = "#005fc2") {
    this.ensure(40);
    this.y += 8;
    this.text(this.M, this.y + 8, s.toUpperCase(), { size: 8.5, bold: true, color });
    this.y += 12;
  }

  bullets(items: string[], o: { size?: number; color?: string; marker?: string } = {}) {
    const size = o.size || 10.5;
    for (const it of items) {
      const lines = this.wrap(it, this.contentWidth - 16, size);
      this.ensure(size * 1.45 * Math.min(lines.length, 3));
      const start = this.y;
      this.para(it, { x: this.M + 16, size, color: o.color || "#334155", gap: 3 });
      this.text(this.M + 3, start + size * 1.45 * 0.72, o.marker || "•", { size, bold: true, color: "#005fc2" });
    }
    this.y += 4;
  }

  /** Table with wrapped cells. `cols` are relative widths. */
  table(head: string[], rows: string[][], cols: number[], o: { size?: number; boldFirst?: boolean; zebra?: boolean } = {}) {
    const size = o.size || 9.5;
    const lead = size * 1.4;
    const total = cols.reduce((a, b) => a + b, 0);
    const widths = cols.map((c) => (c / total) * this.contentWidth);
    const pad = 6;
    const drawRow = (cells: string[], header: boolean, idx: number) => {
      const wrapped = cells.map((c, i) => this.wrap(c, widths[i] - pad * 2, size, header || (o.boldFirst !== false && i === 0)));
      const h = Math.max(...wrapped.map((w) => w.length)) * lead + pad * 2;
      this.ensure(h);
      if (header) this.rect(this.M, this.y, this.contentWidth, h, "#005fc2");
      else if (o.zebra !== false && idx % 2 === 1) this.rect(this.M, this.y, this.contentWidth, h, "#f1f5f9");
      let x = this.M;
      wrapped.forEach((lines, i) => {
        lines.forEach((l, j) => {
          this.text(x + pad, this.y + pad + lead * (j + 1) - lead * 0.28, l, {
            size,
            bold: header || (o.boldFirst !== false && i === 0),
            color: header ? "#ffffff" : "#0f172a",
          });
        });
        x += widths[i];
      });
      this.y += h;
      if (!header) this.line(this.M, this.y, this.M + this.contentWidth, this.y);
    };
    this.ensure(lead * 4);
    drawRow(head, true, 0);
    rows.forEach((r, i) => drawRow(r, false, i));
    this.y += 10;
  }

  /** Shaded box containing wrapped text. */
  callout(title: string, body: string, color = "#eff6ff", accent = "#005fc2") {
    const lines = this.wrap(body, this.contentWidth - 28, 10);
    const h = 30 + lines.length * 14.5;
    this.ensure(h + 8);
    this.rect(this.M, this.y, this.contentWidth, h, color);
    this.rect(this.M, this.y, 4, h, accent);
    this.text(this.M + 16, this.y + 18, title, { size: 11, bold: true, color: "#0f172a" });
    lines.forEach((l, i) => this.text(this.M + 16, this.y + 34 + i * 14.5, l, { size: 10, color: "#334155" }));
    this.y += h + 10;
  }

  /** Serialise to PDF bytes, adding page numbers and the footer line. */
  build(title: string): Uint8Array {
    const n = this.pages.length;
    this.pages.forEach((p, i) => {
      const [r, g, b] = hex("#64748b");
      p.push(`BT /F1 8 Tf ${f(r)} ${f(g)} ${f(b)} rg ${f(this.M)} 28 Td ${pdfStr(this.footer)} Tj ET`);
      const pg = `Page ${i + 1} of ${n}`;
      p.push(`BT /F1 8 Tf ${f(r)} ${f(g)} ${f(b)} rg ${f(this.W - this.M - textWidth(pg, 8))} 28 Td ${pdfStr(pg)} Tj ET`);
    });

    const objs: string[] = [];
    const add = (s: string) => objs.push(s) ;
    add("<< /Type /Catalog /Pages 2 0 R >>");
    const pageIds = this.pages.map((_, i) => 6 + i * 2);
    // Image objects follow the pages: an image, then its alpha mask if it has one.
    let next = 6 + n * 2;
    const imageIds = this.images.map((img) => {
      const id = next;
      next += img.alpha ? 2 : 1;
      return id;
    });
    const xobjects = this.images.length ? ` /XObject << ${imageIds.map((id, i) => `/Im${i} ${id} 0 R`).join(" ")} >>` : "";
    add(`<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${n} >>`);
    add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");
    add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>");
    add(`<< /Title ${pdfStr(title)} /Author (EGO Web Services LLC) /Creator (egowebservices.com) >>`);
    this.pages.forEach((p, i) => {
      const stream = p.join("\n");
      add(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${f(this.W)} ${f(this.H)}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >>${xobjects} >> /Contents ${pageIds[i] + 1} 0 R >>`);
      add(`<< /Length ${Buffer.byteLength(stream, "latin1")} >>\nstream\n${stream}\nendstream`);
    });
    this.images.forEach((img, i) => {
      const bin = (b: Buffer) => b.toString("latin1");
      add(`<< /Type /XObject /Subtype /Image /Width ${img.w} /Height ${img.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /FlateDecode${img.alpha ? ` /SMask ${imageIds[i] + 1} 0 R` : ""} /Length ${img.rgb.length} >>\nstream\n${bin(img.rgb)}\nendstream`);
      if (img.alpha) add(`<< /Type /XObject /Subtype /Image /Width ${img.w} /Height ${img.h} /ColorSpace /DeviceGray /BitsPerComponent 8 /Filter /FlateDecode /Length ${img.alpha.length} >>\nstream\n${bin(img.alpha)}\nendstream`);
    });

    let out = "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n";
    const offsets: number[] = [];
    objs.forEach((o, i) => {
      offsets.push(Buffer.byteLength(out, "latin1"));
      out += `${i + 1} 0 obj\n${o}\nendobj\n`;
    });
    const xref = Buffer.byteLength(out, "latin1");
    out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n${offsets.map((o) => `${String(o).padStart(10, "0")} 00000 n \n`).join("")}`;
    out += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R /Info 5 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
    return new Uint8Array(Buffer.from(out, "latin1"));
  }
}
