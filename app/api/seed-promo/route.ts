import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const OLLAMA_API = "http://localhost:11434/api/generate";
const MODEL_NAME = "qwen2.5-coder:7b";

// -----------------------------------------------------------------------
// 20 chủ đề SEO — mỗi chủ đề có ảnh Unsplash riêng đúng nội dung
// -----------------------------------------------------------------------
const PROMO_TOPICS = [
  {
    slug_prefix: "nhadat-vn-trang-rao-vat-bds-mien-phi-tot-nhat-viet-nam",
    angle: "Giới thiệu tổng quan NhaDat.vn: trang rao vặt bất động sản miễn phí, không qua môi giới, kết nối trực tiếp người mua và người bán toàn quốc.",
    category: "Hướng dẫn",
    tags: ["nhadat.vn", "rao vặt bất động sản", "đăng tin miễn phí", "mua bán nhà đất"],
    // Chìa khóa nhà — biểu tượng mua bán BDS
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&auto=format&fit=crop",
  },
  {
    slug_prefix: "huong-dan-dang-tin-bat-dong-san-mien-phi-hieu-qua",
    angle: "Hướng dẫn từng bước đăng tin bất động sản miễn phí trên NhaDat.vn: chụp ảnh đẹp, viết tiêu đề thu hút, định giá hợp lý để bán nhanh.",
    category: "Hướng dẫn",
    tags: ["đăng tin nhà đất", "bán nhà nhanh", "kinh nghiệm đăng tin", "nhadat.vn"],
    // Người dùng điện thoại đăng tin
    image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&auto=format&fit=crop",
  },
  {
    slug_prefix: "so-sanh-trang-rao-vat-bat-dong-san-lon-nhat-viet-nam-2026",
    angle: "So sánh khách quan các trang rao vặt BDS lớn tại Việt Nam (NhaDat.vn, Batdongsan.com.vn, Chotot.com, Mogi.vn). Phân tích ưu nhược điểm, chi phí, lượng truy cập, tính năng. NhaDat.vn nổi bật với chính sách MIỄN PHÍ hoàn toàn.",
    category: "So sánh",
    tags: ["so sánh trang BDS", "trang rao vặt nhà đất", "tốt nhất việt nam", "nhadat.vn"],
    // Laptop với biểu đồ phân tích
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop",
  },
  {
    slug_prefix: "5-ly-do-chon-nhadat-vn-ban-nha-khong-qua-moi-gioi",
    angle: "5 lý do cụ thể tại sao người bán nên đăng tin trực tiếp trên NhaDat.vn thay vì qua môi giới: tiết kiệm 2-3% hoa hồng, chủ động thương lượng, miễn phí, tiếp cận rộng, bảo mật thông tin.",
    category: "Kinh nghiệm",
    tags: ["bán nhà không qua môi giới", "tiết kiệm hoa hồng", "nhadat.vn", "tự bán nhà"],
    // Biển bán nhà trước cổng
    image: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=1200&auto=format&fit=crop",
  },
  {
    slug_prefix: "tim-nha-thue-gia-re-uy-tin-tren-nhadat-vn",
    angle: "Hướng dẫn tìm nhà thuê giá rẻ, uy tín qua NhaDat.vn: bộ lọc theo giá, diện tích, khu vực; cách nhận diện tin đăng chính chủ, tránh lừa đảo.",
    category: "Hướng dẫn",
    tags: ["thuê nhà giá rẻ", "tìm nhà thuê", "nhadat.vn", "nhà thuê chính chủ"],
    // Nội thất phòng khách căn hộ cho thuê
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&auto=format&fit=crop",
  },
  {
    slug_prefix: "kinh-nghiem-mua-ban-nha-dat-online-an-toan-2026",
    angle: "Kinh nghiệm thực tế mua bán nhà đất online an toàn: xác minh pháp lý sổ đỏ/sổ hồng, kiểm tra quy hoạch, gặp trực tiếp chủ nhà, giao dịch qua công chứng. Tại sao NhaDat.vn là nền tảng tin cậy?",
    category: "Kinh nghiệm",
    tags: ["mua bán nhà online", "an toàn giao dịch BDS", "kinh nghiệm mua nhà", "nhadat.vn"],
    // Ký hợp đồng mua bán
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&auto=format&fit=crop",
  },
  {
    slug_prefix: "cach-viet-tin-rao-bat-dong-san-thu-hut-nguoi-mua",
    angle: "Bí quyết viết tiêu đề và nội dung tin rao bất động sản thu hút click: sử dụng từ khóa, nêu rõ ưu điểm, giá cạnh tranh, ảnh thực tế. Ví dụ tin rao mẫu đạt 1000+ lượt xem/ngày trên NhaDat.vn.",
    category: "Hướng dẫn",
    tags: ["viết tin rao BDS", "tăng lượt xem tin đăng", "bán nhà nhanh", "nhadat.vn"],
    // Gõ bàn phím viết nội dung
    image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&auto=format&fit=crop",
  },
  {
    slug_prefix: "dinh-gia-nha-dat-chinh-xac-truoc-khi-rao-ban",
    angle: "Cách định giá nhà đất chính xác trước khi đăng tin rao bán: so sánh giá thị trường khu vực, tính toán theo m2, dùng công cụ định giá online của NhaDat.vn.",
    category: "Kinh nghiệm",
    tags: ["định giá nhà đất", "giá thị trường BDS", "nhadat.vn", "bán nhà đúng giá"],
    // Máy tính và tiền — tính toán tài chính
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&auto=format&fit=crop",
  },
  {
    slug_prefix: "bat-dong-san-chung-cu-ha-noi-tphcm-dang-tin-mien-phi",
    angle: "Thị trường chung cư Hà Nội và TP.HCM 2026: xu hướng giá, các khu vực hot. Hướng dẫn mua/thuê chung cư qua NhaDat.vn với hàng ngàn tin đăng chính chủ miễn phí.",
    category: "Thị trường",
    tags: ["chung cư Hà Nội", "chung cư TP.HCM", "mua căn hộ 2026", "nhadat.vn"],
    // Tòa chung cư cao tầng đô thị
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&auto=format&fit=crop",
  },
  {
    slug_prefix: "dat-nen-ven-do-co-hoi-dau-tu-tim-qua-nhadat-vn",
    angle: "Cơ hội đầu tư đất nền vùng ven 2026: các khu vực tiềm năng quanh Hà Nội và TP.HCM. Cách tìm kiếm và lọc đất nền pháp lý chuẩn, giá tốt trên NhaDat.vn.",
    category: "Đầu tư",
    tags: ["đất nền vùng ven", "đầu tư đất nền", "tìm đất nền", "nhadat.vn"],
    // Lô đất xây dựng / khu đô thị mới
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&auto=format&fit=crop",
  },
  {
    slug_prefix: "nhadat-vn-ket-noi-nguoi-mua-ban-truc-tiep-tiet-kiem-chi-phi",
    angle: "Mô hình kết nối trực tiếp người mua – người bán của NhaDat.vn: loại bỏ trung gian, tiết kiệm chi phí, minh bạch giá cả. So sánh với mô hình truyền thống qua sàn môi giới.",
    category: "Kinh nghiệm",
    tags: ["giao dịch trực tiếp BDS", "không môi giới", "nhadat.vn", "tiết kiệm chi phí"],
    // Bắt tay giao dịch trực tiếp
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1200&auto=format&fit=crop",
  },
  {
    slug_prefix: "xu-huong-mua-ban-bat-dong-san-online-viet-nam-2026",
    angle: "Xu hướng PropTech và mua bán BDS online tại Việt Nam 2026: số liệu thị trường, hành vi người dùng, tại sao các nền tảng miễn phí như NhaDat.vn ngày càng được ưa chuộng.",
    category: "Thị trường",
    tags: ["PropTech Việt Nam", "BDS online 2026", "xu hướng nhà đất", "nhadat.vn"],
    // Smartphone + app bất động sản
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1200&auto=format&fit=crop",
  },
  {
    slug_prefix: "nha-o-xa-hoi-tim-kiem-dat-mua-tren-nhadat-vn",
    angle: "Nhà ở xã hội 2026: chính sách mới, đối tượng được mua, danh sách dự án tại Hà Nội và TP.HCM. Cách tìm kiếm nhà ở xã hội đang mở bán qua NhaDat.vn.",
    category: "Chính sách",
    tags: ["nhà ở xã hội", "mua nhà xã hội 2026", "chính sách nhà ở", "nhadat.vn"],
    // Khu nhà ở xã hội / nhà bình dân
    image: "https://images.unsplash.com/photo-1464938050520-ef2270bb8ce8?w=1200&auto=format&fit=crop",
  },
  {
    slug_prefix: "cho-thue-phong-tro-nguyen-can-hieu-qua-tren-nhadat-vn",
    angle: "Hướng dẫn chủ nhà trọ đăng tin cho thuê phòng trọ/nguyên căn hiệu quả trên NhaDat.vn: tối ưu ảnh, mô tả tiện ích, xác định giá thuê phù hợp, tiếp cận người thuê chất lượng.",
    category: "Hướng dẫn",
    tags: ["cho thuê phòng trọ", "đăng tin cho thuê", "chủ nhà trọ", "nhadat.vn"],
    // Phòng ngủ căn hộ cho thuê
    image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1200&auto=format&fit=crop",
  },
  {
    slug_prefix: "phap-ly-nha-dat-can-biet-truoc-khi-mua-ban",
    angle: "Những điều cần biết về pháp lý nhà đất khi mua bán: sổ đỏ sổ hồng, kiểm tra quy hoạch, hợp đồng mua bán, thuế phí. Tại sao NhaDat.vn luôn khuyến khích giao dịch có công chứng.",
    category: "Pháp lý",
    tags: ["pháp lý nhà đất", "sổ hồng sổ đỏ", "mua bán an toàn", "nhadat.vn"],
    // Hồ sơ pháp lý / tài liệu
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200&auto=format&fit=crop",
  },
  {
    slug_prefix: "top-tinh-nang-noi-bat-cua-nhadat-vn-2026",
    angle: "Điểm qua các tính năng nổi bật của NhaDat.vn năm 2026: đăng tin miễn phí, công cụ định giá AI, bộ lọc tìm kiếm thông minh, bản đồ quy hoạch, so sánh BDS.",
    category: "Hướng dẫn",
    tags: ["tính năng nhadat.vn", "công cụ BDS", "nền tảng bất động sản", "nhadat.vn"],
    // Màn hình app / giao diện website
    image: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=1200&auto=format&fit=crop",
  },
  {
    slug_prefix: "mua-nha-lan-dau-nhung-sai-lam-can-tranh",
    angle: "10 sai lầm phổ biến khi mua nhà lần đầu: không kiểm tra pháp lý, mua vượt ngân sách, bỏ qua chi phí phát sinh, tin lời môi giới mà không tự tìm hiểu. Tại sao NhaDat.vn giúp người mua tự tin hơn?",
    category: "Kinh nghiệm",
    tags: ["kinh nghiệm mua nhà lần đầu", "sai lầm mua nhà", "tư vấn BDS", "nhadat.vn"],
    // Cặp đôi trẻ xem nhà lần đầu
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&auto=format&fit=crop",
  },
  {
    slug_prefix: "dau-tu-bat-dong-san-cho-thue-sinh-loi-on-dinh",
    angle: "Chiến lược đầu tư BDS cho thuê sinh lời ổn định 2026: chọn loại hình (nhà phố, căn hộ, phòng trọ), tính toán yield, tìm kiếm và đánh giá BDS qua NhaDat.vn.",
    category: "Đầu tư",
    tags: ["đầu tư BDS cho thuê", "lợi suất nhà cho thuê", "đầu tư bất động sản", "nhadat.vn"],
    // Biểu đồ tăng trưởng đầu tư
    image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=1200&auto=format&fit=crop",
  },
  {
    slug_prefix: "nhadat-vn-ban-do-quy-hoach-kiem-tra-truoc-khi-mua",
    angle: "Tầm quan trọng của việc kiểm tra quy hoạch trước khi mua đất: tránh mua đất dính dự án, đất nông nghiệp không được xây dựng. NhaDat.vn tích hợp bản đồ quy hoạch giúp người mua kiểm tra nhanh.",
    category: "Pháp lý",
    tags: ["kiểm tra quy hoạch", "bản đồ quy hoạch", "mua đất an toàn", "nhadat.vn"],
    // Bản đồ thành phố / quy hoạch đô thị
    image: "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1200&auto=format&fit=crop",
  },
  {
    slug_prefix: "cong-cu-dinh-gia-bat-dong-san-ai-tren-nhadat-vn",
    angle: "Công cụ định giá bất động sản AI của NhaDat.vn: cơ chế hoạt động, độ chính xác, cách sử dụng để đàm phán giá tốt hơn khi mua bán hoặc cho thuê nhà đất.",
    category: "Hướng dẫn",
    tags: ["định giá AI", "công cụ định giá BDS", "nhadat.vn", "ước tính giá nhà"],
    // AI / data analysis / công nghệ
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop",
  },
];

function toSlug(text: string): string {
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

async function generatePromoArticle(topic: (typeof PROMO_TOPICS)[number]) {
  const prompt = `Bạn là chuyên gia nội dung SEO bất động sản Việt Nam. Viết bài báo chuẩn SEO theo chủ đề sau cho website NhaDat.vn — trang rao vặt bất động sản miễn phí uy tín nhất Việt Nam.

CHỦ ĐỀ & GÓC NHÌN:
${topic.angle}

YÊU CẦU CONTENT:
- Bài viết 700-900 từ, thân thiện, gần gũi, phong cách báo chí Việt Nam
- Sử dụng HTML (<h2>, <h3>, <p>, <ul>, <li>, <strong>)
- Chèn placeholder [IMAGE_HERE] sau đoạn mở đầu đầu tiên
- Tự nhiên nhắc đến "NhaDat.vn" 3-4 lần trong bài (không spam)
- Kêu gọi hành động (CTA) ở cuối bài
- Danh mục: ${topic.category}

Trả về JSON hợp lệ với cấu trúc:
{
  "title": "Tiêu đề bài viết dưới 70 ký tự, chứa từ khóa chính",
  "metaDesc": "Mô tả meta 150-160 ký tự hấp dẫn người đọc click",
  "content": "Nội dung HTML đầy đủ",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "authorName": "Một trong: Lê Bá Tùng | Thanh Nhàn | Hoàng Phan | Minh Tú | Khánh An | Trần Đức | Ngọc Mai | Quốc Hoàn"
}

Chỉ trả về JSON, không giải thích.`;

  const response = await fetch(OLLAMA_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: MODEL_NAME, prompt, stream: false, format: "json" }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    throw new Error(`Ollama HTTP ${response.status}: ${errText.substring(0, 100)}`);
  }

  const data = await response.json();
  let raw = (data.response || "").trim();
  if (!raw) throw new Error("Ollama trả về rỗng — kiểm tra model bằng: ollama list");
  raw = raw.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
  return JSON.parse(raw);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  // ?count=5 để chỉ tạo N bài (mặc định tất cả 20)
  const limitParam = searchParams.get("count");
  const limit = limitParam ? parseInt(limitParam, 10) : PROMO_TOPICS.length;

  const encoder = new TextEncoder();
  const pad = " ".repeat(512);

  const stream = new ReadableStream({
    async start(controller) {
      const send = (msg: string) => controller.enqueue(encoder.encode(msg + pad + "\n"));

      send("🚀  KHỞI ĐỘNG PIPELINE BÀI SEO NHADAT.VN...");
      send(`📝  Model: ${MODEL_NAME} | Sẽ tạo: ${limit} bài`);

      try {
        let admin = await db.user.findFirst({ where: { role: "ADMIN" } });
        if (!admin) admin = await db.user.findFirst();
        if (!admin) {
          send("❌ Không tìm thấy user trong DB.");
          controller.close();
          return;
        }

        let created = 0;
        let skipped = 0;
        let failed = 0;

        const topics = PROMO_TOPICS.slice(0, limit);

        for (let i = 0; i < topics.length; i++) {
          const topic = topics[i];
          send(`\n[${i + 1}/${topics.length}] 🤖 Đang tạo: ${topic.slug_prefix.substring(0, 50)}...`);

          // Kiểm tra bài đã tồn tại chưa (theo slug_prefix)
          const existing = await db.article.findFirst({
            where: { slug: { startsWith: topic.slug_prefix.substring(0, 40) } },
          });
          if (existing) {
            send(`   ⏭️  Đã có bài này — bỏ qua.`);
            skipped++;
            continue;
          }

          let aiData;
          try {
            aiData = await generatePromoArticle(topic);
          } catch (err) {
            send(`   ❌ AI thất bại: ${err instanceof Error ? err.message : "unknown"}`);
            failed++;
            continue;
          }

          if (!aiData?.title || !aiData?.content) {
            send(`   ❌ Dữ liệu AI không hợp lệ — bỏ qua.`);
            failed++;
            continue;
          }

          const coverImage = topic.image;
          const slug = topic.slug_prefix + "-" + Date.now().toString(36);

          const imageBlock = `<figure class="my-8 text-center bg-gray-50 p-4 rounded-xl border border-gray-100">
  <img src="${coverImage}" alt="${aiData.title}" class="rounded-lg mx-auto shadow-lg max-h-[420px] object-cover w-full" />
  <figcaption class="text-xs text-gray-400 mt-3 italic">Ảnh minh họa — NhaDat.vn</figcaption>
</figure>`;

          const finalContent =
            (aiData.content as string).replace("[IMAGE_HERE]", imageBlock) +
            `\n<p class="text-right font-semibold mt-10 italic text-gray-500">Biên tập: ${aiData.authorName} — NhaDat.vn</p>`;

          await db.article.create({
            data: {
              title: aiData.title,
              slug,
              metaDesc: aiData.metaDesc || "",
              content: finalContent,
              coverImage,
              category: topic.category,
              tags: Array.isArray(aiData.tags) ? aiData.tags : topic.tags,
              published: true,
              authorId: admin.id,
            },
          });

          send(`   ✅ Xuất bản: "${aiData.title}"`);
          created++;

          // Nghỉ 2s để Ollama không bị quá tải
          await new Promise((r) => setTimeout(r, 2000));
        }

        send(`\n${"=".repeat(60)}`);
        send(`🎯 XONG!  Tạo mới: ${created}  |  Bỏ qua: ${skipped}  |  Lỗi: ${failed}`);
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
      "X-Content-Type-Options": "nosniff",
    },
  });
}
