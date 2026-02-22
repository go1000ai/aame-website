import type { Metadata } from "next";
import Providers from "@/components/Providers";
import { getOrganizationJsonLd } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "AAME — Medical Aesthetics Certification Courses | Houston, TX",
    template: "%s | AAME",
  },
  description:
    "21+ medical aesthetics certification courses in Houston, TX. Botox, fillers, body contouring, PRP, microneedling & more. Hands-on training led by Strani Mayorga with 15+ years of experience. Classes in Spanish & English.",
  keywords: [
    "medical aesthetics training",
    "botox certification Houston",
    "filler training",
    "body contouring course",
    "medical aesthetics certification",
    "AAME",
    "aesthetics school Houston",
    "phlebotomy course",
    "PRP training",
    "microneedling certification",
    "Strani Mayorga",
    "cursos de estética médica",
  ],
  metadataBase: new URL("https://aameaesthetics.com"),
  openGraph: {
    title: "AAME — Medical Aesthetics Certification Courses | Houston, TX",
    description:
      "21+ hands-on medical aesthetics courses: Botox, fillers, body contouring, PRP & more. Led by Strani Mayorga in Houston. Spanish & English.",
    type: "website",
    url: "https://aameaesthetics.com",
    siteName: "AAME — American Academy of Medical Esthetics",
    locale: "es_MX",
    alternateLocale: ["en_US"],
    images: [
      {
        url: "/aame-logo.jpeg",
        width: 1200,
        height: 630,
        alt: "AAME — American Academy of Medical Esthetics",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AAME — Medical Aesthetics Courses | Houston",
    description:
      "21+ certification courses in medical aesthetics. Hands-on training in Botox, fillers, body contouring & more.",
  },
  alternates: {
    canonical: "https://aameaesthetics.com",
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(getOrganizationJsonLd()),
          }}
        />
      </head>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
