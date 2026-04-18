"use client";

interface PolicyModalProps {
  type: "privacy" | "disclaimer";
  onClose: () => void;
}

export function PolicyModal({ type, onClose }: PolicyModalProps) {
  const content =
    type === "privacy" ? (
      <>
        <h2>隱私權聲明</h2>
        <div className="modal-body">
          <p>
            1. <strong>資料儲存與處理</strong>：本工具（KoboNotes）為純前端應用程式，所有資料庫解析與文字處理作業均在您的瀏覽器本地端進行（目前正在升級為雲端同步版本）。
          </p>
          <p>
            2. <strong>不上傳資料</strong>：只有當您登入並建立雲端書架時，筆記資料才會加密儲存於伺服器。若未登入，我們不會將您的資料庫檔案上傳至任何伺服器。
          </p>
          <p>
            3. <strong>第三方追蹤</strong>：本工具未使用任何商業追蹤碼來分析您的使用行為。
          </p>
          <p>
            4. <strong>開源透明</strong>：本工具完全開源且透明，任何人皆可檢視原始碼以驗證資料安全性。
          </p>
        </div>
      </>
    ) : (
      <>
        <h2>免責聲明</h2>
        <div className="modal-body">
          <p>
            1. <strong>無關聯性</strong>：本工具為獨立開發之第三方工具，與 Rakuten Kobo 及其關係企業無任何關聯、合作、授權或贊助。
          </p>
          <p>
            2. <strong>資料風險</strong>：本工具僅為讀取資料庫並匯出文字，不具備修改或刪除本地資料庫的功能。儘管如此，使用者在操作時仍應自行承擔資料風險。
          </p>
          <p>
            3. <strong>不保證無誤</strong>：本工具盡力確保解析結果之正確性，但不保證所有筆記與畫線內容皆能百分之百無誤解析。
          </p>
          <p>
            4. <strong>著作權</strong>：您透過本工具匯出之筆記與書籍內容，皆屬原著作權人所有，請遵守相關著作權法規，僅限個人閱讀或合理使用。
          </p>
        </div>
      </>
    );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ×
        </button>
        {content}
      </div>
    </div>
  );
}
