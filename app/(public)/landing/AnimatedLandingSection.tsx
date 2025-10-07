'use client';

import * as motion from "motion/react-client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

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

export function AnimatedLandingSection({ leftColumn, rightColumn, target, email, chart }: { leftColumn: React.ReactNode, rightColumn: React.ReactNode, target: React.ReactNode, email: React.ReactNode, chart: React.ReactNode }) {
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
    </>
}