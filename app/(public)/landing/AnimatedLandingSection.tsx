'use client';

import * as motion from "motion/react-client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Autoplay, FreeMode, Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: [0.42, 0, 0.58, 1] as [number, number, number, number] },
    },
};

const fadeInScale = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.6 },
    },
};

// If you have other animation variants with 'ease: [0.42, 0, 0.58, 1] as [number, number, number, number]', replace them similarly.
const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.2 },
    },
};

export function AnimatedLandingSection({ leftColumn, rightColumn, target, email, chart, clientLogos, clientLogosLoop }: { leftColumn: React.ReactNode, rightColumn: React.ReactNode, target: React.ReactNode, email: React.ReactNode, chart: React.ReactNode, clientLogos: { src: string; alt: string }[] , clientLogosLoop: { src: string; alt: string }[]}) {
    const router = useRouter();
    const [viewport, setViewport] = useState<{ once: boolean; margin: string; amount: number }>({
        once: true,
        margin: "-100px", // default for SSR
        amount: 0.25,
    });

    useEffect(() => {
        const isMobile = window.innerWidth < 768;
        setViewport({
            once: true,
            margin: isMobile ? "-20px" : "-100px",
            amount: isMobile ? 0.1 : 0.25,
        });
    }, []);

    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        // Get the hash from the current URL
        const hash = window.location.hash; // e.g. "#section1"
        if (hash) {
            const id = hash.substring(1); // remove "#"
            const section = document.getElementById(id);
            if (section) {
                // Small delay to ensure the element exists
                setTimeout(() => {
                    section.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
        }
    }, [pathname, searchParams?.toString()]); // Re-run when path changes

    return <>
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            variants={fadeInUp}
            className="grid md:grid-cols-2 gap-8 items-center"
        >
            {leftColumn}
            {rightColumn}

        </motion.div>

        <motion.div
            id="features"
            className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-12"
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            variants={staggerContainer}
        >
            {/* Add group class to each feature card */}
            <motion.div
                variants={fadeInUp}
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="text-center group"
            >
                {target}
            </motion.div>

            <motion.div
                variants={fadeInUp}
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="text-center group"
            >
                {email}
            </motion.div>

            <motion.div
                variants={fadeInUp}
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="text-center group"
            >
                {chart}
            </motion.div>


        </motion.div>
            {/* Logos défilants - Ils nous font confiance */}
          <motion.div
            className="mt-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeInUp}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl font-bold text-center mb-12">
                +3 000 entreprises automatisent déjà leurs relances clients
                <br />
                avec Payment Flow
              </h2>
              <div className="relative overflow-hidden">
                <style>{`.logos-swiper .swiper-wrapper { transition-timing-function: linear !important; }`}</style>
                <Swiper
                  className="logos-swiper"
                  modules={[Autoplay, FreeMode]}
                  autoplay={{ delay: 0, disableOnInteraction: false, pauseOnMouseEnter: false, waitForTransition: false }}
                  speed={30000}
                  loop
                  loopAdditionalSlides={clientLogos.length * 4}
                  loopPreventsSliding={false}
                  freeMode={{ enabled: true, momentum: false }}
                  slidesPerView="auto"
                  spaceBetween={120}
                  allowTouchMove={false}
                >
                  {clientLogosLoop.map((logo, idx) => (
                    <SwiperSlide key={idx} style={{ width: "auto" }}>
                      <img
                        src={logo.src}
                        alt={logo.alt}
                        className="h-10 md:h-12 object-contain filter grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition duration-300"
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
                {/* Effets d'effacement aux extrémités */}
                <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-10 sm:w-14 lg:w-20 bg-gradient-to-r from-gray-50 to-transparent z-10"></div>
                <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-10 sm:w-14 lg:w-20 bg-gradient-to-l from-gray-50 to-transparent z-10"></div>
              </div>
            </div>
          </motion.div>
    </>
}