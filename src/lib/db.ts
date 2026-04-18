"use client";

// Define the shape of our returned data
export interface Annotation {
  id: string;
  text: string;
  note: string;
  chapter: string;
  date: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  publisher: string;
  date: string;
  percent: number;
  highlights: number;
  notes: number;
  annotations: Annotation[];
}

export interface ParsedDbResult {
  books: Book[];
  totalHighlights: number;
  totalNotes: number;
}

export async function parseDB(file: File): Promise<ParsedDbResult> {
  // We use standard HTMLScriptElement injection because sql.js requires WASM loading
  // which works robustly this way in the browser (bypass Next.js SSR boundaries).
  if (typeof window !== "undefined" && !(window as any).initSqlJs) {
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/sql-wasm.js";
    document.body.appendChild(script);
    await new Promise((resolve) => (script.onload = resolve));
  }

  const SQL = await (window as any).initSqlJs({
    locateFile: (f: string) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${f}`,
  });

  const buf = await file.arrayBuffer();
  const db = new SQL.Database(new Uint8Array(buf));

  const run = (sql: string) => {
    try {
      const r = db.exec(sql);
      if (!r.length) return [];
      const c = r[0].columns;
      return r[0].values.map((row: any[]) => {
        const o: Record<string, any> = {};
        c.forEach((k: string, i: number) => (o[k] = row[i]));
        return o;
      });
    } catch {
      return [];
    }
  };

  const allBooks = run(
    "SELECT * FROM content WHERE ContentType=6 AND Title IS NOT NULL AND Title != '' ORDER BY DateCreated DESC"
  );
  const POCKET = "application/x-kobo-html+pocket";
  const books = allBooks.filter(
    (b: any) =>
      b.MimeType !== POCKET && (b.Accessibility === 1 || b.Accessibility === 6 || b.EntitlementId)
  );
  
  const bookList = books.length > 0 ? books : allBooks.filter((b: any) => b.MimeType !== POCKET);

  const bms =
    run(
      "SELECT b.BookmarkID,b.VolumeID,b.ContentID,b.Text,b.Annotation,b.DateCreated,b.ChapterProgress,c.Title AS ChapterTitle FROM Bookmark b LEFT JOIN content c ON b.ContentID=c.ContentID ORDER BY b.VolumeID,b.ChapterProgress,b.DateCreated"
    ) ||
    run(
      "SELECT BookmarkID,VolumeID,ContentID,Text,Annotation,DateCreated,ChapterProgress FROM Bookmark ORDER BY VolumeID,ChapterProgress,DateCreated"
    );

  db.close();

  const bmMap: Record<string, any[]> = {};
  (bms || []).forEach((bm: any) => {
    const v = bm.VolumeID || "";
    (bmMap[v] = bmMap[v] || []).push(bm);
  });

  const result: Book[] = bookList.map((b: any) => {
    const cid = b.ContentID;
    const ar = bmMap[cid] || [];
    let pct = b.___PercentRead || 0;
    if (typeof pct === "number" && pct <= 1.0) pct = Math.round(pct * 100);
    else pct = Math.round(pct) || 0;

    const anns = ar
      .filter((a: any) => (a.Text && a.Text.trim()) || (a.Annotation && a.Annotation.trim()))
      .map((a: any) => ({
        id: a.BookmarkID || "",
        text: (a.Text || "").trim(),
        note: (a.Annotation || "").trim(),
        chapter: (a.ChapterTitle || "").trim(),
        date: (a.DateCreated || "").slice(0, 10),
      }));

    return {
      id: cid,
      title: b.Title || "",
      author: b.Attribution || "",
      description: (b.Description || "").replace(/<[^>]+>/g, "").trim(),
      publisher: b.Publisher || "",
      date: (b.DateCreated || "").slice(0, 10),
      percent: pct,
      highlights: anns.filter((a: any) => a.text).length,
      notes: anns.filter((a: any) => a.note).length,
      annotations: anns,
    };
  });

  const totalH = result.reduce((s: number, b: Book) => s + b.highlights, 0);
  const totalN = result.reduce((s: number, b: Book) => s + b.notes, 0);
  
  return { books: result, totalHighlights: totalH, totalNotes: totalN };
}
