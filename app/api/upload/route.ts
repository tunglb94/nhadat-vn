import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateImageKey, uploadImageToR2 } from "@/lib/storage";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file      = formData.get("file") as File | null;
    const listingId = formData.get("listingId") as string | null;
    const isCover   = formData.get("isCover") === "true";

    if (!file) {
      return NextResponse.json({ error: "Không có file" }, { status: 400 });
    }
    if (!listingId) {
      return NextResponse.json({ error: "Thiếu listingId" }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Định dạng file không hỗ trợ" }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File quá lớn (tối đa 10MB)" }, { status: 400 });
    }

    // Kiểm tra listing tồn tại
    const listing = await db.listing.findUnique({
      where: { id: listingId },
      select: { id: true, _count: { select: { images: true } } },
    });

    if (!listing) {
      return NextResponse.json({ error: "Tin đăng không tồn tại" }, { status: 404 });
    }
    if (listing._count.images >= 20) {
      return NextResponse.json({ error: "Tối đa 20 ảnh mỗi tin đăng" }, { status: 400 });
    }

    // Upload lên R2
    const buffer = Buffer.from(await file.arrayBuffer());
    const key    = generateImageKey(listingId);
    const url    = await uploadImageToR2(buffer, key, "image/webp");

    // Lấy order tiếp theo
    const maxOrder = await db.listingImage.aggregate({
      where: { listingId },
      _max: { order: true },
    });
    const order = (maxOrder._max.order ?? -1) + 1;

    // Nếu đặt làm cover, bỏ cover cũ
    if (isCover) {
      await db.listingImage.updateMany({
        where: { listingId },
        data: { isCover: false },
      });
    }

    const image = await db.listingImage.create({
      data: { listingId, url, order, isCover: isCover || order === 0 },
    });

    return NextResponse.json({ id: image.id, url: image.url }, { status: 201 });
  } catch (err) {
    console.error("POST /api/upload error:", err);
    return NextResponse.json({ error: "Lỗi máy chủ" }, { status: 500 });
  }
}
