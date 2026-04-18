import { NextResponse } from "next/server";
import { auth } from "@/auth";

export const runtime = "edge";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = process.env.DB as any;
    if (!db) {
       console.log("No DB binding attached, simulating empty DB.");
       return NextResponse.json({ books: [], totalHighlights: 0, totalNotes: 0 });
    }

    const email = session.user.email;
    
    const { results: rawBooks } = await db.prepare("SELECT * FROM UsersBooks WHERE user_email = ? ORDER BY date DESC").bind(email).all();
    const { results: rawAnns } = await db.prepare("SELECT * FROM Annotations WHERE user_email = ?").bind(email).all();

    let totalHighlights = 0;
    let totalNotes = 0;

    const books = rawBooks.map((b: any) => {
       const anns = rawAnns.filter((a: any) => a.book_id === b.book_id);
       const highlights = anns.filter((a: any) => a.text).length;
       const notes = anns.filter((a: any) => a.note).length;
       totalHighlights += highlights;
       totalNotes += notes;

       return {
         ...b,
         id: b.book_id,
         highlights,
         notes,
         annotations: anns
       };
    });
    
    return NextResponse.json({ books, totalHighlights, totalNotes });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
