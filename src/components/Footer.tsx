import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer id="contact" className="bg-charcoal text-gray-300 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <Image
                src="/aame-logo.jpeg"
                alt="AAME Logo"
                width={48}
                height={48}
                className="h-12 w-12 rounded-full brightness-110"
              />
              <div>
                <span className="font-[Montserrat] font-bold text-lg text-white">
                  AAME
                </span>
                <p className="text-[8px] uppercase tracking-widest text-primary font-semibold">
                  Education
                </p>
              </div>
            </div>
            <p className="text-sm leading-relaxed mb-6">
              Setting the global standard for medical aesthetic education and
              professional excellence.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="hover:text-primary transition-colors"
                aria-label="Website"
              >
                <span className="material-symbols-outlined">public</span>
              </a>
              <a
                href="#"
                className="hover:text-primary transition-colors"
                aria-label="Email"
              >
                <span className="material-symbols-outlined">mail</span>
              </a>
              <a
                href="#"
                className="hover:text-primary transition-colors"
                aria-label="Phone"
              >
                <span className="material-symbols-outlined">call</span>
              </a>
            </div>
          </div>

          <div>
            <h5 className="text-white font-bold mb-6">Quick Links</h5>
            <ul className="space-y-4 text-sm">
              <li>
                <Link
                  href="/courses"
                  className="hover:text-primary transition-colors"
                >
                  Browse Courses
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Our Faculty
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Alumni Success
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  FAQs
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="text-white font-bold mb-6">Course Categories</h5>
            <ul className="space-y-4 text-sm">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Neuromodulators
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Dermal Fillers
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Skin Rejuvenation
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  IV Nutrition
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="text-white font-bold mb-6">Newsletter</h5>
            <p className="text-sm mb-4">
              Stay updated with latest clinical insights and course dates.
            </p>
            <div className="flex">
              <input
                className="bg-gray-800 border-none rounded-l-lg px-4 py-2 w-full focus:ring-1 focus:ring-primary text-sm text-white placeholder-gray-500"
                placeholder="Email Address"
                type="email"
              />
              <button className="bg-primary text-charcoal px-4 py-2 rounded-r-lg font-bold hover:bg-primary-light transition-colors">
                <span className="material-symbols-outlined text-sm">send</span>
              </button>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <p>&copy; 2026 American Aesthetics Medical Education. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
