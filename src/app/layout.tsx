import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AAME - American Aesthetics Medical Education",
  description:
    "Master the art and science of medical aesthetics with world-class training from industry-leading practitioners. Accredited courses designed for medical professionals.",
  keywords: ["aesthetics", "medical education", "botox", "fillers", "certification", "AAME", "Miami"],
  openGraph: {
    title: "AAME - American Aesthetics Medical Education",
    description: "Master medical aesthetics with world-class hands-on training. 21+ accredited courses.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Montserrat:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
