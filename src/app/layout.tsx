import type { Metadata } from "next";
import Providers from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "AAME - American Aesthetics Medical Education",
  description:
    "Domina el arte y la ciencia de la estética médica con entrenamiento de clase mundial. Cursos acreditados para profesionales médicos.",
  keywords: ["estética", "educación médica", "botox", "fillers", "certificación", "AAME", "Houston"],
  openGraph: {
    title: "AAME - American Aesthetics Medical Education",
    description: "Domina la estética médica con entrenamiento práctico de clase mundial. 21+ cursos acreditados.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
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
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
