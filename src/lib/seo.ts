import type { Course } from "@/lib/supabase/types";

const SITE_URL = "https://aameaesthetics.com";

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function getCourseJsonLd(course: Course, slug: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description: course.description,
    url: `${SITE_URL}/courses/${slug}`,
    provider: {
      "@type": "EducationalOrganization",
      name: "AAME — American Academy of Medical Esthetics",
      url: SITE_URL,
    },
    instructor: {
      "@type": "Person",
      name: "Strani Mayorga",
      description:
        "Founder & Lead Instructor with 15+ years of medical aesthetics experience",
    },
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/courses/${slug}`,
      price: (course.price_discount_cents / 100).toFixed(2),
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: course.has_online
        ? course.has_inperson
          ? "Blended"
          : "Online"
        : "Onsite",
      courseWorkload: course.duration,
      instructor: {
        "@type": "Person",
        name: "Strani Mayorga",
      },
    },
    educationalLevel: "Professional",
    inLanguage: ["es", "en"],
    courseCode: course.num,
    ...(course.image_url ? { image: course.image_url } : {}),
  };
}

export function getFaqJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function getOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": ["EducationalOrganization", "LocalBusiness"],
    name: "AAME — American Academy of Medical Esthetics",
    alternateName: "American Aesthetics Medical Education",
    description:
      "Medical aesthetics training academy in Houston, TX offering 21+ certification courses in injectables, body contouring, skin rejuvenation, and advanced aesthetics. Led by Strani Mayorga with 15+ years of experience.",
    url: SITE_URL,
    logo: `${SITE_URL}/aame-logo.jpeg`,
    image: `${SITE_URL}/aame-logo.jpeg`,
    telephone: "+17139275300",
    email: "aame0edu@gmail.com",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Houston",
      addressRegion: "TX",
      addressCountry: "US",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "29.7604",
      longitude: "-95.3698",
    },
    priceRange: "$100 - $2,995",
    areaServed: [
      { "@type": "State", name: "Texas" },
      { "@type": "Country", name: "United States" },
    ],
    availableLanguage: [
      { "@type": "Language", name: "Spanish" },
      { "@type": "Language", name: "English" },
    ],
    founder: {
      "@type": "Person",
      name: "Strani Mayorga",
      jobTitle: "Founder & Lead Instructor",
    },
    numberOfEmployees: { "@type": "QuantitativeValue", value: "5-10" },
    knowsAbout: [
      "Botox Training",
      "Dermal Fillers",
      "Medical Aesthetics",
      "Body Contouring",
      "Phlebotomy",
      "PRP Therapy",
      "Microneedling",
      "Chemical Peels",
    ],
  };
}

// Category-based FAQ data
type FaqSet = { question: string; answer: string }[];

const commonFaqs: FaqSet = [
  {
    question: "Will I receive a certificate upon completion?",
    answer:
      "Yes. Every student who completes the course and meets attendance requirements receives an official AAME Certificate of Completion, recognized for professional practice.",
  },
  {
    question: "Is financing available for this course?",
    answer:
      "Yes. AAME offers multiple payment options including credit/debit card, Cherry financing with 0% interest plans, and Zelle. A $200 deposit reserves your spot at the discounted price.",
  },
];

const categoryFaqs: Record<string, FaqSet> = {
  Injectables: [
    {
      question: "Do I need a medical license to take this course?",
      answer:
        "This course is designed for licensed medical professionals (MDs, DOs, NPs, PAs, RNs) and licensed estheticians. Requirements vary by state — contact AAME at (713) 927-5300 for specific eligibility.",
    },
    {
      question: "How many hours of hands-on practice are included?",
      answer:
        "Approximately 80% of in-person course time is hands-on practice with live models under expert supervision. The remaining 20% covers theory, anatomy, and safety protocols.",
    },
    {
      question: "What materials and supplies are included?",
      answer:
        "In-person students receive a professional kit with all necessary supplies, digital course materials, and 1 month of supervised practice access. Online students receive digital materials, a personal access code, and live Zoom Q&A sessions.",
    },
  ],
  "Fillers & Volume": [
    {
      question: "Do I need a medical license to take this course?",
      answer:
        "This course is designed for licensed medical professionals and licensed estheticians. Requirements vary by state — contact AAME at (713) 927-5300 for specific eligibility.",
    },
    {
      question: "Will I learn both needle and cannula techniques?",
      answer:
        "Yes. The course covers both needle and cannula injection techniques, including when to use each approach for optimal safety and results.",
    },
    {
      question: "What materials and supplies are included?",
      answer:
        "In-person students receive a professional kit with all necessary supplies, digital course materials, and 1 month of supervised practice access.",
    },
  ],
  "Skin Care": [
    {
      question: "Is this course suitable for estheticians?",
      answer:
        "Yes. This course is ideal for licensed estheticians, cosmetologists, and skincare professionals looking to expand their service offerings with advanced techniques.",
    },
    {
      question: "Can I practice on live models during training?",
      answer:
        "Yes. In-person training includes hands-on practice with live models so you gain confidence before working with your own clients.",
    },
    {
      question: "What equipment do I need to get started after certification?",
      answer:
        "AAME provides guidance on professional equipment sourcing. Many courses include a starter kit with essential tools to begin offering services immediately.",
    },
  ],
  Dermatology: [
    {
      question: "Is this course suitable for estheticians?",
      answer:
        "Yes. This course is open to licensed estheticians, skincare professionals, and medical practitioners interested in adding advanced dermatological treatments to their practice.",
    },
    {
      question: "Can I combine this treatment with other services?",
      answer:
        "Yes. You will learn combination protocols, including how to pair this treatment with PRP, serums, and other complementary procedures for enhanced results.",
    },
    {
      question: "Is hands-on practice included?",
      answer:
        "Yes. The course includes supervised hands-on practice with professional equipment and live models.",
    },
  ],
  Medical: [
    {
      question: "Is this certification recognized by employers?",
      answer:
        "Yes. AAME certifications meet professional standards and are recognized by clinics, hospitals, and aesthetic practices. The training follows current medical industry protocols.",
    },
    {
      question: "What prerequisites are required?",
      answer:
        "No prior medical experience is required for our medical certification courses. Training covers everything from fundamentals to professional-level competency.",
    },
    {
      question: "Does the course include CPR/BLS certification?",
      answer:
        "The EKG Tech + CPR BLS course includes American Heart Association BLS certification. For other medical courses, BLS certification is recommended but not required.",
    },
  ],
  "Blood Science": [
    {
      question: "Do I need phlebotomy experience for this course?",
      answer:
        "No. The Plasma PRP course includes essential phlebotomy training covering blood draw technique, centrifuge operation, and PRP preparation from start to finish.",
    },
    {
      question: "What procedures can I perform after this certification?",
      answer:
        "You will be certified to perform PRP facial rejuvenation (vampire facial), PRP hair restoration, under-eye treatment, and PRP combined with microneedling. Scope depends on your state license.",
    },
    {
      question: "Is hands-on blood draw practice included?",
      answer:
        "Yes. The course includes supervised hands-on practice with venipuncture, centrifuge operation, and PRP injection techniques.",
    },
  ],
  Body: [
    {
      question:
        "Can I start offering services immediately after completing this course?",
      answer:
        "Yes. Upon completing the course and receiving your AAME certificate, you can begin offering professional services to clients. Check your state's licensing requirements.",
    },
    {
      question: "What tools or kit are included?",
      answer:
        "In-person students receive a professional kit with all necessary tools and supplies, plus digital course materials and 1 month of supervised practice access.",
    },
    {
      question: "Is there a practical component?",
      answer:
        "Yes. Approximately 80% of in-person course time is dedicated to hands-on practice, learning proper technique, pressure, and treatment protocols.",
    },
  ],
  "Body Tech": [
    {
      question: "What types of machines will I learn to operate?",
      answer:
        "You will learn to operate professional body contouring equipment including radiofrequency devices, ultrasonic cavitation machines, vacuum therapy systems, and electrostimulation units.",
    },
    {
      question: "Do I need to purchase my own equipment?",
      answer:
        "Equipment is provided during training. AAME offers guidance on purchasing professional equipment after certification, including trusted supplier recommendations.",
    },
    {
      question: "Is this course suitable for spa owners?",
      answer:
        "Yes. This course is ideal for spa owners, estheticians, and wellness professionals looking to add advanced body technology services to their menu.",
    },
  ],
  "Facial Tech": [
    {
      question: "What devices will I learn to use?",
      answer:
        "You will train on professional facial devices including LED therapy, microcurrent, high-frequency, galvanic current, and ultrasound equipment for skin rejuvenation and anti-aging treatments.",
    },
    {
      question: "Is this course suitable for estheticians?",
      answer:
        "Yes. This course is designed for estheticians, skincare professionals, and spa owners who want to offer advanced facial technology treatments.",
    },
    {
      question: "Can I create custom treatment protocols?",
      answer:
        "Yes. The course teaches you how to assess client skin conditions and create customized facial treatment plans combining multiple device modalities.",
    },
  ],
  "Skin Tightening": [
    {
      question: "Is fibroblast a surgical procedure?",
      answer:
        "No. Plasma fibroblast is a non-surgical, minimally invasive skin tightening treatment. It uses ionized gas to stimulate collagen production without incisions or sutures.",
    },
    {
      question: "What areas can be treated with fibroblast?",
      answer:
        "The course covers treatment of upper and lower eyelids, neck, wrinkles, skin tags, moles, and other areas where skin tightening is desired.",
    },
    {
      question: "How long does recovery take for clients?",
      answer:
        "You will learn proper client education about the 5-7 day healing process, including aftercare protocols to minimize downtime and optimize results.",
    },
  ],
  Lifting: [
    {
      question: "What types of PDO threads will I learn to use?",
      answer:
        "The course covers mono threads, screw threads, and barbed/cog threads for different lifting and collagen stimulation effects. You will learn when to use each type.",
    },
    {
      question: "Is thread lifting a surgical procedure?",
      answer:
        "No. PDO thread lifting is a minimally invasive technique that doesn't require general anesthesia or surgical incisions. It's performed with local anesthesia.",
    },
    {
      question: "What areas can be treated with PDO threads?",
      answer:
        "You will learn to treat the face (jowls, cheeks, brows), neck, and body areas. Thread mapping techniques for each treatment zone are covered in detail.",
    },
  ],
  "Full Package": [
    {
      question: "Which individual courses are included in the Full Package?",
      answer:
        "The Full Package is AAME's most comprehensive program, combining multiple courses including injectables (Botox and fillers), skin treatments, body contouring, and advanced techniques. Contact AAME at (713) 927-5300 for the complete course list.",
    },
    {
      question: "How much do I save compared to taking courses separately?",
      answer:
        "The Full Package offers significant savings compared to enrolling in each course individually. The package price of $2,495 (discounted) represents the best value for students committed to a complete aesthetics education.",
    },
    {
      question: "Can I take the courses at my own pace?",
      answer:
        "Yes. Full Package students can schedule their courses flexibly. Online components can be completed at your own pace, and in-person sessions are scheduled based on availability.",
    },
  ],
};

export function getCourseFaqs(course: Course): FaqSet {
  const specific = categoryFaqs[course.category] || categoryFaqs["Body"];
  return [...specific, ...commonFaqs];
}
