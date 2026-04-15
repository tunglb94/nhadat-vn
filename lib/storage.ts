// Cloudflare R2 upload (S3-compatible API)
// Cần cài: npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner

const R2_ACCOUNT_ID   = process.env.R2_ACCOUNT_ID!;
const R2_ACCESS_KEY   = process.env.R2_ACCESS_KEY_ID!;
const R2_SECRET_KEY   = process.env.R2_SECRET_ACCESS_KEY!;
const R2_BUCKET       = process.env.R2_BUCKET_NAME!;
const R2_PUBLIC_URL   = process.env.R2_PUBLIC_URL!;

export function getR2PublicUrl(key: string): string {
  return `${R2_PUBLIC_URL}/${key}`;
}

// Tạo key cho ảnh: listings/{listingId}/{timestamp}-{random}.webp
export function generateImageKey(listingId: string): string {
  const ts = Date.now();
  const rand = Math.random().toString(36).slice(2, 8);
  return `listings/${listingId}/${ts}-${rand}.webp`;
}

// Upload ảnh lên R2
// Sử dụng khi đã cài @aws-sdk/client-s3
export async function uploadImageToR2(
  _buffer: Buffer,
  _key: string,
  _contentType = "image/webp"
): Promise<string> {
  // Uncomment sau khi cài @aws-sdk/client-s3:
  //
  // const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
  // const client = new S3Client({
  //   region: "auto",
  //   endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  //   credentials: { accessKeyId: R2_ACCESS_KEY, secretAccessKey: R2_SECRET_KEY },
  // });
  // await client.send(new PutObjectCommand({
  //   Bucket: R2_BUCKET,
  //   Key: _key,
  //   Body: _buffer,
  //   ContentType: _contentType,
  //   CacheControl: "public, max-age=31536000, immutable",
  // }));
  // return getR2PublicUrl(_key);

  // Placeholder cho đến khi cài SDK
  console.warn("R2 upload chưa được cấu hình, trả về URL placeholder");
  return getR2PublicUrl(_key);
}

// Tạo presigned URL để upload thẳng từ browser (bỏ qua server)
export async function createPresignedUploadUrl(
  _key: string
): Promise<{ url: string; publicUrl: string }> {
  // Uncomment sau khi cài @aws-sdk/client-s3 @aws-sdk/s3-request-presigner:
  //
  // const { S3Client } = await import("@aws-sdk/client-s3");
  // const { PutObjectCommand } = await import("@aws-sdk/client-s3");
  // const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");
  // const client = new S3Client({
  //   region: "auto",
  //   endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  //   credentials: { accessKeyId: R2_ACCESS_KEY, secretAccessKey: R2_SECRET_KEY },
  // });
  // const url = await getSignedUrl(client, new PutObjectCommand({ Bucket: R2_BUCKET, Key: _key }), { expiresIn: 300 });
  // return { url, publicUrl: getR2PublicUrl(_key) };

  return { url: "/api/upload", publicUrl: getR2PublicUrl(_key) };
}

// Suppress unused variable warning
void R2_ACCOUNT_ID; void R2_ACCESS_KEY; void R2_SECRET_KEY; void R2_BUCKET; void R2_PUBLIC_URL;
