import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Clock, Tag, ChevronRight, Share2, MessageCircle } from "lucide-react";

export default async function PageDetail({ params }: { params: { slug: string } }) {
  // 1. Lấy bài viết chính
  const article = await db.article.findUnique({
    where: { slug: params.slug },
    include: { author: true }
  });

  // 2. Lấy thêm 5 bài viết mới nhất cho Sidebar (giống cột "Tin xem nhiều" của VnExpress)
  const sidebarArticles = await db.article.findMany({
    where: { NOT: { id: article?.id } },
    orderBy: { createdAt: 'desc' },
    take: 5
  });

  if (!article) return notFound();

  return (
    <main className="bg-white min-h-screen">
      {/* Breadcrumb - Cực kỳ quan trọng cho SEO */}
      <nav className="border-b bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-blue-600 transition">Trang chủ</Link>
          <ChevronRight size={14} />
          <Link href="/tin-tuc" className="hover:text-blue-600 transition">Tin tức</Link>
          <ChevronRight size={14} />
          <span className="text-gray-900 font-medium truncate">{article.category}</span>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* CỘT CHÍNH (Chiếm 8 cột) */}
        <article className="lg:col-span-8">
          <header className="mb-8">
            <h1 className="text-3xl md:text-5xl font-bold text-slate-900 leading-tight mb-6">
              {article.title}
            </h1>
            
            <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-gray-100">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-slate-600">
                  <Clock size={18} className="text-blue-500" />
                  <span className="text-sm font-medium">
                    {new Date(article.createdAt).toLocaleDateString('vi-VN', {
                      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="hidden md:flex items-center gap-2 text-slate-600 border-l pl-6">
                  <span className="text-sm">Chuyên mục: <strong>{article.category}</strong></span>
                </div>
              </div>

              {/* Share buttons giả lập */}
              <div className="flex items-center gap-3">
                <button className="p-2 hover:bg-gray-100 rounded-full transition"><Share2 size={18} /></button>
                <button className="p-2 hover:bg-gray-100 rounded-full transition"><MessageCircle size={18} /></button>
              </div>
            </div>
          </header>

          {/* Sapo bài viết (In đậm) */}
          <div className="text-xl font-semibold text-slate-700 leading-relaxed mb-8 italic border-l-4 border-blue-600 pl-6">
            {article.metaDesc}
          </div>

          {/* Ảnh bìa chính */}
          <figure className="mb-10 group">
            <div className="relative aspect-[16/9] overflow-hidden rounded-2xl shadow-xl">
              <Image 
                src={article.coverImage} 
                alt={article.title} 
                fill 
                className="object-cover group-hover:scale-105 transition duration-700"
                priority
              />
            </div>
            <figcaption className="text-center text-sm text-gray-500 mt-4 italic">
               Nguồn: {article.category} - NhaDat.vn thực hiện
            </figcaption>
          </figure>

          {/* NỘI DUNG CHÍNH - Render HTML từ AI */}
          <div 
            className="prose prose-slate prose-lg max-w-none 
                       prose-headings:text-slate-900 prose-headings:font-bold
                       prose-p:text-slate-800 prose-p:leading-8 prose-p:mb-6
                       prose-img:rounded-xl prose-img:shadow-lg
                       prose-strong:text-slate-900
                       prose-a:text-blue-600 hover:prose-a:text-blue-800 transition"
            dangerouslySetInnerHTML={{ __html: article.content }} 
          />

          {/* Tags Footer */}
          <div className="mt-12 pt-8 border-t border-gray-100">
            <div className="flex items-center gap-3 mb-4 text-slate-900 font-bold">
              <Tag size={20} />
              <span>Chủ đề liên quan</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {article.tags?.map((tag: string) => (
                <Link 
                  key={tag} 
                  href={`/tin-tuc/tag/${tag}`}
                  className="bg-slate-50 hover:bg-blue-50 hover:text-blue-700 px-4 py-2 rounded-lg text-sm text-slate-600 transition"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          </div>
        </article>

        {/* SIDEBAR (Chiếm 4 cột) - Phong cách VnExpress */}
        <aside className="lg:col-span-4 space-y-10">
          <div className="sticky top-24">
            <div className="border-t-2 border-blue-600 pt-4">
              <h3 className="text-xl font-bold text-slate-900 mb-6 uppercase tracking-wider">Tin mới nhất</h3>
              <div className="space-y-8">
                {sidebarArticles.map((item, index) => (
                  <Link key={item.id} href={`/tin-tuc/${item.slug}`} className="group flex gap-4">
                    <span className="text-3xl font-black text-slate-200 group-hover:text-blue-500 transition">0{index + 1}</span>
                    <div>
                      <h4 className="font-bold text-slate-800 group-hover:text-blue-600 transition leading-snug mb-1">
                        {item.title}
                      </h4>
                      <p className="text-xs text-gray-400 uppercase tracking-tighter">
                        {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Box Quảng cáo/Thông báo giả */}
            <div className="mt-10 bg-slate-900 rounded-2xl p-6 text-white text-center shadow-2xl overflow-hidden relative">
              <div className="relative z-10">
                <h4 className="font-bold mb-2">Bạn có nhà cần bán?</h4>
                <p className="text-sm text-slate-400 mb-4">Đăng tin ngay trên NhaDat.vn để tiếp cận 1 triệu khách hàng</p>
                <Link href="/dang-tin" className="inline-block bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-full font-bold transition">
                  Đăng tin ngay
                </Link>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full -mr-16 -mt-16 blur-3xl"></div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}