import fs from "fs";
import path from "path";
import os from "os";
import { CMSData } from "@/types/cms";
import { DEFAULT_CMS_DATA } from "./defaultData";

const LOCAL_DATA_DIR = path.join(process.cwd(), "data");
const LOCAL_DATA_FILE = path.join(LOCAL_DATA_DIR, "cms-data.json");
const TMP_DATA_FILE = path.join(os.tmpdir(), "soumaki-cms-data.json");

declare global {
  // eslint-disable-next-line no-var
  var __soumakiCMSCache: CMSData | undefined;
}

function getWritableFilePath(): string {
  if (process.env.VERCEL) {
    return TMP_DATA_FILE;
  }
  return LOCAL_DATA_FILE;
}

export function getCMSData(): CMSData {
  try {
    // 1. On Vercel, check /tmp first or in-memory cache
    if (process.env.VERCEL) {
      if (fs.existsSync(TMP_DATA_FILE)) {
        const raw = fs.readFileSync(TMP_DATA_FILE, "utf-8");
        const parsed = JSON.parse(raw) as Partial<CMSData>;
        return normalizeCMSData(parsed);
      }
      if (globalThis.__soumakiCMSCache) {
        return globalThis.__soumakiCMSCache;
      }
    }

    // 2. Check bundled/local data/cms-data.json
    if (fs.existsSync(LOCAL_DATA_FILE)) {
      const raw = fs.readFileSync(LOCAL_DATA_FILE, "utf-8");
      const parsed = JSON.parse(raw) as Partial<CMSData>;
      const normalized = normalizeCMSData(parsed);
      globalThis.__soumakiCMSCache = normalized;
      return normalized;
    }

    // 3. Fallback to default seed data
    saveCMSData(DEFAULT_CMS_DATA);
    return DEFAULT_CMS_DATA;
  } catch (error) {
    console.error("Failed to read CMS data:", error);
    return globalThis.__soumakiCMSCache || DEFAULT_CMS_DATA;
  }
}

function normalizeCMSData(parsed: Partial<CMSData>): CMSData {
  return {
    siteConfig: parsed.siteConfig || DEFAULT_CMS_DATA.siteConfig,
    bowls: parsed.bowls || DEFAULT_CMS_DATA.bowls,
    ingredients: parsed.ingredients || DEFAULT_CMS_DATA.ingredients,
    news: parsed.news || DEFAULT_CMS_DATA.news,
    testimonials: parsed.testimonials || DEFAULT_CMS_DATA.testimonials,
    orders: parsed.orders || DEFAULT_CMS_DATA.orders,
  };
}

export function saveCMSData(data: CMSData): CMSData {
  globalThis.__soumakiCMSCache = data;
  const targetFile = getWritableFilePath();
  try {
    const dir = path.dirname(targetFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(targetFile, JSON.stringify(data, null, 2), "utf-8");
  } catch {
    // Fallback to /tmp if local directory is read-only
    try {
      fs.writeFileSync(TMP_DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
    } catch (tmpErr) {
      console.error("Could not write to tmp file:", tmpErr);
    }
  }
  return data;
}

export function resetCMSData(): CMSData {
  return saveCMSData(DEFAULT_CMS_DATA);
}
