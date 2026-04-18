import type { Metadata } from "next";
import { Noto_Sans_TC } from "next/font/google";
import "./globals.css";
import { Provider } from "@/components/Provider";

const notoSansTC = Noto_Sans_TC({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "KoboNotes — 閱讀筆記整理工具",
  description: "把你的 Kobo 畫線筆記整理成漂亮的書架",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW" className={notoSansTC.className}>
      <body>
        <div id="root">
          <Provider>{children}</Provider>
        </div>
      </body>
    </html>
  );
}
