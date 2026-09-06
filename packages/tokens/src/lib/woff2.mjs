/* Minimal WOFF2 reader — enough to reach the decompressed sfnt payload so the
   validator can confirm rule V6's shaping features are really in the shipped
   subset rather than taking the token set's word for it.

   Only the header and table directory are parsed; the Brotli stream that follows
   is handed to zlib. Nothing here rasterises or shapes — that is the browser's
   job, and the theme-swap gate asserts it there. */
import { brotliDecompressSync } from "node:zlib";

// WOFF2 known-table indices, in specification order.
const KNOWN = [
  "cmap","head","hhea","hmtx","maxp","name","OS/2","post","cvt ","fpgm","glyf","loca",
  "prep","CFF ","VORG","EBDT","EBLC","gasp","hdmx","kern","LTSH","PCLT","VDMX","vhea",
  "vmtx","BASE","GDEF","GPOS","GSUB","EBSC","JSTF","MATH","CBDT","CBLC","COLR","CPAL",
  "SVG ","sbix","acnt","avar","bdat","bloc","bsln","cvar","fdsc","feat","fmtx","fvar",
  "gvar","hsty","just","lcar","mort","morx","opbd","prop","trak","Zapf","Silf","Glat",
  "Gloc","Feat","Sill",
];

/** WOFF2 UIntBase128: 7 bits per byte, high bit continues. */
function readBase128(buf, pos) {
  let value = 0;
  for (let i = 0; i < 5; i++) {
    const b = buf[pos++];
    if (i === 0 && b === 0x80) throw new Error("base128: leading zero");
    value = (value << 7) | (b & 0x7f);
    if ((b & 0x80) === 0) return [value >>> 0, pos];
  }
  throw new Error("base128: too long");
}

/** Parse the header + directory and return the decompressed sfnt tables. */
export function woff2Payload(buf) {
  if (buf.subarray(0, 4).toString("latin1") !== "wOF2") throw new Error("not a woff2 file");
  const numTables = buf.readUInt16BE(12);
  const totalCompressedSize = buf.readUInt32BE(20);

  let pos = 48;
  const tables = [];
  for (let i = 0; i < numTables; i++) {
    const flags = buf[pos++];
    const idx = flags & 0x3f;
    let tag;
    if (idx === 0x3f) { tag = buf.subarray(pos, pos + 4).toString("latin1"); pos += 4; }
    else tag = KNOWN[idx];
    const transformVersion = (flags >> 6) & 0x03;

    let origLength;
    [origLength, pos] = readBase128(buf, pos);

    // glyf/loca carry the null transform at version 3; everything else at 0.
    const transformed = tag === "glyf" || tag === "loca" ? transformVersion !== 3 : transformVersion !== 0;
    if (transformed) { [, pos] = readBase128(buf, pos); }
    tables.push({ tag, origLength, transformed });
  }

  const stream = buf.subarray(pos, pos + totalCompressedSize);
  const payload = brotliDecompressSync(stream);
  return { tables, payload };
}

/** OpenType feature tags present in the font's layout tables. */
export function featureTags(payload) {
  const text = payload.toString("latin1");
  const found = new Set();
  for (const m of text.matchAll(/[a-z]{3}[a-z0-9]/g)) found.add(m[0]);
  return found;
}
