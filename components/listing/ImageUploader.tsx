"use client";

import { useRef, useState, useCallback } from "react";
import Image from "next/image";

export interface LocalImage {
  file: File;
  previewUrl: string; // URL.createObjectURL
  isCover: boolean;
}

interface Props {
  images: LocalImage[];
  onChange: (images: LocalImage[]) => void;
  maxImages?: number;
}

const MAX_SIZE_MB = 10;

export function ImageUploader({ images, onChange, maxImages = 10 }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addFiles(files: FileList | File[]) {
    setError(null);
    const arr = Array.from(files);
    const allowed = arr.filter((f) => {
      if (!f.type.startsWith("image/")) { setError("Chỉ hỗ trợ file hình ảnh"); return false; }
      if (f.size > MAX_SIZE_MB * 1024 * 1024) { setError(`Ảnh "${f.name}" vượt ${MAX_SIZE_MB}MB`); return false; }
      return true;
    });

    const remaining = maxImages - images.length;
    if (remaining <= 0) { setError(`Tối đa ${maxImages} ảnh`); return; }
    const toAdd = allowed.slice(0, remaining);

    const newImages: LocalImage[] = toAdd.map((file, i) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      isCover: images.length === 0 && i === 0, // ảnh đầu tiên = cover
    }));

    onChange([...images, ...newImages]);
  }

  function removeImage(idx: number) {
    URL.revokeObjectURL(images[idx].previewUrl);
    const next = images.filter((_, i) => i !== idx);
    // nếu xóa cover → ảnh đầu tiên còn lại thành cover
    if (images[idx].isCover && next.length > 0) {
      next[0] = { ...next[0], isCover: true };
    }
    onChange(next);
  }

  function setCover(idx: number) {
    onChange(images.map((img, i) => ({ ...img, isCover: i === idx })));
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  }, [images]); // eslint-disable-line

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);

  const coverImage = images.find((i) => i.isCover) ?? images[0];

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={`relative flex flex-col items-center justify-center gap-3 w-full rounded-3xl border-2 border-dashed cursor-pointer transition-all select-none ${
          dragging
            ? "border-brand-500 bg-brand-50 scale-[1.01]"
            : images.length === 0
            ? "border-gray-200 bg-gray-50 hover:border-brand-300 hover:bg-brand-50/50 py-12"
            : "border-gray-200 bg-gray-50 hover:border-brand-300 py-5"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && addFiles(e.target.files)}
        />

        {images.length === 0 ? (
          <>
            <div className="w-16 h-16 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-brand-500">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-gray-700">Kéo thả ảnh vào đây hoặc click để chọn</p>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP · Tối đa {MAX_SIZE_MB}MB/ảnh · Tối đa {maxImages} ảnh</p>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-700">Thêm ảnh</p>
              <p className="text-xs text-gray-400">{images.length}/{maxImages} ảnh đã chọn</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-500 font-medium flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}

      {/* Preview grid */}
      {images.length > 0 && (
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
            Ảnh đã chọn · Click ảnh để đặt làm ảnh bìa
          </p>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {images.map((img, idx) => (
              <div
                key={img.previewUrl}
                className={`relative group aspect-square rounded-2xl overflow-hidden cursor-pointer border-2 transition-all ${
                  img.isCover
                    ? "border-brand-500 shadow-lg shadow-brand-500/20"
                    : "border-transparent hover:border-gray-300"
                }`}
                onClick={() => setCover(idx)}
              >
                <Image
                  src={img.previewUrl}
                  alt={`Ảnh ${idx + 1}`}
                  fill
                  className="object-cover"
                  sizes="25vw"
                  unoptimized // local blob URL
                />

                {/* Cover badge */}
                {img.isCover && (
                  <div className="absolute top-1.5 left-1.5 px-2 py-0.5 bg-brand-600 text-white text-[10px] font-black rounded-full">
                    BÌA
                  </div>
                )}

                {/* Remove button */}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                  className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 hover:bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Hover overlay khi chưa là cover */}
                {!img.isCover && (
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <span className="text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 px-2 py-1 rounded-full">
                      Đặt làm bìa
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {coverImage && (
            <div className="mt-3 flex items-center gap-2 p-3 bg-brand-50 rounded-2xl border border-brand-100">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0">
                <Image src={coverImage.previewUrl} alt="Cover" fill className="object-cover" unoptimized />
              </div>
              <div>
                <p className="text-xs font-bold text-brand-700">Ảnh bìa</p>
                <p className="text-[11px] text-brand-600">Đây là ảnh hiển thị đầu tiên trong kết quả tìm kiếm</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
