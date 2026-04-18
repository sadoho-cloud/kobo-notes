import { NextResponse } from "next/server";
import { auth } from "@/auth";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // In local dev, standard Next.js edge doesn't bind env.DB natively without next-dev wrapping.
    // For now, this is a placeholder where D1 inserts will happen.
    // We will use the standard getRequestContext().env.DB logic.
    // import { getRequestContext } from "@cloudflare/next-on-pages";
    // const env = getRequestContext().env;
    // const db = env.DB;
    
    const body = (await req.json()) as any;
    const { books } = body;
    
    if (!books || !Array.isArray(books)) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }
    
    const db = process.env.DB as any;
    if (!db) {
       console.log("No DB binding attached, skipping true cloud save.");
       return NextResponse.json({ success: true, count: books.length, note: "Local DEV bypass" });
    }

    const email = session.user.email;
    const statements = [];

    // Clean old data for this user to avoid duplicates if re-uploading
    statements.push(db.prepare("DELETE FROM UsersBooks WHERE user_email = ?").bind(email));
    statements.push(db.prepare("DELETE FROM Annotations WHERE user_email = ?").bind(email));

    // Prepare inserts
    for (const b of books) {
      statements.push(db.prepare(
        "INSERT INTO UsersBooks (user_email, book_id, title, author, description, publisher, date, percent) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
      ).bind(email, b.id, b.title, b.author || "", b.description || "", b.publisher || "", b.date || "", b.percent || 0));

      for (const ann of b.annotations) {
        statements.push(db.prepare(
          "INSERT INTO Annotations (id, user_email, book_id, chapter, text, note, date) VALUES (?, ?, ?, ?, ?, ?, ?)"
        ).bind(ann.id || crypto.randomUUID(), email, b.id, ann.chapter || "", ann.text || "", ann.note || "", ann.date || ""));
      }
    }

    await db.batch(statements);

    return NextResponse.json({ success: true, count: books.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
