# NhaDat.vn

Nền tảng bất động sản thế hệ mới — Tìm là thấy, Giá là thật.

## Tech Stack

- **Framework**: Next.js 15 (App Router, SSR)
- **Database**: PostgreSQL + Prisma ORM
- **Styling**: Tailwind CSS
- **Auth**: NextAuth v5
- **Storage**: Cloudflare R2 (ảnh)
- **AI Search**: OpenAI GPT-4o-mini
- **Deploy**: Vercel

---

## Cài đặt

### 1. Yêu cầu

- Node.js >= 18
- PostgreSQL đang chạy

### 2. Clone & cài dependencies

```bash
git clone <repo-url>
cd nhadat-vn
npm install
```

### 3. Cấu hình môi trường

```bash
cp .env.local.example .env.local
```

Mở `.env.local` và điền:

```env
# Bắt buộc
DATABASE_URL="postgresql://user:password@localhost:5432/nhadat_vn"
AUTH_SECRET="chạy: openssl rand -base64 32"

# Tuỳ chọn (AI search sẽ dùng fallback nếu để trống)
OPENAI_API_KEY="sk-..."

# Tuỳ chọn (upload ảnh sẽ dùng placeholder nếu để trống)
R2_ACCOUNT_ID=""
R2_ACCESS_KEY_ID=""
R2_SECRET_ACCESS_KEY=""
R2_BUCKET_NAME="nhadat-images"
R2_PUBLIC_URL="https://images.nhadat.vn"
```

### 4. Khởi tạo database

```bash
# Tạo database PostgreSQL
createdb nhadat_vn

# Chạy migration
npm run db:migrate

# Generate Prisma client
npm run db:generate

# Seed dữ liệu mẫu (6 tin đăng thực tế)
npm run db:seed
```

### 5. Chạy development

```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000)

---

## Cấu trúc project

```
nhadat-vn/
├── app/
│   ├── (public)/           # Routes không cần đăng nhập
│   │   ├── page.tsx         # Trang chủ
│   │   ├── tim-kiem/        # Tìm kiếm
│   │   ├── bat-dong-san/    # Chi tiết tin
│   │   └── dinh-gia/        # Định giá
│   ├── (auth)/              # Routes cần đăng nhập
│   │   ├── dang-tin/        # Đăng tin
│   │   └── quan-ly/         # Quản lý tin
│   └── api/                 # API routes
│       ├── listings/        # CRUD + lead + AI description
│       ├── search/          # Search API
│       ├── upload/          # Upload ảnh
│       ├── verify/          # Verify tin đăng
│       └── estimate/        # Định giá
├── components/
│   ├── ui/                  # Button, Input, Select, Badge
│   ├── listing/             # Card, Grid, Form, ContactForm...
│   ├── search/              # SearchBar, Filters, Pagination
│   └── layout/              # Navbar, Footer
├── lib/
│   ├── db.ts                # Prisma singleton
│   ├── search.ts            # Search logic
│   ├── ai.ts                # AI query parser
│   ├── storage.ts           # Cloudflare R2
│   └── utils.ts             # Helpers
├── prisma/
│   ├── schema.prisma        # DB schema
│   └── seed.ts              # Dữ liệu mẫu
└── types/                   # TypeScript types
```

---

## Các tính năng MVP

| Tính năng | Trạng thái |
|---|---|
| Trang chủ với AI Search | ✅ |
| Tìm kiếm + bộ lọc | ✅ |
| Chi tiết tin đăng | ✅ |
| Đăng tin 3 bước + AI viết mô tả | ✅ |
| Quản lý tin đăng | ✅ |
| Định giá bất động sản | ✅ |
| Verify tin đăng (GPS + giá) | ✅ |
| Form liên hệ / gửi lead | ✅ |
| Chống spam lead | ✅ |

## Tính năng Phase 2 (chưa làm)

- [ ] Đăng nhập Google / Zalo (NextAuth)
- [ ] Heatmap giá trên bản đồ (Mapbox)
- [ ] Upload ảnh thực sự (cần config R2)
- [ ] Mini CRM — xem danh sách lead
- [ ] Push notification khi có lead mới
- [ ] Elasticsearch cho tìm kiếm nhanh hơn

---

## Deploy lên Vercel

```bash
# Cài Vercel CLI
npm i -g vercel

# Deploy
vercel

# Thêm environment variables trong Vercel Dashboard
# DATABASE_URL cần dùng connection pooling (Supabase hoặc Neon.tech)
```

### Database production

Khuyên dùng [Neon.tech](https://neon.tech) — PostgreSQL serverless miễn phí, tương thích Vercel.

```env
DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/nhadat_vn?sslmode=require"
```

---

## Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run db:migrate   # Chạy migration mới
npm run db:generate  # Regenerate Prisma client
npm run db:seed      # Seed dữ liệu mẫu
npm run db:studio    # Prisma Studio (xem/sửa DB trực quan)
```
