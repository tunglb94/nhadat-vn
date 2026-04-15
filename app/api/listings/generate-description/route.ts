import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const Schema = z.object({
  type:         z.string(),
  propertyType: z.string(),
  price:        z.union([z.string(), z.number()]),
  area:         z.union([z.string(), z.number()]),
  bedrooms:     z.union([z.string(), z.number()]).optional(),
  bathrooms:    z.union([z.string(), z.number()]).optional(),
  floors:       z.union([z.string(), z.number()]).optional(),
  direction:    z.string().optional(),
  province:     z.string().optional(),
  district:     z.string().optional(),
  ward:         z.string().optional(),
  street:       z.string().optional(),
  address:      z.string().optional(),
});

const PROPERTY_TYPE_LABEL: Record<string, string> = {
  NHA_PHO:   "nhà phố",
  CAN_HO:    "căn hộ",
  BIET_THU:  "biệt thự",
  DAT_NEN:   "đất nền",
  MAT_BANG:  "mặt bằng",
  PHONG_TRO: "phòng trọ",
};

function formatPriceVN(price: number): string {
  if (price >= 1_000_000_000) return `${(price / 1_000_000_000).toFixed(1)} tỷ`;
  if (price >= 1_000_000) return `${Math.round(price / 1_000_000)} triệu`;
  return price.toLocaleString("vi-VN") + " đồng";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = Schema.parse(body);

    const price  = Number(data.price);
    const area   = Number(data.area);
    const typeLabel = data.type === "BAN" ? "bán" : "cho thuê";
    const propLabel = PROPERTY_TYPE_LABEL[data.propertyType] ?? data.propertyType;
    const location  = [data.street, data.ward, data.district, data.province]
      .filter(Boolean).join(", ");

    const apiKey = process.env.OPENAI_API_KEY;

    // Nếu không có OpenAI key → trả về template mặc định
    if (!apiKey) {
      return NextResponse.json(generateTemplate(data, typeLabel, propLabel, price, area, location));
    }

    const prompt = `Viết tin đăng bất động sản chuyên nghiệp bằng tiếng Việt với thông tin sau:
- Loại: ${typeLabel} ${propLabel}
- Giá: ${formatPriceVN(price)}${data.type === "THUE" ? "/tháng" : ""}
- Diện tích: ${area}m²
${data.bedrooms ? `- Phòng ngủ: ${data.bedrooms}` : ""}
${data.bathrooms ? `- Toilet: ${data.bathrooms}` : ""}
${data.floors ? `- Số tầng: ${data.floors}` : ""}
${data.direction ? `- Hướng: ${data.direction}` : ""}
- Địa chỉ: ${location || data.district}

Yêu cầu:
1. Tiêu đề: ngắn gọn, súc tích, dưới 80 ký tự, nêu rõ loại BĐS + vị trí + điểm nổi bật
2. Mô tả: 3-4 đoạn, nêu vị trí, đặc điểm nổi bật, tiện ích xung quanh, kêu gọi liên hệ
3. Giọng văn chuyên nghiệp, trung thực, không dùng từ "tuyệt vời" hay "đẳng cấp"

Trả về JSON: { "title": "...", "description": "..." }`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.7,
        max_tokens: 600,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) throw new Error("OpenAI error");

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content ?? "";

    // Parse JSON từ response AI
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Invalid AI response");

    const result = JSON.parse(jsonMatch[0]);
    return NextResponse.json({
      title: result.title ?? "",
      description: result.description ?? "",
    });
  } catch (err) {
    console.error("generate-description error:", err);
    // Fallback về template nếu AI lỗi
    try {
      const body = await req.clone().json().catch(() => ({}));
      const data = Schema.parse(body);
      const typeLabel = data.type === "BAN" ? "bán" : "cho thuê";
      const propLabel = PROPERTY_TYPE_LABEL[data.propertyType] ?? data.propertyType;
      const price = Number(data.price);
      const area  = Number(data.area);
      const location = [data.street, data.ward, data.district, data.province].filter(Boolean).join(", ");
      return NextResponse.json(generateTemplate(data, typeLabel, propLabel, price, area, location));
    } catch {
      return NextResponse.json({ error: "Không thể tạo mô tả" }, { status: 500 });
    }
  }
}

function generateTemplate(
  data: z.infer<typeof Schema>,
  typeLabel: string,
  propLabel: string,
  price: number,
  area: number,
  location: string
) {
  const title = `${typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1)} ${propLabel} ${data.district ?? ""} - ${area}m²${data.bedrooms ? `, ${data.bedrooms} phòng ngủ` : ""}`;

  const description = `${propLabel.charAt(0).toUpperCase() + propLabel.slice(1)} cần ${typeLabel} tại ${location || data.district || "vị trí đẹp"}.

Thông tin chi tiết:
- Diện tích: ${area}m²
- Giá: ${formatPriceVN(price)}${data.type === "THUE" ? "/tháng" : ""}
${data.bedrooms ? `- Phòng ngủ: ${data.bedrooms} phòng\n` : ""}${data.bathrooms ? `- Toilet: ${data.bathrooms} phòng\n` : ""}${data.floors ? `- Số tầng: ${data.floors}\n` : ""}${data.direction ? `- Hướng nhà: ${data.direction}\n` : ""}
Vị trí thuận tiện, giao thông dễ dàng. Pháp lý rõ ràng.

Liên hệ ngay để được tư vấn và xem nhà trực tiếp.`;

  return { title: title.trim(), description: description.trim() };
}
