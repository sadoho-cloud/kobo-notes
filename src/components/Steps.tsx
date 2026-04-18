"use client";

import { useState } from "react";

export function Step({ num, title, children }: { num: string; title: string; children: React.ReactNode }) {
  return (
    <div className="step">
      <div className="step-num">{num}</div>
      <h3>{title}</h3>
      {children}
    </div>
  );
}

export function PathStep() {
  const [plat, setPlat] = useState("win");
  return (
    <div className="step">
      <div className="step-num">3</div>
      <h3>找到資料庫檔案</h3>
      <div className="plat-tabs">
        <button className={`plat-tab ${plat === "win" ? "active" : ""}`} onClick={() => setPlat("win")}>
          Windows
        </button>
        <button className={`plat-tab ${plat === "mac" ? "active" : ""}`} onClick={() => setPlat("mac")}>
          macOS
        </button>
      </div>
      {plat === "win" ? (
        <>
          <p style={{ fontSize: ".82rem", color: "var(--dim)", lineHeight: 1.7 }}>
            按 <code>Win+R</code>，輸入以下路徑：
          </p>
          <div className="path-box">%LocalAppData%\Kobo\Kobo Desktop Edition\Kobo.sqlite</div>
        </>
      ) : (
        <>
          <p style={{ fontSize: ".82rem", color: "var(--dim)", lineHeight: 1.7 }}>
            在 Finder 按 <code>⌘+Shift+G</code>，輸入：
          </p>
          <div className="path-box">~/Library/Application Support/Kobo/Kobo Desktop Edition/Kobo.sqlite</div>
        </>
      )}
    </div>
  );
}
