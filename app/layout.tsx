import type { Metadata } from "next";
import { Lora, Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  subsets: ["cyrillic", "latin"],
  variable: "--font-manrope",
  display: "swap",
});

const editorial = Lora({
  subsets: ["cyrillic", "latin"],
  variable: "--font-editorial",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ContextPath AI | Персональное обучение",
  description:
    "AI EdTech-платформа, которая строит индивидуальную траекторию обучения вокруг опыта, профессии, языка и цели человека.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={`${manrope.variable} ${editorial.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
