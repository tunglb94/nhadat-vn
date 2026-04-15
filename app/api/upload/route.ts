import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { writeFile } from "fs/promises";
import path from "path";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/jpg"];

const R2_CONFIGURED = !!(
  process.env.R2_ACCOUNT_ID &&
  process.env.R2_ACCESS_KEY_ID &&
  process.env.R2_SECRET_ACCESS_KEY
);

async function saveLocally(buffer: Buffer, filename: string): Promise<string> {
  const uploadDir = path.join(process.cwd(), "public", "uploads", "listings");
  await writeFile(path.join(uploadDir, filename), buffer);
  return `/uploads/listings/${filename}`;
}

async function uploadToR2(buffer: Buffer, key: string, contentType: string): Promise<string> {
  // Dynamic import to avoid compile-time type error (package optional)
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { S3Client, PutObjectCommand } = await Promise.resolve(require("@aws-sdk/client-s3"));
  const client = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
  await client.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    CacheControl: "public, max-age=31536000, immutable",
  }));
  return `${process.env.R2_PUBLIC_URL}/${key}`;
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const formData  = await req.formData();
    const file      = formData.get("file") as File | null;
    const listingId = formData.get("listingId") as string | null;
    const isCover   = formData.get("isCover") === "true";

    if (!file) return NextResponse.json({ error: "Không có file" }, { status: 400 });
    if (!listingId) return NextResponse.json({ error: "Thiếu listingId" }, { status: 400 });

    const safeType = file.type || "image/jpeg";
    if (!ALLOWED_TYPES.includes(safeType)) {
      return NextResponse.json({ error: "Chỉ hỗ trợ JPG, PNG, WEBP" }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File quá lớn (tối đa 10MB)" }, { status: 400 });
    }

    // Kiểm tra listing thuộc về user hiện tại
    const listing = await db.listing.findUnique({
      where: { id: listingId },
      select: { id: true, userId: true, _count: { select: { images: true } } },
    });
    if (!listing) return NextResponse.json({ error: "Tin đăng không tồn tại" }, { status: 404 });
    if (listing.userId !== session.user.id) {
      return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
    }
    if (listing._count.images >= 20) {
      return NextResponse.json({ error: "Tối đa 20 ảnh mỗi tin đăng" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = safeType.includes("png") ? "png" : safeType.includes("webp") ? "webp" : "jpg";
    const filename = `${listingId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;

    let url: string;
    if (R2_CONFIGURED) {
      url = await uploadToR2(buffer, `listings/${listingId}/${filename}`, safeType);
    } else {
      url = await saveLocally(buffer, filename);
    }

    // Lấy order tiếp theo
    const maxOrder = await db.listingImage.aggregate({
      where: { listingId },
      _max: { order: true },
    });
    const order = (maxOrder._max.order ?? -1) + 1;

    if (isCover) {
      await db.listingImage.updateMany({ where: { listingId }, data: { isCover: false } });
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
