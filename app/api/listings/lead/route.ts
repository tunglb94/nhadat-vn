import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const LeadSchema = z.object({
  listingId: z.string().min(1),
  name:      z.string().min(1).max(100),
  phone:     z.string().regex(/^[0-9]{9,11}$/, "Số điện thoại không hợp lệ"),
  message:   z.string().max(1000).optional(),
  source:    z.enum(["phone", "zalo", "chat"]).optional().default("phone"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = LeadSchema.parse({
      ...body,
      phone: body.phone?.replace(/\s/g, ""),
    });

    // Kiểm tra listing tồn tại
    const listing = await db.listing.findUnique({
      where: { id: data.listingId },
      select: { id: true, status: true },
    });

    if (!listing) {
      return NextResponse.json({ error: "Tin đăng không tồn tại" }, { status: 404 });
    }

    // Chống spam: 1 số điện thoại chỉ được gửi 3 lần/ngày cho 1 listing
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentLeads = await db.lead.count({
      where: {
        listingId: data.listingId,
        phone: data.phone,
        createdAt: { gte: oneDayAgo },
      },
    });

    if (recentLeads >= 3) {
      return NextResponse.json(
        { error: "Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau." },
        { status: 429 }
      );
    }

    // Tạo lead và tăng contactCount trong 1 transaction
    const [lead] = await db.$transaction([
      db.lead.create({ data }),
      db.listing.update({
        where: { id: data.listingId },
        data: { contactCount: { increment: 1 } },
      }),
    ]);

    return NextResponse.json({ id: lead.id }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Dữ liệu không hợp lệ", details: err.errors }, { status: 400 });
    }
    console.error("POST /api/listings/lead error:", err);
    return NextResponse.json({ error: "Lỗi máy chủ" }, { status: 500 });
  }
}
