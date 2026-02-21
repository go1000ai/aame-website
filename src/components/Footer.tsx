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
            <p className="text-sm leading-relaxed mb-4">
              Setting the global standard for medical aesthetic education and
              professional excellence.
            </p>
            <div className="text-sm space-y-2 mb-6">
              <p className="flex items-start gap-2">
                <span className="material-symbols-outlined text-primary text-base mt-0.5">location_on</span>
                <span>430 Richmond Ave. Office 270<br />Houston, TX 77057</span>
              </p>
              <a href="tel:+17139275300" className="flex items-center gap-2 hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-primary text-base">call</span>
                (713) 927-5300
              </a>
              <a href="mailto:aame0edu@gmail.com" className="flex items-center gap-2 hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-primary text-base">mail</span>
                aame0edu@gmail.com
              </a>
            </div>
            <div className="flex gap-4">
              <a
                href="https://www.facebook.com/aameaesthetics/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
                aria-label="Facebook"
              >
                <span className="material-symbols-outlined">public</span>
              </a>
              <a
                href="https://www.instagram.com/strani.medicinaestetica/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
                aria-label="Instagram"
              >
                <span className="material-symbols-outlined">photo_camera</span>
              </a>
              <a
                href="mailto:aame0edu@gmail.com"
                className="hover:text-primary transition-colors"
                aria-label="Email"
              >
                <span className="material-symbols-outlined">mail</span>
              </a>
              <a
                href="tel:+17139275300"
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
                <Link
                  href="/schedule"
                  className="hover:text-primary transition-colors"
                >
                  Course Schedule
                </Link>
              </li>
              <li>
                <Link
                  href="/#contact"
                  className="hover:text-primary transition-colors"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/#pathways"
                  className="hover:text-primary transition-colors"
                >
                  Professional Pathways
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="text-white font-bold mb-6">Course Categories</h5>
            <ul className="space-y-4 text-sm">
              <li>
                <Link href="/courses" className="hover:text-primary transition-colors">
                  Neuromodulators
                </Link>
              </li>
              <li>
                <Link href="/courses" className="hover:text-primary transition-colors">
                  Dermal Fillers
                </Link>
              </li>
              <li>
                <Link href="/courses" className="hover:text-primary transition-colors">
                  Skin Rejuvenation
                </Link>
              </li>
              <li>
                <Link href="/courses" className="hover:text-primary transition-colors">
                  Body Contouring
                </Link>
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
            <Link href="/student/login" className="hover:text-white transition-colors">
              Student Portal
            </Link>
            <Link href="/admin/login" className="hover:text-white transition-colors">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
