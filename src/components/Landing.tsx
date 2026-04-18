"use client";

import { useState, useRef, useCallback } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { BookIcon, ShieldIcon, UploadIcon } from "./icons";
import { PolicyModal } from "./PolicyModal";
import { Step, PathStep } from "./Steps";

interface LandingProps {
  onLoad: (file: File) => void;
  loading: boolean;
}

export function Landing({ onLoad, loading }: LandingProps) {
  const { data: session, status } = useSession();
  const [over, setOver] = useState(false);
  const [modal, setModal] = useState<"privacy" | "disclaimer" | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handle = useCallback(
    async (file: File | undefined | null) => {
      if (!file) return;
      if (!file.name.match(/\.(sqlite|sqlite3|db)$/i)) {
        alert("請選擇 .sqlite 格式的資料庫檔案");
        return;
      }
      
      // Parse locally first (which is what onLoad does in page.tsx)
      onLoad(file);
    },
    [onLoad]
  );

  return (
    <div className="land">
      <nav className="nav">
        <div className="nav-logo">
          <BookIcon />
          KoboNotes
        </div>
        <div className="flex items-center gap-4">
           {status === "authenticated" ? (
             <div className="flex items-center gap-3">
               <img src={session.user?.image || ""} alt="avatar" className="w-7 h-7 rounded-full border border-[var(--bdr)]" />
               <button onClick={() => signOut()} className="text-[.8rem] text-[var(--dim)] hover:text-white transition-colors duration-200">登出</button>
             </div>
           ) : (
             <span className="nav-badge">完全免費 · 開源</span>
           )}
        </div>
      </nav>

      <section className="hero">
        <div className="hero-tag">
          <BookIcon /> Kobo 閱讀筆記整理工具
        </div>
        <h1>
          把你的 Kobo 畫線筆記<br />
          <span>整理成漂亮的書架</span>
        </h1>
        <p className="hero-sub">
          上傳你的 Kobo 資料庫，即可瀏覽所有書籍的畫線重點與閱讀筆記，支援搜尋、篩選與匯出。
        </p>
        <div className="privacy-note">
          <ShieldIcon /> 資料完全在你的瀏覽器中處理，不會上傳到任何伺服器
        </div>

        <div className="upload-wrap">
          {status === "loading" ? (
            <div className="text-center text-[var(--dim)] py-10">載入中...</div>
          ) : status === "authenticated" ? (
            <div
              className={`drop-zone ${over ? "over" : ""}`}
              onDragOver={(e) => {
                e.preventDefault();
                setOver(true);
              }}
              onDragLeave={() => setOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setOver(false);
                handle(e.dataTransfer.files[0]);
              }}
              onClick={() => inputRef.current?.click()}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".sqlite,.sqlite3,.db"
                style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }}
                onChange={(e) => handle(e.target.files?.[0])}
              />
              <UploadIcon />
              <div className="drop-title">你好，{session.user?.name}！請拖放你的 Kobo.sqlite 到這裡</div>
              <div className="drop-sub">
                或 <span>點擊選擇檔案</span>（支援 .sqlite / .db）
              </div>
            </div>
          ) : (
             <button 
               onClick={() => signIn("google")}
               className="mx-auto w-full max-w-[300px] flex items-center justify-center gap-3 bg-white text-gray-800 text-[.95rem] font-bold py-3.5 px-6 rounded-xl shadow-[0_4px_14px_0_rgba(255,255,255,0.2)] hover:shadow-[0_6px_20px_rgba(255,255,255,0.3)] hover:-translate-y-0.5 transition-all duration-200 mt-4"
             >
               <svg viewBox="0 0 24 24" width="22" height="22" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/><path d="M1 1h22v22H1z" fill="none"/></svg>
               透過 Google 繼續登入
             </button>
          )}
        </div>
      </section>

      <section className="how">
        <div className="section-tag">使用教學</div>
        <h2>四步驟，馬上開始</h2>
        <p className="how-sub">第一次使用只需 5 分鐘設定，之後每次只要上傳最新檔案即可</p>
        <div className="steps">
          <Step num="1" title="安裝 Kobo 桌面版">
            <p>
              到 <a href="https://www.kobo.com/desktop" target="_blank" rel="noopener noreferrer">kobo.com/desktop</a> 下載免費的桌面版應用程式（Windows / macOS）
            </p>
          </Step>
          <Step num="2" title="登入並同步">
            <p>打開 Kobo 桌面版，登入你的帳號。應用程式會自動透過網路同步你所有的書籍與筆記。</p>
          </Step>
          <PathStep />
          <Step num="4" title="上傳，完成！">
            <p>
              把 <code>Kobo.sqlite</code> 檔案拖放到上方的上傳區，即可看到你所有的書籍與筆記。
            </p>
          </Step>
        </div>
      </section>

      <section className="features">
        <div className="features-inner">
          <div className="section-tag">功能特色</div>
          <h2 style={{ textAlign: "center", fontSize: "1.6rem", fontWeight: 700, marginBottom: ".5rem" }}>
            你需要的都在這裡
          </h2>
          <div className="feat-grid">
            {[
              ["📚", "書架總覽", "以卡片方式呈現所有書籍，清楚顯示畫線數與筆記數"],
              ["🔍", "即時搜尋", "快速搜尋書名、作者，或在書中搜尋特定筆記內容"],
              ["✏️", "章節分組", "筆記依章節自動分組，閱讀脈絡一目了然"],
              ["📤", "匯出 Markdown", "一鍵匯出為 Markdown 格式，方便匯入 Notion、Obsidian 等工具"],
              ["📊", "排序篩選", "依最近、書名、畫線數、筆記數排序，快速找到重點書籍"],
              ["🔒", "完全隱私", "所有資料在瀏覽器本地處理，絕不上傳或儲存於伺服器"],
            ].map(([icon, title, desc]) => (
              <div className="feat" key={title}>
                <div className="feat-icon">{icon}</div>
                <div className="feat-text">
                  <h4>{title}</h4>
                  <p>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="footer">
        <p>KoboNotes — 完全免費 · 開源 · 隱私優先</p>
        <p style={{ marginTop: ".3rem", marginBottom: ".8rem" }}>與 Kobo / Rakuten 無任何關聯</p>
        <div style={{ display: "flex", justifyContent: "center", gap: "1.2rem", fontSize: ".78rem" }}>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setModal("privacy");
            }}
          >
            隱私權聲明
          </a>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setModal("disclaimer");
            }}
          >
            免責聲明
          </a>
          <a href="https://www.threads.com/@sadoho33" target="_blank" rel="noopener noreferrer">
            作者 @sadoho33
          </a>
        </div>
      </footer>
      {modal && <PolicyModal type={modal} onClose={() => setModal(null)} />}
    </div>
  );
}
