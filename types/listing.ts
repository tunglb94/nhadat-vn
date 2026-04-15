import type { Listing, ListingImage, User } from "@prisma/client";

export type ListingWithImages = Listing & {
  images: ListingImage[];
};

export type ListingWithUser = Listing & {
  images: ListingImage[];
  user: Pick<User, "id" | "name" | "phone" | "avatar">;
};

export type ListingCardData = Pick<
  Listing,
  | "id"
  | "slug"
  | "title"
  | "type"
  | "propertyType"
  | "price"
  | "area"
  | "pricePerM2"
  | "bedrooms"
  | "bathrooms"
  | "province"
  | "district"
  | "address"
  | "verified"
  | "views"
  | "createdAt"
> & {
  coverImage: string | null;
};

// Params cho trang tìm kiếm
export interface SearchParams {
  q?: string;            // câu tìm kiếm tự nhiên
  type?: "BAN" | "THUE";
  propertyType?: string;
  province?: string;
  district?: string;
  priceMin?: number;
  priceMax?: number;
  areaMin?: number;
  areaMax?: number;
  bedrooms?: number;
  page?: number;
  sort?: "newest" | "price_asc" | "price_desc" | "area_asc";
}

export interface SearchResult {
  listings: ListingCardData[];
  total: number;
  page: number;
  totalPages: number;
}
