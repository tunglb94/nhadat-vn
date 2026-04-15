import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { format, subDays } from "date-fns";
import { vi } from "date-fns/locale";

export const metadata = {
  title: "Tin tức thị trường Bất động sản mới nhất | NhaDat.vn",
  description: "Cập nhật nhanh nhất tin tức thị trường, luật đất đai, phong thủy và kinh nghiệm mua bán nhà đất.",
};

export default async function NewsIndexPage() {
  // Lấy bài viết thật từ Database
  const realArticles = await db.article.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    include: { author: { select: { name: true } } },
    take: 20,
  });

  // Dữ liệu mẫu phong cách VnExpress (Thực tế và nóng hổi)
  const articles = realArticles.length > 0 ? realArticles : [
    {
      id: "1", 
      slug: "bang-gia-dat-moi-dat-nen-vung-ven-thiet-lap-mat-bang-gia", 
      title: "Bảng giá đất mới: Đất nền vùng ven TP HCM thiết lập mặt bằng giá mới", 
      metaDesc: "Việc áp dụng bảng giá đất mới tiệm cận thị trường khiến chi phí chuyển mục đích sử dụng đất tăng mạnh. Nhiều chủ đất tại Hóc Môn, Củ Chi đồng loạt điều chỉnh giá bán tăng 15-20% so với đầu năm.", 
      coverImage: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1200&auto=format&fit=crop", 
      category: "Thị trường", 
      createdAt: new Date()
    },
    {
      id: "2", 
      slug: "gia-chung-cu-ha-noi-ha-nhiet", 
      title: "Giá chung cư Hà Nội chững lại sau chuỗi ngày tăng 'nóng'", 
      metaDesc: "Lượng tìm kiếm và giao dịch căn hộ thứ cấp tại các quận vùng ven Hà Nội có dấu hiệu giảm nhiệt. Nguồn cung mới dự kiến bung hàng vào cuối năm đang giải tỏa tâm lý 'sợ lỡ nhịp' của người mua.", 
      coverImage: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=800&auto=format&fit=crop", 
      category: "Thị trường", 
      createdAt: subDays(new Date(), 1)
    },
    {
      id: "3", 
      slug: "tien-do-san-bay-long-thanh-2026", 
      title: "Hình hài sân bay Long Thành trước mốc cất cánh 2026", 
      metaDesc: "Nhà ga hành khách mang hình hoa sen đang dần lộ diện, đường cất hạ cánh đã hoàn thành phần nền móng. Hàng loạt dự án đô thị quanh sân bay bắt đầu tái khởi động.", 
      coverImage: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=800&auto=format&fit=crop", 
      category: "Quy hoạch", 
      createdAt: subDays(new Date(), 1)
    },
    {
      id: "4", 
      slug: "dong-tien-bat-day-bat-dong-san", 
      title: "'Bắt đáy' bất động sản: Dòng tiền của nhà đầu tư sành sỏi đang chảy về đâu?", 
      metaDesc: "Trong khi nhóm nhà đầu tư mới vẫn đang nghe ngóng, các 'cá mập' đã bắt đầu thâu tóm các bất động sản dòng tiền tại trung tâm và đất nền pháp lý chuẩn ven các tuyến Vành đai.", 
      coverImage: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=800&auto=format&fit=crop", 
      category: "Kinh nghiệm", 
      createdAt: subDays(new Date(), 2)
    },
    {
      id: "5", 
      slug: "goi-tin-dung-nha-o-xa-hoi", 
      title: "Gói 120.000 tỷ đồng: Mở rộng đối tượng người mua nhà ở xã hội", 
      metaDesc: "Bộ Xây dựng đề xuất nới lỏng điều kiện thu nhập và rào cản cư trú, giúp hàng triệu công nhân và người lao động có cơ hội tiếp cận nguồn vốn vay ưu đãi để sở hữu nhà.", 
      coverImage: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=800&auto=format&fit=crop", 
      category: "Chính sách", 
      createdAt: subDays(new Date(), 2)
    },
    {
      id: "6", 
      slug: "phong-thuy-huong-nha-2026", 
      title: "Chọn hướng nhà hợp tuổi Bính Ngọ 2026 để chiêu tài đón lộc", 
      metaDesc: "Năm 2026, những ngôi nhà hướng Nam và Đông Nam được giới chuyên gia phong thủy đánh giá cao về khả năng thu hút vượng khí, đặc biệt tốt cho người làm kinh doanh.", 
      coverImage: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=800&auto=format&fit=crop", 
      category: "Phong thủy", 
      createdAt: subDays(new Date(), 3)
    }
  ];

  const featuredArticle = articles[0];
  const sideArticles = articles.slice(1, 4);
  const feedArticles = articles.slice(4);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24 bg-white min-h-screen">
      
      {/* Category Navigation */}
      <nav className="flex items-center gap-6 border-b-2 border-gray-900 pb-3 mb-6 overflow-x-auto no-scrollbar">
        <h1 className="text-2xl font-black text-brand-dark uppercase tracking-tight shrink-0 mr-4">Tin tức</h1>
        {["Thị trường", "Kinh nghiệm", "Quy hoạch", "Phong thủy", "Chính sách", "Kiến trúc"].map((cat) => (
          <Link key={cat} href={`/tin-tuc/danh-muc/${cat}`} className="text-sm font-semibold text-gray-600 hover:text-brand-600 whitespace-nowrap transition-colors">
            {cat}
          </Link>
        ))}
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* CỘT TRÁI (70%) */}
        <div className="lg:col-span-8">
          
          {/* Top Story */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 border-b border-gray-200 pb-6 mb-6">
            <Link href={`/tin-tuc/${featuredArticle.slug}`} className="md:col-span-3 group block">
              <div className="relative w-full aspect-[4/3] bg-gray-100 overflow-hidden rounded-lg mb-3">
                <Image 
                  src={featuredArticle.coverImage} 
                  alt={featuredArticle.title} 
                  fill 
                  priority
                  className="object-cover group-hover:scale-105 transition-transform duration-500" 
                />
              </div>
            </Link>
            <div className="md:col-span-2 flex flex-col justify-center">
              <Link href={`/tin-tuc/${featuredArticle.slug}`} className="group">
                <h2 className="text-2xl md:text-[28px] font-bold text-gray-900 leading-tight mb-3 group-hover:text-brand-600 transition-colors">
                  {featuredArticle.title}
                </h2>
                <p className="text-gray-600 text-base leading-relaxed line-clamp-4">
                  {featuredArticle.metaDesc}
                </p>
              </Link>
              <div className="mt-4 flex items-center gap-3 text-xs text-gray-500 font-medium">
                <span className="text-brand-600 font-bold">{featuredArticle.category}</span>
                <span>•</span>
                <span>{format(new Date(featuredArticle.createdAt), "dd/MM/yyyy")}</span>
              </div>
            </div>
          </div>

          {/* Sub Stories */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 border-b border-gray-200 pb-8 mb-8">
            {sideArticles.map((article) => (
              <Link key={article.id} href={`/tin-tuc/${article.slug}`} className="group block">
                <h3 className="text-[17px] font-bold text-gray-900 leading-snug mb-2 group-hover:text-brand-600 transition-colors">
                  {article.title}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-3 mb-3">
                  {article.metaDesc}
                </p>
              </Link>
            ))}
          </div>

          {/* Newest Stories Feed */}
          <div className="space-y-6">
            {feedArticles.map((article) => (
              <article key={article.id} className="flex gap-4 sm:gap-6 group border-b border-gray-100 pb-6 last:border-0">
                <div className="w-1/3 sm:w-1/4 shrink-0 relative aspect-[4/3] rounded-md overflow-hidden bg-gray-100">
                  <Image 
                    src={article.coverImage} 
                    alt={article.title} 
                    fill 
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="flex-1 py-1 flex flex-col">
                  <Link href={`/tin-tuc/${article.slug}`}>
                    <h3 className="text-lg sm:text-[20px] font-bold text-gray-900 leading-snug mb-2 group-hover:text-brand-600 transition-colors">
                      {article.title}
                    </h3>
                  </Link>
                  <p className="hidden sm:block text-sm text-gray-600 line-clamp-2 mb-2">
                    {article.metaDesc}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500 font-medium mt-auto">
                    <span className="text-brand-600">{article.category}</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="hidden sm:inline">{format(new Date(article.createdAt), "dd/MM/yyyy")}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>

        </div>

        {/* CỘT PHẢI (30%) */}
        <aside className="lg:col-span-4 mt-8 lg:mt-0 relative">
          <div className="sticky top-24">
            
            {/* Title Block */}
            <div className="flex items-center gap-2 border-b border-gray-200 pb-2 mb-5">
              <div className="w-2 h-4 bg-brand-600 rounded-full" />
              <h3 className="text-lg font-bold text-brand-dark uppercase tracking-wide">Đọc nhiều nhất</h3>
            </div>

            {/* Top Viewed List */}
            <ul className="space-y-4">
              {articles.map((article, index) => (
                <li key={article.id} className="flex gap-4 group items-start border-b border-gray-100 pb-4 last:border-0">
                  <span className="text-3xl font-black text-gray-200 leading-none group-hover:text-brand-200 transition-colors mt-1">
                    0{index + 1}
                  </span>
                  <Link href={`/tin-tuc/${article.slug}`} className="flex-1">
                    <h4 className="text-[15px] font-bold text-gray-800 leading-snug group-hover:text-brand-600 transition-colors line-clamp-3">
                      {article.title}
                    </h4>
                  </Link>
                </li>
              ))}
            </ul>

            {/* Banner Quảng cáo/CTA */}
            <div className="mt-8 rounded-xl bg-gray-50 border border-gray-200 p-6 text-center">
              <h4 className="text-base font-bold text-brand-dark mb-2">Đăng tin nhà đất miễn phí</h4>
              <p className="text-sm text-gray-500 mb-4">Tiếp cận hàng triệu khách hàng tiềm năng trên toàn quốc mỗi ngày.</p>
              <Link href="/dang-tin" className="inline-block px-6 py-2.5 bg-brand-600 text-white text-sm font-bold rounded-full shadow-md hover:bg-brand-700 transition-colors">
                Đăng tin ngay
              </Link>
            </div>

          </div>
        </aside>

      </div>
    </main>
  );
}