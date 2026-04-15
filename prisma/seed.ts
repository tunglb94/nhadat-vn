import { PrismaClient, ListingType, PropertyType, ListingStatus, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Bắt đầu seed dữ liệu...");

  const admin = await prisma.user.upsert({
    where: { email: "admin@nhadat.vn" },
    update: {},
    create: { name: "Admin", email: "admin@nhadat.vn", role: UserRole.ADMIN },
  });

  const agent1 = await prisma.user.upsert({
    where: { email: "nguyen.van.a@gmail.com" },
    update: {},
    create: { name: "Nguyễn Văn A", email: "nguyen.van.a@gmail.com", phone: "0901234567", role: UserRole.AGENT },
  });

  const agent2 = await prisma.user.upsert({
    where: { email: "tran.thi.b@gmail.com" },
    update: {},
    create: { name: "Trần Thị B", email: "tran.thi.b@gmail.com", phone: "0912345678", role: UserRole.AGENT },
  });

  const user1 = await prisma.user.upsert({
    where: { email: "le.van.c@gmail.com" },
    update: {},
    create: { name: "Lê Văn C", email: "le.van.c@gmail.com", phone: "0923456789", role: UserRole.USER },
  });

  console.log("✅ Users:", [admin, agent1, agent2, user1].map((u) => u.name));

  const listingsData = [
    {
      userId: agent1.id,
      title: "Bán nhà mặt tiền Nguyễn Thị Thập, Quận 7 - 5x20m",
      slug: "ban-nha-mat-tien-nguyen-thi-thap-quan-7-5x20m",
      description: "Nhà mặt tiền đường Nguyễn Thị Thập, vị trí kinh doanh sầm uất. Diện tích 5x20m, 1 trệt 3 lầu, sân thượng. Kết cấu bền vững, nội thất cơ bản. Phù hợp kinh doanh hoặc ở. Hẻm xe hơi thông, an ninh tốt.",
      type: ListingType.BAN, propertyType: PropertyType.NHA_PHO, status: ListingStatus.ACTIVE,
      price: 12_500_000_000, area: 100, pricePerM2: 125_000_000,
      bedrooms: 4, bathrooms: 4, floors: 4, direction: "Đông Nam",
      province: "Hồ Chí Minh", district: "Quận 7", ward: "Tân Phú", street: "Nguyễn Thị Thập",
      address: "123 Nguyễn Thị Thập, Phường Tân Phú, Quận 7, TP.HCM",
      lat: 10.7285, lng: 106.7208, verified: true, gpsVerified: true,
      views: 342, contactCount: 18, expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      img1: "https://picsum.photos/seed/nha-pho-1/800/600",
      img2: "https://picsum.photos/seed/nha-pho-2/800/600",
      img3: "https://picsum.photos/seed/nha-pho-3/800/600",
    },
    {
      userId: agent1.id,
      title: "Căn hộ 2PN Vinhomes Grand Park, Quận 9 - View hồ",
      slug: "can-ho-2pn-vinhomes-grand-park-quan-9-view-ho",
      description: "Căn hộ 2 phòng ngủ tại tòa S1.07, tầng 18, view hồ tuyệt đẹp. Diện tích 68m², bàn giao nội thất cơ bản từ chủ đầu tư. Tiện ích đẳng cấp: hồ bơi, gym, công viên 36ha. Pháp lý sổ hồng đầy đủ.",
      type: ListingType.BAN, propertyType: PropertyType.CAN_HO, status: ListingStatus.ACTIVE,
      price: 3_200_000_000, area: 68, pricePerM2: 47_058_824,
      bedrooms: 2, bathrooms: 2, floors: 1, direction: "Tây Nam",
      province: "Hồ Chí Minh", district: "Quận 9", ward: "Long Bình", street: "Nguyễn Xiển",
      address: "Vinhomes Grand Park, Nguyễn Xiển, Long Bình, Quận 9, TP.HCM",
      lat: 10.8433, lng: 106.828, verified: true, gpsVerified: true,
      views: 891, contactCount: 45, expiresAt: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      img1: "https://picsum.photos/seed/can-ho-1/800/600",
      img2: "https://picsum.photos/seed/can-ho-2/800/600",
      img3: "https://picsum.photos/seed/can-ho-3/800/600",
    },
    {
      userId: agent2.id,
      title: "Cho thuê văn phòng 120m² Quận 1, tòa nhà mới 100%",
      slug: "cho-thue-van-phong-120m2-quan-1-toa-nha-moi",
      description: "Văn phòng cho thuê tại tòa nhà hạng A, Quận 1. Diện tích 120m², không gian thông thoáng, thiết kế hiện đại. Có thể bố trí 20-25 nhân viên. Giá đã bao gồm phí quản lý, điện nước, dịch vụ vệ sinh.",
      type: ListingType.THUE, propertyType: PropertyType.MAT_BANG, status: ListingStatus.ACTIVE,
      price: 45_000_000, area: 120, pricePerM2: 375_000,
      bedrooms: null, bathrooms: 2, floors: 1, direction: null,
      province: "Hồ Chí Minh", district: "Quận 1", ward: "Bến Nghé", street: "Lê Lợi",
      address: "68 Lê Lợi, Phường Bến Nghé, Quận 1, TP.HCM",
      lat: 10.7731, lng: 106.7013, verified: true, gpsVerified: false,
      views: 215, contactCount: 12, expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      img1: "https://picsum.photos/seed/van-phong-1/800/600",
      img2: "https://picsum.photos/seed/van-phong-2/800/600",
      img3: "https://picsum.photos/seed/van-phong-3/800/600",
    },
    {
      userId: agent2.id,
      title: "Đất nền Bình Dương 5x20 sổ hồng riêng, hẻm xe hơi",
      slug: "dat-nen-binh-duong-5x20-so-hong-rieng-hem-xe-hoi",
      description: "Lô đất nền 5x20m, mặt tiền hẻm xe hơi, đường nhựa 6m. Khu dân cư hiện hữu, điện nước đầy đủ. Cách QL13 500m, gần chợ, trường học. Sổ hồng riêng, sang tên nhanh. Phù hợp xây nhà ở hoặc đầu tư.",
      type: ListingType.BAN, propertyType: PropertyType.DAT_NEN, status: ListingStatus.ACTIVE,
      price: 1_850_000_000, area: 100, pricePerM2: 18_500_000,
      bedrooms: null, bathrooms: null, floors: null, direction: "Đông",
      province: "Bình Dương", district: "Thuận An", ward: "Lái Thiêu", street: "Quốc lộ 13",
      address: "Khu dân cư Lái Thiêu, Thuận An, Bình Dương",
      lat: 10.9167, lng: 106.7052, verified: false, gpsVerified: false, priceFlag: false,
      views: 127, contactCount: 8, expiresAt: new Date(Date.now() + 55 * 24 * 60 * 60 * 1000),
      img1: "https://picsum.photos/seed/dat-nen-1/800/600",
      img2: "https://picsum.photos/seed/dat-nen-2/800/600",
      img3: "https://picsum.photos/seed/dat-nen-3/800/600",
    },
    {
      userId: agent1.id,
      title: "Phòng trọ Bình Thạnh full nội thất, gần ĐH Hutech",
      slug: "phong-tro-binh-thanh-full-noi-that-gan-dh-hutech",
      description: "Phòng trọ cao cấp, full nội thất: máy lạnh, tủ lạnh, máy giặt, wifi, bếp từ. Tự do giờ giấc. An ninh 24/7. Chỉ cách ĐH Hutech 5 phút đi bộ. Thích hợp sinh viên, nhân viên văn phòng.",
      type: ListingType.THUE, propertyType: PropertyType.PHONG_TRO, status: ListingStatus.ACTIVE,
      price: 4_500_000, area: 25, pricePerM2: 180_000,
      bedrooms: 1, bathrooms: 1, floors: 1, direction: null,
      province: "Hồ Chí Minh", district: "Bình Thạnh", ward: "Phường 26", street: "Ung Văn Khiêm",
      address: "15/5 Ung Văn Khiêm, Phường 26, Bình Thạnh, TP.HCM",
      lat: 10.812, lng: 106.712, verified: true, gpsVerified: true,
      views: 456, contactCount: 32, expiresAt: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
      img1: "https://picsum.photos/seed/phong-tro-1/800/600",
      img2: "https://picsum.photos/seed/phong-tro-2/800/600",
      img3: "https://picsum.photos/seed/phong-tro-3/800/600",
    },
    {
      userId: agent2.id,
      title: "Biệt thự vườn Thủ Đức 500m² hồ bơi sân vườn",
      slug: "biet-thu-vuon-thu-duc-500m2-ho-boi-san-vuon",
      description: "Biệt thự vườn khu compound cao cấp, diện tích đất 500m², xây dựng 280m². 5 phòng ngủ, 5 toilet, 2 phòng khách. Hồ bơi riêng 12x4m, sân vườn rộng, garage 2 xe. An ninh 24/7, camera toàn khu.",
      type: ListingType.BAN, propertyType: PropertyType.BIET_THU, status: ListingStatus.ACTIVE,
      price: 28_000_000_000, area: 500, pricePerM2: 56_000_000,
      bedrooms: 5, bathrooms: 5, floors: 2, direction: "Nam",
      province: "Hồ Chí Minh", district: "Thủ Đức", ward: "Linh Đông", street: "Kha Vạn Cân",
      address: "Khu compound Linh Đông, Kha Vạn Cân, Thủ Đức, TP.HCM",
      lat: 10.85, lng: 106.745, verified: true, gpsVerified: true,
      views: 678, contactCount: 23, expiresAt: new Date(Date.now() + 58 * 24 * 60 * 60 * 1000),
      img1: "https://picsum.photos/seed/biet-thu-1/800/600",
      img2: "https://picsum.photos/seed/biet-thu-2/800/600",
      img3: "https://picsum.photos/seed/biet-thu-3/800/600",
    },
  ];

  for (const data of listingsData) {
    const { img1, img2, img3, ...listingData } = data;
    const listing = await prisma.listing.upsert({
      where: { slug: data.slug },
      update: {},
      create: {
        ...listingData,
        images: {
          create: [
            { url: img1, order: 0, isCover: true,  width: 800, height: 600 },
            { url: img2, order: 1, isCover: false, width: 800, height: 600 },
            { url: img3, order: 2, isCover: false, width: 800, height: 600 },
          ],
        },
      },
    });
    console.log(`  ✅ Listing: ${listing.title.substring(0, 50)}...`);
  }

  const firstListing = await prisma.listing.findFirst({
    where: { slug: "ban-nha-mat-tien-nguyen-thi-thap-quan-7-5x20m" },
  });

  if (firstListing) {
    await prisma.lead.createMany({
      data: [
        { listingId: firstListing.id, userId: user1.id, name: "Lê Văn C", phone: "0923456789", message: "Cho tôi xem nhà cuối tuần này được không?", source: "phone", isRead: true },
        { listingId: firstListing.id, name: "Phạm Thị D", phone: "0934567890", message: "Nhà còn không ạ? Giá có thương lượng không?", source: "zalo", isRead: false },
      ],
      skipDuplicates: true,
    });
    console.log("✅ Leads mẫu đã tạo");
  }

  const canHo = await prisma.listing.findFirst({
    where: { slug: "can-ho-2pn-vinhomes-grand-park-quan-9-view-ho" },
  });
  if (canHo) {
    await prisma.savedListing.upsert({
      where: { userId_listingId: { userId: user1.id, listingId: canHo.id } },
      update: {},
      create: { userId: user1.id, listingId: canHo.id },
    });
    console.log("✅ SavedListings mẫu đã tạo");
  }

  console.log("\n🎉 Seed hoàn thành!");
  console.log(`   Users: ${await prisma.user.count()}`);
  console.log(`   Listings: ${await prisma.listing.count()}`);
  console.log(`   Images: ${await prisma.listingImage.count()}`);
  console.log(`   Leads: ${await prisma.lead.count()}`);
}

main()
  .catch((e) => { console.error("❌ Seed lỗi:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
