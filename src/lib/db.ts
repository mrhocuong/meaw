import fs from "fs";
import path from "path";
import { CMSData } from "@/types/cms";
import { DEFAULT_CMS_DATA } from "./defaultData";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "cms-data.json");

export function getCMSData(): CMSData {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_CMS_DATA, null, 2), "utf-8");
      return DEFAULT_CMS_DATA;
    }
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw) as Partial<CMSData>;
    return {
      siteConfig: parsed.siteConfig || DEFAULT_CMS_DATA.siteConfig,
      bowls: parsed.bowls || DEFAULT_CMS_DATA.bowls,
      ingredients: parsed.ingredients || DEFAULT_CMS_DATA.ingredients,
      news: parsed.news || DEFAULT_CMS_DATA.news,
      testimonials: parsed.testimonials || DEFAULT_CMS_DATA.testimonials,
      orders: parsed.orders || DEFAULT_CMS_DATA.orders,
    };
  } catch (error) {
    console.error("Failed to read CMS data:", error);
    return DEFAULT_CMS_DATA;
  }
}

export function saveCMSData(data: CMSData): CMSData {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  return data;
}

export function resetCMSData(): CMSData {
  return saveCMSData(DEFAULT_CMS_DATA);
}
