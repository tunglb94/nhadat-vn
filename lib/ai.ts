import type { SearchParams } from "@/types/listing";

// Parse câu tìm kiếm tự nhiên → SearchParams có cấu trúc
// Ví dụ: "nhà quận 7 dưới 5 tỷ 3 phòng ngủ" → { district: "Quận 7", priceMax: 5_000_000_000, bedrooms: 3 }

export async function parseSearchQuery(query: string): Promise<Partial<SearchParams>> {
  const apiKey = process.env.OPENAI_API_KEY;

  // Nếu chưa có API key, dùng fallback parser đơn giản
  if (!apiKey) {
    return simpleParser(query);
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0,
        messages: [
          {
            role: "system",
            content: `Bạn là parser truy vấn bất động sản Việt Nam. 
Trích xuất thông tin từ câu tìm kiếm và trả về JSON với các field sau (chỉ điền field có trong câu, bỏ qua nếu không có):
- type: "BAN" hoặc "THUE"
- propertyType: "NHA_PHO"|"CAN_HO"|"BIET_THU"|"DAT_NEN"|"MAT_BANG"|"PHONG_TRO"
- province: tên tỉnh/thành phố (ví dụ: "Hồ Chí Minh", "Hà Nội")
- district: tên quận/huyện (ví dụ: "Quận 7", "Quận 1", "Bình Thạnh")
- priceMin: số nguyên đơn vị VND
- priceMax: số nguyên đơn vị VND
- areaMin: số nguyên đơn vị m²
- areaMax: số nguyên đơn vị m²
- bedrooms: số nguyên

Quy tắc chuyển đổi giá:
- "X tỷ" → X * 1_000_000_000
- "X triệu" → X * 1_000_000
- "dưới X tỷ" → priceMax = X * 1_000_000_000
- "trên X tỷ" → priceMin = X * 1_000_000_000
- "X-Y tỷ" → priceMin = X tỷ, priceMax = Y tỷ

Chỉ trả về JSON thuần, không có markdown.`,
          },
          { role: "user", content: query },
        ],
      }),
    });

    if (!response.ok) throw new Error("OpenAI API error");

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(content.trim());
    return { ...parsed, q: query };
  } catch {
    // Nếu AI lỗi, dùng fallback
    return simpleParser(query);
  }
}

// Parser đơn giản không cần AI - dùng regex
function simpleParser(query: string): Partial<SearchParams> {
  const result: Partial<SearchParams> = { q: query };
  const q = query.toLowerCase();

  // Loại giao dịch
  if (q.includes("cho thuê") || q.includes("thuê")) result.type = "THUE";
  else if (q.includes("bán") || q.includes("mua")) result.type = "BAN";

  // Loại BĐS
  if (q.includes("căn hộ") || q.includes("chung cư")) result.propertyType = "CAN_HO";
  else if (q.includes("biệt thự")) result.propertyType = "BIET_THU";
  else if (q.includes("đất nền") || q.includes("đất")) result.propertyType = "DAT_NEN";
  else if (q.includes("mặt bằng") || q.includes("văn phòng")) result.propertyType = "MAT_BANG";
  else if (q.includes("phòng trọ") || q.includes("phòng trọ")) result.propertyType = "PHONG_TRO";
  else if (q.includes("nhà phố") || q.includes("nhà")) result.propertyType = "NHA_PHO";

  // Quận/huyện phổ biến TP.HCM
  const districtMatch = q.match(/quận\s+(\d+|bình thạnh|tân bình|phú nhuận|gò vấp|thủ đức|bình dương)/i);
  if (districtMatch) {
    result.district = `Quận ${districtMatch[1].charAt(0).toUpperCase() + districtMatch[1].slice(1)}`;
  }

  // Giá: "dưới X tỷ"
  const priceUnderMatch = q.match(/dưới\s+([\d.]+)\s*tỷ/);
  if (priceUnderMatch) result.priceMax = parseFloat(priceUnderMatch[1]) * 1_000_000_000;

  // Giá: "trên X tỷ"
  const priceOverMatch = q.match(/trên\s+([\d.]+)\s*tỷ/);
  if (priceOverMatch) result.priceMin = parseFloat(priceOverMatch[1]) * 1_000_000_000;

  // Giá: "X-Y tỷ"
  const priceRangeMatch = q.match(/([\d.]+)\s*[-–]\s*([\d.]+)\s*tỷ/);
  if (priceRangeMatch) {
    result.priceMin = parseFloat(priceRangeMatch[1]) * 1_000_000_000;
    result.priceMax = parseFloat(priceRangeMatch[2]) * 1_000_000_000;
  }

  // Số phòng ngủ
  const bedroomMatch = q.match(/(\d+)\s*phòng ngủ/);
  if (bedroomMatch) result.bedrooms = parseInt(bedroomMatch[1]);

  return result;
}
