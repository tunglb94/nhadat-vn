/**
 * Crawler lấy tin BĐS từ chotot.com (public API của họ)
 *
 * Chạy: npx tsx scripts/crawl-chotot.ts
 * Options:
 *   --pages=5        Số trang muốn crawl (default: 3)
 *   --category=1010  Category chotot (default: 1010 = tất cả BĐS)
 *   --dry-run        In ra console, không lưu DB
 *
 * Category chotot:
 *   1010 = Tất cả BĐS
 *   1011 = Căn hộ / Chung cư
 *   1012 = Nhà ở (nhà phố, biệt thự)
 *   1013 = Đất
 *   1014 = Văn phòng / Mặt bằng
 *   1015 = Phòng trọ
 */

import { PrismaClient, ListingType, PropertyType, ListingStatus } from "@prisma/client";
import slugify from "slugify";

const db = new PrismaClient();

// ─── Config từ args ─────────────────────────────────────────────
const args = process.argv.slice(2);
const getArg = (key: string, fallback: string) =>
  args.find((a) => a.startsWith(`--${key}=`))?.split("=")[1] ?? fallback;

const PAGES     = parseInt(getArg("pages", "3"));
const CATEGORY  = getArg("category", "1010");
const DRY_RUN   = args.includes("--dry-run");
const DELAY_MS  = 2000; // 2 giây giữa mỗi request — tôn trọng server

// ─── Mapping ─────────────────────────────────────────────────────
const CHOTOT_CATEGORY_MAP: Record<number, PropertyType> = {
  1011: PropertyType.CAN_HO,
  1012: PropertyType.NHA_PHO,
  1013: PropertyType.DAT_NEN,
  1014: PropertyType.MAT_BANG,
  1015: PropertyType.PHONG_TRO,
  1018: PropertyType.BIET_THU,
};

function mapPropertyType(category: number, subject: string): PropertyType {
  if (CHOTOT_CATEGORY_MAP[category]) return CHOTOT_CATEGORY_MAP[category];
  const s = subject.toLowerCase();
  if (s.includes("biệt thự") || s.includes("biet thu")) return PropertyType.BIET_THU;
  if (s.includes("căn hộ") || s.includes("chung cư"))   return PropertyType.CAN_HO;
  if (s.includes("đất") || s.includes("dat nen"))       return PropertyType.DAT_NEN;
  if (s.includes("phòng trọ") || s.includes("phong tro")) return PropertyType.PHONG_TRO;
  if (s.includes("mặt bằng") || s.includes("văn phòng")) return PropertyType.MAT_BANG;
  return PropertyType.NHA_PHO;
}

function mapListingType(adType: string, price: number): ListingType {
  // chotot: type "s"=bán, "k"=cho thuê. Nếu giá < 100tr thường là thuê
  if (adType === "k") return ListingType.THUE;
  if (price > 0 && price < 100_000_000) return ListingType.THUE;
  return ListingType.BAN;
}

function normalizeProvince(name: string): string {
  return name
    .replace("Thành phố ", "")
    .replace("Tỉnh ", "")
    .trim();
}

function generateSlug(title: string): string {
  return slugify(title, { lower: true, locale: "vi", strict: true })
    .substring(0, 80) + "-" + Date.now().toString(36);
}

// ─── API fetch ───────────────────────────────────────────────────
interface ChotOtAd {
  list_id:       number;
  subject:       string;
  body:          string;
  price:         number;
  area:          number;
  address:       string;
  region_name:   string;  // tỉnh/thành
  area_name:     string;  // quận/huyện
  ward_name?:    string;
  category:      number;
  image:         string;
  images:        string[];
  account_name:  string;
  phone:         string;
  type:          string;  // "s" bán | "k" thuê
  date:          number;
  params?:       Array<{ label: string; value: string }>;
}

async function fetchPage(page: number): Promise<ChotOtAd[]> {
  const url = new URL("https://gateway.chotot.com/v1/public/ad-listing");
  url.searchParams.set("cg", CATEGORY);
  url.searchParams.set("limit", "20");
  url.searchParams.set("page", String(page));
  url.searchParams.set("st", "s,k"); // bán + thuê

  const res = await fetch(url.toString(), {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      "Accept":     "application/json",
      "Referer":    "https://www.chotot.com/",
    },
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} khi fetch trang ${page}`);
  }

  const data = await res.json() as { ads?: ChotOtAd[] };
  return data.ads ?? [];
}

async function fetchDetail(listId: number): Promise<Partial<ChotOtAd>> {
  try {
    const res = await fetch(
      `https://gateway.chotot.com/v1/public/ad-detail/${listId}`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Accept":     "application/json",
          "Referer":    "https://www.chotot.com/",
        },
      }
    );
    if (!res.ok) return {};
    const data = await res.json() as { ad?: Partial<ChotOtAd> };
    return data.ad ?? {};
  } catch {
    return {};
  }
}

// ─── Lấy hoặc tạo user placeholder để gán cho listing ────────────
async function getOrCreateCrawlerUser() {
  return db.user.upsert({
    where:  { email: "crawler@nhadat.vn" },
    update: {},
    create: {
      name:  "Crawler Bot",
      email: "crawler@nhadat.vn",
      role:  "AGENT",
    },
  });
}

// ─── Lưu 1 listing vào DB ─────────────────────────────────────────
async function saveListing(ad: ChotOtAd, userId: string): Promise<boolean> {
  const title = ad.subject?.trim();
  if (!title || title.length < 5) return false;
  if (!ad.area || ad.area <= 0)   return false;
  if (!ad.price || ad.price <= 0) return false;

  const province     = normalizeProvince(ad.region_name ?? "");
  const district     = ad.area_name?.trim() ?? "";
  const ward         = ad.ward_name?.trim() ?? undefined;
  const description  = ad.body?.trim() ?? title;
  const propertyType = mapPropertyType(ad.category, title);
  const listingType  = mapListingType(ad.type, ad.price);
  const pricePerM2   = Math.round(ad.price / ad.area);
  const slug         = generateSlug(title);

  // Lấy thêm params từ detail nếu cần
  const params = ad.params ?? [];
  const getParam = (label: string) =>
    params.find((p) => p.label.toLowerCase().includes(label.toLowerCase()))?.value;

  const bedrooms  = parseInt(getParam("phòng ngủ") ?? getParam("ngủ") ?? "") || null;
  const bathrooms = parseInt(getParam("toilet") ?? getParam("vệ sinh") ?? "") || null;
  const floors    = parseInt(getParam("tầng") ?? "") || null;
  const direction = getParam("hướng") ?? undefined;

  const images = [
    ad.image,
    ...(ad.images ?? []),
  ].filter(Boolean).slice(0, 10);

  if (DRY_RUN) {
    console.log(`  [DRY] ${title.substring(0, 60)} — ${(ad.price / 1e9).toFixed(1)}tỷ — ${district}, ${province}`);
    return true;
  }

  await db.listing.create({
    data: {
      userId,
      title,
      slug,
      description:  description.length < 20 ? `${title}. ${description}` : description,
      type:         listingType,
      propertyType,
      status:       ListingStatus.ACTIVE,
      price:        ad.price,
      area:         ad.area,
      pricePerM2,
      bedrooms,
      bathrooms,
      floors:       floors ?? null,
      direction:    direction ?? null,
      province:     province || "Hồ Chí Minh",
      district:     district || "Không rõ",
      ward,
      address:      ad.address?.trim() ?? `${district}, ${province}`,
      expiresAt:    new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      verified:     false,
      images: images.length > 0 ? {
        create: images.map((url, i) => ({
          url,
          order:   i,
          isCover: i === 0,
        })),
      } : undefined,
    },
  });

  return true;
}

// ─── Main ────────────────────────────────────────────────────────
async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  console.log(`\n🕷️  Crawler chotot.com`);
  console.log(`   Category: ${CATEGORY} | Pages: ${PAGES} | Dry-run: ${DRY_RUN}`);
  console.log(`   Delay: ${DELAY_MS}ms giữa mỗi request\n`);

  const crawlerUser = DRY_RUN ? { id: "dry" } : await getOrCreateCrawlerUser();
  let saved = 0, skipped = 0, errors = 0;

  for (let page = 1; page <= PAGES; page++) {
    console.log(`📄 Trang ${page}/${PAGES}...`);

    let ads: ChotOtAd[];
    try {
      ads = await fetchPage(page);
    } catch (err) {
      console.error(`  ❌ Lỗi trang ${page}:`, err);
      errors++;
      await sleep(DELAY_MS * 2);
      continue;
    }

    if (ads.length === 0) {
      console.log("  Hết dữ liệu.");
      break;
    }

    console.log(`  Tìm thấy ${ads.length} tin`);

    for (const ad of ads) {
      try {
        // Lấy thêm detail để có params (phòng ngủ, tầng...)
        await sleep(300);
        const detail = await fetchDetail(ad.list_id);
        const fullAd = { ...ad, ...detail, params: detail.params ?? ad.params };

        const ok = await saveListing(fullAd as ChotOtAd, crawlerUser.id);
        if (ok) { saved++; process.stdout.write("  ✅ "); }
        else    { skipped++; process.stdout.write("  ⏭️  "); }
      } catch (err: unknown) {
        // Lỗi unique slug — slug đã tồn tại thì bỏ qua
        const msg = err instanceof Error ? err.message : "";
        if (msg.includes("Unique")) skipped++;
        else { errors++; console.error(`  ❌ ${ad.list_id}:`, msg); }
      }
    }
    console.log();

    if (page < PAGES) {
      console.log(`  ⏳ Đợi ${DELAY_MS / 1000}s...\n`);
      await sleep(DELAY_MS);
    }
  }

  if (!DRY_RUN) {
    const total = await db.listing.count();
    console.log(`\n🎉 Xong!`);
    console.log(`   Đã lưu:   ${saved}`);
    console.log(`   Bỏ qua:   ${skipped}`);
    console.log(`   Lỗi:      ${errors}`);
    console.log(`   Tổng DB:  ${total} listings`);
  } else {
    console.log(`\n🎉 Dry-run xong. Tìm thấy ${saved} tin hợp lệ.`);
  }
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
