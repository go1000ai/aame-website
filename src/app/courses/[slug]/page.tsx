import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import type { Course } from "@/lib/supabase/types";
import { SAMPLE_COURSES } from "@/lib/sample-data";
import {
  slugify,
  getCourseJsonLd,
  getFaqJsonLd,
  getCourseFaqs,
} from "@/lib/seo";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

function getSupabase() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

async function getAllCourses(): Promise<Course[]> {
  const supabase = getSupabase();
  const { data } = await supabase
    .from("courses")
    .select("*")
    .eq("active", true)
    .order("sort_order");
  return data && data.length > 0 ? data : SAMPLE_COURSES;
}

async function getCourseBySlug(slug: string): Promise<Course | null> {
  const courses = await getAllCourses();
  return courses.find((c) => slugify(c.title) === slug) || null;
}

export async function generateStaticParams() {
  const courses = await getAllCourses();
  return courses.map((course) => ({ slug: slugify(course.title) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) return { title: "Course Not Found" };

  const title = `${course.title} — Certification Course | AAME Houston`;
  const description =
    course.description ||
    `${course.title} certification course at AAME. ${course.duration} of professional training in ${course.category}. Led by Strani Mayorga in Houston, TX.`;

  return {
    title,
    description,
    keywords: [
      course.title,
      course.category,
      "certification",
      "Houston",
      "medical aesthetics",
      "AAME",
      "training",
      `${course.title} course`,
      `${course.category} training`,
    ],
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://aameaesthetics.com/courses/${slug}`,
      siteName: "AAME — American Academy of Medical Esthetics",
      locale: "es_MX",
      alternateLocale: ["en_US"],
      ...(course.image_url
        ? {
            images: [
              {
                url: course.image_url,
                width: 1200,
                height: 630,
                alt: course.title,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: `${course.title} | AAME`,
      description,
    },
  };
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) notFound();

  const faqs = getCourseFaqs(course);
  const courseJsonLd = getCourseJsonLd(course, slug);
  const faqJsonLd = getFaqJsonLd(faqs);

  return (
    <>
      <Navbar />

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <main className="pt-20">
        {/* Hero */}
        <section className="bg-charcoal text-white">
          <div className="max-w-5xl mx-auto px-6 py-12 sm:py-16">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="text-primary font-black text-4xl">
                {course.num}
              </span>
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                {course.category}
              </span>
              {course.featured && (
                <span className="bg-primary text-charcoal text-[10px] font-bold uppercase px-2 py-0.5 tracking-wider">
                  Best Value
                </span>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-[Montserrat] font-black uppercase leading-tight">
              {course.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-400">
              {course.duration && (
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary text-base">
                    schedule
                  </span>
                  {course.duration}
                </span>
              )}
              {course.has_inperson && (
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary text-base">
                    groups
                  </span>
                  In-Person
                </span>
              )}
              {course.has_online && (
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary text-base">
                    laptop_mac
                  </span>
                  Online
                </span>
              )}
            </div>
            <div className="mt-6 flex items-baseline gap-3">
              <span className="text-gray-500 line-through text-lg">
                {course.price_regular_display}
              </span>
              <span className="text-primary font-black text-3xl">
                {course.price_discount_display}
              </span>
              <span className="text-[10px] font-bold uppercase bg-primary/10 text-primary px-2 py-1 tracking-wider">
                Save{" "}
                {Math.round(
                  ((course.price_regular_cents - course.price_discount_cents) /
                    course.price_regular_cents) *
                    100
                )}
                %
              </span>
            </div>
          </div>
        </section>

        <div className="max-w-5xl mx-auto px-6 py-10 sm:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-10">
              {/* About This Course */}
              <section id="about">
                <h2 className="text-xl font-[Montserrat] font-bold uppercase mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">
                    description
                  </span>
                  About This Course
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  {course.description}
                </p>
              </section>

              {/* Key Facts */}
              <section id="key-facts">
                <h2 className="text-xl font-[Montserrat] font-bold uppercase mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">
                    fact_check
                  </span>
                  Key Facts
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-white border border-gray-200 p-4 text-center">
                    <span className="material-symbols-outlined text-primary text-2xl mb-2 block">
                      schedule
                    </span>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">
                      Duration
                    </p>
                    <p className="font-bold text-sm mt-1">
                      {course.duration || "—"}
                    </p>
                  </div>
                  <div className="bg-white border border-gray-200 p-4 text-center">
                    <span className="material-symbols-outlined text-primary text-2xl mb-2 block">
                      school
                    </span>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">
                      Format
                    </p>
                    <p className="font-bold text-sm mt-1">
                      {course.has_inperson && course.has_online
                        ? "Hybrid"
                        : course.has_online
                          ? "Online"
                          : "In-Person"}
                    </p>
                  </div>
                  <div className="bg-white border border-gray-200 p-4 text-center">
                    <span className="material-symbols-outlined text-primary text-2xl mb-2 block">
                      person
                    </span>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">
                      Instructor
                    </p>
                    <p className="font-bold text-sm mt-1">Strani Mayorga</p>
                  </div>
                  <div className="bg-white border border-gray-200 p-4 text-center">
                    <span className="material-symbols-outlined text-primary text-2xl mb-2 block">
                      workspace_premium
                    </span>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">
                      Certificate
                    </p>
                    <p className="font-bold text-sm mt-1">Included</p>
                  </div>
                </div>
              </section>

              {/* What's Included */}
              <section id="whats-included">
                <h2 className="text-xl font-[Montserrat] font-bold uppercase mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">
                    inventory_2
                  </span>
                  What&apos;s Included
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {course.has_inperson && (
                    <div className="bg-white border border-gray-200 p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="material-symbols-outlined text-primary">
                          groups
                        </span>
                        <h3 className="font-bold text-sm uppercase tracking-wider">
                          In-Person
                        </h3>
                      </div>
                      <ul className="space-y-2 text-sm text-gray-600">
                        {course.inperson_includes.kit && (
                          <li className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-sm">
                              check
                            </span>
                            Professional Kit
                          </li>
                        )}
                        {course.inperson_includes.practice_month && (
                          <li className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-sm">
                              check
                            </span>
                            1 Month of Practice
                          </li>
                        )}
                        {course.inperson_includes.digital_material && (
                          <li className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-sm">
                              check
                            </span>
                            Digital Materials
                          </li>
                        )}
                        {course.inperson_includes.certificate && (
                          <li className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-sm">
                              check
                            </span>
                            Physical Certificate
                          </li>
                        )}
                        {course.inperson_includes.medical_director && (
                          <li className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-sm">
                              check
                            </span>
                            Medical Director Supervision
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                  {course.has_online && (
                    <div className="bg-white border border-gray-200 p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="material-symbols-outlined text-blue-500">
                          laptop_mac
                        </span>
                        <h3 className="font-bold text-sm uppercase tracking-wider">
                          Online
                        </h3>
                      </div>
                      <ul className="space-y-2 text-sm text-gray-600">
                        {course.online_includes.access_code && (
                          <li className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-sm">
                              check
                            </span>
                            Personal Access Code
                          </li>
                        )}
                        {course.online_includes.digital_material && (
                          <li className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-sm">
                              check
                            </span>
                            Digital Materials & PDFs
                          </li>
                        )}
                        {course.online_includes.practice_month && (
                          <li className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-sm">
                              check
                            </span>
                            1 Month Practice Access
                          </li>
                        )}
                        {course.online_includes.zoom_sessions && (
                          <li className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-sm">
                              check
                            </span>
                            Live Zoom Q&A Sessions
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </section>

              {/* About the Instructor */}
              <section id="instructor">
                <h2 className="text-xl font-[Montserrat] font-bold uppercase mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">
                    person
                  </span>
                  About Your Instructor
                </h2>
                <div className="bg-white border border-gray-200 p-6">
                  <h3 className="font-[Montserrat] font-bold text-lg">
                    Strani Mayorga
                  </h3>
                  <p className="text-xs text-primary font-bold uppercase tracking-wider mt-1">
                    Founder & Lead Instructor
                  </p>
                  <p className="text-gray-600 text-sm leading-relaxed mt-3">
                    With over 15 years of hands-on experience in medical
                    aesthetics, Strani Mayorga founded AAME to provide
                    world-class training in Spanish and English. Her expertise
                    spans injectables, body contouring, advanced skin treatments,
                    and medical procedures. Every AAME course combines rigorous
                    theory with extensive hands-on practice under her direct
                    supervision.
                  </p>
                </div>
              </section>

              {/* FAQs */}
              <section id="faqs">
                <h2 className="text-xl font-[Montserrat] font-bold uppercase mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">
                    help
                  </span>
                  Frequently Asked Questions
                </h2>
                <div className="space-y-3">
                  {faqs.map((faq, i) => (
                    <details
                      key={i}
                      className="bg-white border border-gray-200 group"
                    >
                      <summary className="p-4 cursor-pointer font-bold text-sm flex items-center justify-between hover:bg-gray-50 transition-colors">
                        {faq.question}
                        <span className="material-symbols-outlined text-gray-400 group-open:rotate-180 transition-transform">
                          expand_more
                        </span>
                      </summary>
                      <div className="px-4 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                        {faq.answer}
                      </div>
                    </details>
                  ))}
                </div>
              </section>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Sticky CTA */}
              <div className="lg:sticky lg:top-24">
                <div className="bg-white border-2 border-primary p-6">
                  <div className="mb-4">
                    <span className="text-gray-400 line-through text-sm">
                      {course.price_regular_display}
                    </span>
                    <span className="text-primary font-black text-3xl ml-2">
                      {course.price_discount_display}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                    <span className="material-symbols-outlined text-primary text-base">
                      lock
                    </span>
                    $200 deposit locks your discount price
                  </div>
                  <Link
                    href="/schedule"
                    className="block w-full bg-primary text-charcoal font-bold uppercase text-xs tracking-widest px-6 py-4 hover:brightness-110 transition-all text-center"
                  >
                    Reserve Your Spot
                  </Link>
                  <Link
                    href="/courses"
                    className="block w-full border-2 border-charcoal text-charcoal font-bold uppercase text-xs tracking-widest px-6 py-3 hover:bg-charcoal hover:text-white transition-all text-center mt-3"
                  >
                    Browse All Courses
                  </Link>
                </div>

                {/* Contact */}
                <div className="bg-gray-50 border border-gray-200 p-5 mt-4 text-center">
                  <p className="text-xs text-gray-500 mb-3">
                    Questions about this course?
                  </p>
                  <a
                    href="tel:+17139275300"
                    className="text-primary text-sm font-bold hover:underline flex items-center justify-center gap-1"
                  >
                    <span className="material-symbols-outlined text-base">
                      call
                    </span>
                    (713) 927-5300
                  </a>
                  <a
                    href="mailto:aame0edu@gmail.com"
                    className="text-primary text-sm font-bold hover:underline flex items-center justify-center gap-1 mt-2"
                  >
                    <span className="material-symbols-outlined text-base">
                      mail
                    </span>
                    aame0edu@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
