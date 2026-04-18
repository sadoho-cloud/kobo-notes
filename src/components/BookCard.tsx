"use client";

import { CoverImage } from "./CoverImage";
import { Book } from "@/lib/db";

interface BookCardProps {
  book: Book;
  onClick: () => void;
}

export function BookCard({ book, onClick }: BookCardProps) {
  return (
    <div className="card" onClick={onClick}>
      <CoverImage title={book.title} author={book.author} />
      <div className="cinfo">
        <div className="ctitle">{book.title}</div>
        <div className="cauthor">{book.author || "未知作者"}</div>
        {book.percent > 0 && (
          <div className="prog-wrap">
            <div className="prog-fill" style={{ width: book.percent + "%" }}></div>
          </div>
        )}
        <div className="badges">
          {book.highlights > 0 && <span className="badge">{book.highlights} 畫線</span>}
          {book.notes > 0 && <span className="badge n">{book.notes} 筆記</span>}
        </div>
      </div>
    </div>
  );
}
