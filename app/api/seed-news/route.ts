import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import Parser from "rss-parser";

const parser = new Parser();
const OLLAMA_API = "http://localhost:11434/api/generate";
const MODEL_NAME = "qwen2.5-coder:7b";

const RSS_SOURCES = [
  { name: "VnExpress BDS",    url: "https://vnexpress.net/rss/bat-dong-san.rss",  category: "Thị trường" },
  { name: "Vietnamnet BDS",   url: "https://vietnamnet.vn/rss/bat-dong-san.rss",  category: "Thị trường" },
  { name: "CafeF BDS",        url: "https://cafef.vn/bat-dong-san.rss",           category: "Thị trường" },
  { name: "Dân Trí BDS",      url: "https://dantri.com.vn/bat-dong-san.rss",      category: "Thị trường" },
  { name: "VnExpress KD",     url: "https://vnexpress.net/rss/kinh-doanh.rss",    category: "Kinh tế" },
  { name: "CafeF Đầu tư",     url: "https://cafef.vn/dau-tu.rss",                category: "Kinh tế" },
  { name: "Tuổi Trẻ Nhà đất", url: "https://tuoitre.vn/rss/nha-dat.rss",         category: "Quy hoạch" },
  { name: "Vietnamnet Xây d.", url: "https://vietnamnet.vn/rss/xay-dung.rss",     category: "Quy hoạch" },
  { name: "CafeF TC cá nhân", url: "https://cafef.vn/tai-chinh-ca-nhan.rss",     category: "Kinh nghiệm" },
];

// ─────────────────────────────────────────────────────────
// Fetch full HTML của bài gốc → lấy text + danh sách ảnh
// ─────────────────────────────────────────────────────────
async function fetchFullArticle(url: string): Promise<{ text: string; images: string[] }> {
  if (!url) return { text: "", images: [] };
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "vi-VN,vi;q=0.9",
      },
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return { text: "", images: [] };

    const html = await res.text();

    // --- Trích toàn bộ ảnh từ thẻ <img src="..."> ---
    const imgRx = /(?:src|data-src|data-original)="(https?:\/\/[^"]+\.(?:jpg|jpeg|png|webp)(?:\?[^"]*)?)"/gi;
    const images: string[] = [];
    const seen = new Set<string>();
    for (const m of html.matchAll(imgRx)) {
      const u = m[1];
      // Bỏ qua logo, avatar, icon, tracking pixel
      if (/logo|avatar|icon|pixel|ads|banner|sprite|1x1/i.test(u)) continue;
      if (!seen.has(u)) { seen.add(u); images.push(u); }
      if (images.length >= 6) break;
    }

    // --- Strip HTML lấy văn bản thuần ---
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<(nav|header|footer|aside|form|button|iframe|svg)[^>]*>[\s\S]*?<\/\1>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/\s{2,}/g, " ")
      .trim()
      .substring(0, 5000); // Giữ 5000 ký tự đầu làm context cho AI

    return { text, images };
  } catch {
    return { text: "", images: [] };
  }
}

// ─────────────────────────────────────────────────────────
// Slug & dedup
// ─────────────────────────────────────────────────────────
function toBaseSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 80);
}

// ─────────────────────────────────────────────────────────
// Gọi AI — viết lại bài dài, đầy đủ
// ─────────────────────────────────────────────────────────
async function rewriteWithAI(
  title: string,
  fullText: string,
  sourceName: string,
  category: string,
  imageCount: number,
  send: (m: string) => void
): Promise<Record<string, unknown> | null> {

  // Tạo danh sách placeholder ảnh tùy theo số ảnh có được
  const imgPlaceholders = imageCount >= 3
    ? "Chèn [IMAGE_1] sau intro, [IMAGE_2] ở giữa bài (sau h2 thứ 2-3), [IMAGE_3] trước phần kết."
    : imageCount >= 2
    ? "Chèn [IMAGE_1] sau intro, [IMAGE_2] ở giữa bài."
    : "Chèn [IMAGE_1] sau đoạn mở đầu.";

  const prompt = `Bạn là chuyên gia biên tập báo Bất động sản Việt Nam, phong cách VnExpress.
Dựa trên nội dung gốc từ ${sourceName}, viết lại thành bài báo chuyên sâu, đầy đủ thông tin, chuẩn SEO, chuyên mục "${category}".

===NỘI DUNG GỐC===
Tiêu đề: ${title}
Nội dung: ${fullText || "(Không có nội dung gốc — hãy sáng tác dựa trên tiêu đề)"}
===KẾT THÚC NỘI DUNG GỐC===

YÊU CẦU BẮT BUỘC:
1. Độ dài: 1500-2500 từ (QUAN TRỌNG — bài phải thật sự dài và đầy đủ)
2. Cấu trúc HTML: dùng <h2>, <h3>, <p>, <ul>, <li>, <strong>, <blockquote>
3. Tối thiểu 4 mục <h2> độc lập, mỗi mục có 2-4 đoạn <p> chi tiết
4. ${imgPlaceholders}
5. Kết thúc bằng section <h2>Kết luận</h2> với 1-2 đoạn tổng kết
6. Văn phong tự nhiên, chuyên nghiệp như báo chí Việt Nam, KHÔNG sáo rỗng

Trả về JSON hợp lệ (không giải thích):
{
  "title": "Tiêu đề mới dưới 70 ký tự, hấp dẫn, chứa từ khóa",
  "metaDesc": "Mô tả meta 150-160 ký tự thu hút người đọc",
  "content": "Toàn bộ nội dung HTML 1500-2500 từ như yêu cầu",
  "tags": ["tag1","tag2","tag3","tag4","tag5"],
  "authorName": "Chọn 1: Lê Bá Tùng|Thanh Nhàn|Hoàng Phan|Minh Tú|Khánh An|Trần Đức|Ngọc Mai|Quốc Hoàn|Anh Tuấn|Thùy Linh"
}`;

  try {
    const res = await fetch(OLLAMA_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL_NAME,
        prompt,
        stream: false,
        format: "json",
        options: {
          num_predict: 4096,   // Cho phép output dài hơn
          temperature: 0.7,
          top_p: 0.9,
        },
      }),
    });

    if (!res.ok) {
      const err = await res.text().catch(() => "");
      send(`   ⚠️  Ollama HTTP ${res.status}: ${err.substring(0, 80)}`);
      return null;
    }

    const data = await res.json();
    let raw = (data.response || "").trim();
    raw = raw.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();

    if (!raw) {
      send(`   ⚠️  Ollama trả về rỗng. Kiểm tra: ollama list`);
      return null;
    }

    return JSON.parse(raw);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("ECONNREFUSED") || msg.includes("fetch failed")) {
      send(`   ❌ Không kết nối Ollama. Chạy: ollama serve`);
    } else {
      send(`   ❌ Lỗi AI: ${msg.substring(0, 100)}`);
    }
    return null;
  }
}

// ─────────────────────────────────────────────────────────
// Build HTML content — chèn ảnh vào đúng placeholder
// ─────────────────────────────────────────────────────────
function buildContent(
  rawContent: string,
  images: string[],
  articleTitle: string,
  sourceName: string,
  authorName: string
): string {
  // Fallback nếu không có ảnh nào
  const fallback = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&auto=format&fit=crop";
  const imgs = images.length > 0 ? images : [fallback];

  const makeImg = (src: string, idx: number) =>
    `<figure class="my-8 rounded-xl overflow-hidden border border-gray-100 shadow-md">
  <img src="${src}" alt="${articleTitle.replace(/"/g, "'")}" loading="lazy"
       class="w-full max-h-[480px] object-cover" />
  <figcaption class="text-xs text-gray-400 text-center py-2 px-4 bg-gray-50 italic">
    Ảnh ${idx + 1} — Nguồn: ${sourceName}
  </figcaption>
</figure>`;

  let content = rawContent;

  // Thay từng placeholder [IMAGE_1], [IMAGE_2], [IMAGE_3]...
  for (let i = 0; i < 3; i++) {
    const placeholder = `[IMAGE_${i + 1}]`;
    if (content.includes(placeholder)) {
      content = content.replace(placeholder, makeImg(imgs[i] ?? imgs[0], i));
    }
  }

  // Nếu vẫn còn [IMAGE_HERE] cũ → thay luôn
  if (content.includes("[IMAGE_HERE]")) {
    content = content.replace("[IMAGE_HERE]", makeImg(imgs[0], 0));
  }

  // Nếu AI quên đặt placeholder nhưng có ảnh → chèn sau thẻ <p> đầu tiên
  if (!content.includes('<figure') && imgs.length > 0) {
    content = content.replace(/<\/p>/, `</p>\n${makeImg(imgs[0], 0)}`);
  }

  return (
    content +
    `\n<p class="text-right font-semibold mt-12 pt-6 border-t border-gray-100 italic text-gray-500 text-sm">
  Biên tập: <strong>${authorName}</strong> — NhaDat.vn
</p>`
  );
}

// ─────────────────────────────────────────────────────────
// Main GET handler
// ─────────────────────────────────────────────────────────
export async function GET() {
  const encoder = new TextEncoder();
  const pad = " ".repeat(512);
  const send_ = (controller: ReadableStreamDefaultController, msg: string) =>
    controller.enqueue(encoder.encode(msg + pad + "\n"));

  const stream = new ReadableStream({
    async start(controller) {
      const send = (msg: string) => send_(controller, msg);

      send("🏗️  KHỞI ĐỘNG DÂY CHUYỀN TIN TỨC AI...");
      send(`📡  Model: ${MODEL_NAME} | Nguồn: ${RSS_SOURCES.length} feeds`);
      send(`📝  Chế độ: Fetch full article → AI viết lại 1500-2500 từ`);

      // Kiểm tra Ollama
      try {
        const ping = await fetch("http://localhost:11434/api/tags");
        if (!ping.ok) throw new Error("not ok");
        const pdata = await ping.json();
        const models: string[] = (pdata.models || []).map((m: { name: string }) => m.name);
        send(`✅  Ollama OK — ${models.join(", ") || "(trống)"}`);
        if (!models.some((m) => m.startsWith(MODEL_NAME.split(":")[0]))) {
          send(`⚠️  Model "${MODEL_NAME}" chưa có — chạy: ollama pull ${MODEL_NAME}`);
        }
      } catch {
        send(`❌  Không kết nối Ollama — chạy: ollama serve`);
        controller.close();
        return;
      }

      try {
        let admin = await db.user.findFirst({ where: { role: "ADMIN" } });
        if (!admin) admin = await db.user.findFirst();
        if (!admin) { send("❌ Không có user trong DB."); controller.close(); return; }
        send(`👤  Tác giả: ${admin.name || admin.email}`);

        let created = 0, skipped = 0, failed = 0;

        for (const source of RSS_SOURCES) {
          send(`\n📰  [${source.name}] Tải RSS...`);

          let feed;
          try { feed = await parser.parseURL(source.url); }
          catch (e) {
            send(`⚠️  Lỗi RSS: ${e instanceof Error ? e.message : "unknown"}`);
            continue;
          }
          send(`   ${feed.items.length} bài — xử lý TẤT CẢ`);

          for (const item of feed.items) {
            if (!item.title) continue;

            const baseSlug = toBaseSlug(item.title);
            const existing = await db.article.findFirst({
              where: { slug: { startsWith: baseSlug.substring(0, 60) } },
              select: { id: true },
            });
            if (existing) { send(`   ⏭️  Trùng: "${item.title.substring(0, 50)}"`); skipped++; continue; }

            send(`   🌐 Fetch full bài: ${item.link?.substring(0, 60) ?? "(no url)"}...`);
            const { text: fullText, images } = await fetchFullArticle(item.link ?? "");
            send(`   📄 Lấy được: ${fullText.length} ký tự, ${images.length} ảnh`);

            send(`   🤖 AI đang viết bài dài (1500-2500 từ)...`);
            const aiData = await rewriteWithAI(
              item.title,
              fullText,
              source.name,
              source.category,
              images.length,
              send
            );

            if (!aiData?.title || !aiData?.content) {
              send(`   ❌ Bỏ qua — AI không trả dữ liệu hợp lệ.`);
              failed++; continue;
            }

            const wordCount = (aiData.content as string).replace(/<[^>]+>/g, " ").split(/\s+/).length;
            send(`   📊 Độ dài bài: ~${wordCount} từ, ${images.length} ảnh nhúng`);

            const coverImage = images[0]
              ?? (item as unknown as Record<string, unknown>)["enclosure"] as string
              ?? "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&auto=format&fit=crop";

            const finalContent = buildContent(
              aiData.content as string,
              images,
              aiData.title as string,
              source.name,
              aiData.authorName as string
            );

            const slug = baseSlug + "-" + Date.now().toString(36);

            await db.article.create({
              data: {
                title: aiData.title as string,
                slug,
                metaDesc: (aiData.metaDesc as string) || "",
                content: finalContent,
                coverImage: typeof coverImage === "string" ? coverImage
                  : "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&auto=format&fit=crop",
                category: source.category,
                tags: Array.isArray(aiData.tags) ? (aiData.tags as string[]) : [],
                published: true,
                authorId: admin.id,
              },
            });

            send(`   ✅ Xuất bản: "${(aiData.title as string).substring(0, 55)}" (~${wordCount} từ)`);
            created++;

            await new Promise((r) => setTimeout(r, 1500));
          }
        }

        send(`\n${"─".repeat(55)}`);
        send(`💎 HOÀN THÀNH!`);
        send(`   ✅ Tạo mới : ${created} bài`);
        send(`   ⏭️  Bỏ qua  : ${skipped} bài (đã có)`);
        send(`   ❌ Lỗi     : ${failed} bài`);
        controller.close();
      } catch (err) {
        send(`\n❌ Lỗi hệ thống: ${err instanceof Error ? err.message : String(err)}`);
        controller.close();
      }
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
