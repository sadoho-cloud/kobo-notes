"use client";

import { useState, useEffect, useRef } from "react";

interface CoverImageProps {
  title: string;
  author: string;
  isDetail?: boolean;
}

export function CoverImage({ title, author, isDetail }: CoverImageProps) {
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || coverUrl || failed) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          observer.disconnect();
          const q = encodeURIComponent((title + " " + (author || "")).trim());
          fetch(`https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=1`)
            .then((res) => res.json() as any)
            .then((data) => {
              if (data.items && data.items.length > 0 && data.items[0].volumeInfo.imageLinks) {
                const url = data.items[0].volumeInfo.imageLinks.thumbnail.replace("http:", "https:");
                setCoverUrl(url);
              } else {
                setFailed(true);
              }
            })
            .catch(() => setFailed(true));
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [title, author, coverUrl, failed]);

  return (
    <div
      className="cover"
      ref={ref}
      style={coverUrl ? { padding: 0, background: "var(--s1)" } : isDetail ? { height: "100%", borderRadius: 0 } : {}}
    >
      {coverUrl ? (
        <img
          src={coverUrl}
          alt="cover"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          loading="lazy"
        />
      ) : (
        <>
          <div className="cover-icon">📖</div>
          <div className="cover-title">{title}</div>
        </>
      )}
    </div>
  );
}
