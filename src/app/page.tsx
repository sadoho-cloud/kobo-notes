"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import { parseDB, ParsedDbResult } from "@/lib/db";
import { Landing } from "@/components/Landing";
import { Detail } from "@/components/Detail";
import { BookCard } from "@/components/BookCard";
import { BackIcon, BookIcon, PlusIcon, SearchIcon } from "@/components/icons";

export default function Home() {
  const { data: session, status } = useSession();
  const [data, setData] = useState<ParsedDbResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sel, setSel] = useState<any | null>(null); // selected book
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("date");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (status === "authenticated" && !data && !loading && !error) {
      setLoading(true);
      fetch("/api/books")
        .then((res) => res.json())
        .then((resData) => {
          if (resData.books && resData.books.length > 0) {
            setData(resData);
            console.log("Loaded cloud library:", resData.books.length);
          }
        })
        .catch((err) => console.error("Failed to load cloud library:", err))
        .finally(() => setLoading(false));
    }
  }, [status, data, loading, error]);

  const handleLoad = useCallback((file: File) => {
    setLoading(true);
    setError(null);
    requestAnimationFrame(() => {
      setTimeout(async () => {
        try {
          const d = await parseDB(file);
          setData(d);
          
          // Send to cloud if logged in
          fetch("/api/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ books: d.books })
          }).catch(err => console.error("Cloud sync failed:", err));
          
        } catch (e: any) {
          setError(e.message || "解析失敗，請確認檔案格式正確");
        } finally {
          setLoading(false);
        }
      }, 50);
    });
  }, []);

  const books = useMemo(() => {
    if (!data) return [];
    let b = [...data.books];
    if (filter === "hi") b = b.filter((x) => x.highlights > 0);
    else if (filter === "nt") b = b.filter((x) => x.notes > 0);
    else if (filter === "any") b = b.filter((x) => x.highlights > 0 || x.notes > 0);

    if (q.trim()) {
      const t = q.toLowerCase();
      b = b.filter((x) => (x.title + x.author).toLowerCase().includes(t));
    }

    if (sort === "title") b.sort((A, B) => A.title.localeCompare(B.title, "zh-TW"));
    else if (sort === "hi") b.sort((A, B) => B.highlights - A.highlights);
    else if (sort === "nt") b.sort((A, B) => B.notes - A.notes);
    else b.sort((A, B) => (B.date || "").localeCompare(A.date || ""));

    return b;
  }, [data, q, sort, filter]);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>正在解析資料庫，請稍候...</p>
      </div>
    );
  }

  if (!data) {
    return <Landing onLoad={handleLoad} loading={loading} />;
  }

  if (error) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
        <div className="err-box">
          <h3>⚠️ 解析失敗</h3>
          <p>{error}</p>
          <button
            className="retry-btn"
            onClick={() => {
              setError(null);
              setData(null);
            }}
          >
            重新上傳
          </button>
        </div>
      </div>
    );
  }

  if (sel) {
    return (
      <>
        <header className="app-hdr">
          <button className="back-btn" onClick={() => setSel(null)}>
            <BackIcon /> 返回書架
          </button>
          <span className="app-logo">
            <BookIcon />
            KoboNotes
          </span>
          <div className="flex items-center gap-4 ml-auto">
            {session?.user && (
              <div className="flex items-center gap-3">
                 <img src={session.user.image || ""} alt="avatar" className="w-7 h-7 rounded-full border border-[var(--bdr)]" />
                 <button onClick={() => signOut()} className="text-[.8rem] text-[var(--dim)] hover:text-white transition-colors duration-200">登出</button>
              </div>
            )}
            <button
              className="new-btn m-0 ml-2"
              onClick={() => {
                setData(null);
                setSel(null);
              }}
            >
              <PlusIcon /> 載入新檔案
            </button>
          </div>
        </header>
        <Detail book={sel} />
      </>
    );
  }

  return (
    <>
      <header className="app-hdr" key="header">
        <span className="app-logo" onClick={() => setSel(null)}>
          <BookIcon />
          KoboNotes
        </span>
        <div className="sbox">
          <SearchIcon />
          <input
            placeholder="搜尋書名、作者..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <span className="stat-txt hidden sm:inline-block">
          {data.books.length} 本書 · {data.totalHighlights} 畫線 · {data.totalNotes} 筆記
        </span>
        
        <div className="flex items-center gap-4 ml-auto">
          {session?.user && (
            <div className="flex items-center gap-3">
               <img src={session.user.image || ""} alt="avatar" className="w-7 h-7 rounded-full border border-[var(--bdr)]" />
               <button onClick={() => signOut()} className="text-[.8rem] text-[var(--dim)] hover:text-white transition-colors duration-200">登出</button>
            </div>
          )}
          <button
            className="new-btn m-0 ml-2"
            onClick={() => {
              setData(null);
              setSel(null);
            }}
          >
            <PlusIcon /> 載入新檔案
          </button>
        </div>
      </header>

      <div className="bar" key="bar">
        <label>排序：</label>
        {[
          ["date", "最近"],
          ["title", "書名"],
          ["hi", "畫線數"],
          ["nt", "筆記數"],
        ].map(([v, l]) => (
          <button
            key={v}
            className={`chip ${sort === v ? "on" : ""}`}
            onClick={() => setSort(v)}
          >
            {l}
          </button>
        ))}
        <label style={{ marginLeft: ".75rem" }}>篩選：</label>
        {[
          ["all", "全部"],
          ["any", "有筆記"],
          ["hi", "有畫線"],
        ].map(([v, l]) => (
          <button
            key={v}
            className={`chip ${filter === v ? "on" : ""}`}
            onClick={() => setFilter(v)}
          >
            {l}
          </button>
        ))}
      </div>

      {books.length === 0 ? (
        <div key="empty" className="empty" style={{ marginTop: "3rem" }}>
          找不到符合的書籍
        </div>
      ) : (
        <div key="grid" className="grid">
          {books.map((b) => (
            <BookCard key={b.id} book={b} onClick={() => setSel(b)} />
          ))}
        </div>
      )}
    </>
  );
}
