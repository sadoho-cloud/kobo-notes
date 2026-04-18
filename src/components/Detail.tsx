"use client";

import { useMemo, useState } from "react";
import { Book } from "@/lib/db";
import { CoverImage } from "./CoverImage";
import { DlIcon, SearchIcon } from "./icons";

interface DetailProps {
  book: Book;
}

export function Detail({ book }: DetailProps) {
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");

  const anns = useMemo(() => {
    let items = book.annotations || [];
    if (filter === "hi") items = items.filter((a) => a.text);
    else if (filter === "nt") items = items.filter((a) => a.note);
    if (q.trim()) {
      const t = q.toLowerCase();
      items = items.filter((a) => (a.text + a.note + a.chapter).toLowerCase().includes(t));
    }
    return items;
  }, [book.annotations, filter, q]);

  const grouped = useMemo(() => {
    const g: Record<string, any[]> = {};
    anns.forEach((a) => {
      const c = a.chapter || "未分類";
      (g[c] = g[c] || []).push(a);
    });
    return g;
  }, [anns]);

  const exportMD = () => {
    let md = "# " + book.title + "\n**" + (book.author || "未知作者") + "**\n\n---\n\n";
    Object.entries(grouped).forEach(([ch, as]) => {
      md += "## " + ch + "\n\n";
      as.forEach((a) => {
        if (a.text) md += "> " + a.text + "\n\n";
        if (a.note) md += "📝 " + a.note + "\n\n";
        md += "---\n\n";
      });
    });
    const url = URL.createObjectURL(new Blob([md], { type: "text/markdown;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = book.title + " - 閱讀筆記.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  const fmtDate = (d: string) => {
    if (!d) return "";
    try {
      return new Date(d).toLocaleDateString("zh-TW", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return d;
    }
  };

  return (
    <div className="detail">
      <div className="d-hdr">
        <div className="d-cover">
          <CoverImage title={book.title} author={book.author} isDetail={true} />
        </div>
        <div className="d-meta">
          <h1>{book.title}</h1>
          <div className="auth">
            {book.author || "未知作者"}
            {book.publisher ? " · " + book.publisher : ""}
          </div>
          {book.description && <div className="desc">{book.description}</div>}
          <div className="stats">
            <div className="stat-box">
              <span className="n">{book.highlights}</span>
              <span className="l">畫線</span>
            </div>
            <div className="stat-box">
              <span className="n">{book.notes}</span>
              <span className="l">筆記</span>
            </div>
            {book.percent > 0 && (
              <div className="stat-box">
                <span className="n">{book.percent}%</span>
                <span className="l">已讀</span>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="ann-hdr">
        <h2>✏️ 閱讀筆記（{anns.length}）</h2>
        <button className="exp-btn" onClick={exportMD}>
          <DlIcon /> 匯出 Markdown
        </button>
      </div>
      <div className="frow">
        {[
          ["all", "全部"],
          ["hi", "畫線"],
          ["nt", "筆記"],
        ].map(([v, l]) => (
          <button key={v} className={"chip " + (filter === v ? "on" : "")} onClick={() => setFilter(v)}>
            {l}
          </button>
        ))}
        <div className="sbox" style={{ maxWidth: 200, marginLeft: "auto" }}>
          <SearchIcon />
          <input placeholder="搜尋筆記..." value={q} onInput={(e) => setQ((e.target as HTMLInputElement).value)} />
        </div>
      </div>
      {anns.length === 0 ? (
        <div className="empty">這本書目前沒有畫線或筆記</div>
      ) : (
        Object.entries(grouped).map(([ch, as]) => (
          <div className="ch-group" key={ch}>
            <div className="ch-title">{ch}</div>
            {as.map((a, i) => (
              <div className="ann" key={a.id || i}>
                {a.text && <div className="hi">{a.text}</div>}
                {a.note && (
                  <div className="nt">
                    <div className="nt-label">我的筆記</div>
                    {a.note}
                  </div>
                )}
                {a.date && <div className="ann-date">{fmtDate(a.date)}</div>}
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
}
