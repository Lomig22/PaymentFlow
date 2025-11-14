'use client';

import * as motion from 'motion/react-client';

import StorylaneDemoEmbed from "../../../components/StorylaneDemoEmbed";

const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: [0.42, 0, 0.58, 1] as [number, number, number, number] },
    },
};

export function StorylaneDemo({ children }: { children: React.ReactNode }) {
    return <>
        {/* Intégration de la démo Storylane */}
        <motion.div
            className="mt-16"
            initial="hidden"
            whileInView="visible"
            viewport={{
                once: true,
                amount: 0.2
            }}
            variants={fadeInUp}
        >
            {children}
            <div className="w-full">
                <StorylaneDemoEmbed />
            </div>
        </motion.div>
    </>;
}