'use client';

import { Swiper, SwiperSlide } from "swiper/react";
import * as motion from 'motion/react-client';

import { Navigation, Pagination } from "swiper/modules";

// If you have other animation variants with 'ease: [0.42, 0, 0.58, 1] as [number, number, number, number]', replace them similarly.
const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.2 },
    },
};

// fadeInLeft animation variant (copied from PricingPage.tsx)
const fadeInLeft = {
    hidden: { opacity: 0, x: -20 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.6, ease: [0.42, 0, 0.58, 1] as [number, number, number, number] },
    },
};

export function Testimonials() {
    return <motion.div
        id="testimonials"
        className="mt-32 relative"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 1 }}
        style={{ marginBottom: 0, paddingBottom: 0 }}
    >
        <motion.h2
            className="text-3xl font-bold text-center mb-16"
            variants={fadeInLeft}
        >
            Ce que nos clients disent
        </motion.h2>

        <div className="px-4 relative mb-10">
            {/* Navigation arrows */}
            <div className="swiper-button-prev testimonial-prev left-0 text-blue-600 hover:text-blue-800 transition-colors"></div>
            <div className="swiper-button-next testimonial-next right-0 text-blue-600 hover:text-blue-800 transition-colors"></div>

            <Swiper
                modules={[Navigation, Pagination]}
                navigation={{
                    prevEl: ".testimonial-prev",
                    nextEl: ".testimonial-next",
                }}
                spaceBetween={30}
                pagination={{
                    clickable: true,
                }}
                slidesPerView={1}
                breakpoints={{
                    640: { slidesPerView: 1 },
                    768: { slidesPerView: 2 },
                    1024: { slidesPerView: 3 },
                }}
                style={{ padding: "0 40px" }} // Add padding for arrow spacing
            >
                {[
                    {
                        name: "Sophie Martin",
                        role: "Directrice Financière, TechStart",
                        img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80",
                        text: `"PaymentFlow a transformé notre processus de recouvrement. Nous avons réduit nos délais de paiement de 45 à 15 jours en moyenne."`,
                    },
                    {
                        name: "Thomas Dubois",
                        role: "CEO, Marketing Solutions",
                        img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80",
                        text: `"L'automatisation des relances nous a fait gagner un temps précieux. Notre équipe peut désormais se concentrer sur des tâches à plus forte valeur ajoutée."`,
                    },
                    {
                        name: "Émilie Lefèvre",
                        role: "Responsable Comptabilité, GreenRetail",
                        img: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80",
                        text: `"Les rapports détaillés nous permettent d'identifier rapidement les clients à risque et d'adapter notre stratégie de recouvrement en conséquence."`,
                    },
                    {
                        name: "Alexandre Moreau",
                        role: "Directeur Administratif, LogiTech",
                        img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80",
                        text: `"L'intégration avec notre système comptable est impeccable. Gain de temps garanti dès le premier mois d'utilisation."`,
                    },
                    {
                        name: "Camille Rousseau",
                        role: "Cheffe de projet, StartUp Factory",
                        img: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80",
                        text: `"La personnalisation des modèles de relance a boosté notre taux de réponse de 30%. Un outil indispensable !"`,
                    },
                    {
                        name: "Nicolas Lambert",
                        role: "Responsable CRM, RetailPro",
                        img: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80",
                        text: `"Le suivi en temps réel des relances nous a permis d'optimiser notre trésorerie comme jamais auparavant."`,
                    },
                ].map((testimonial, index) => (
                    <SwiperSlide key={index}>
                        <motion.div
                            variants={fadeInLeft}
                            className="bg-white rounded-lg shadow-lg p-8 border border-gray-200 min-h-[250px] mx-4 my-10 flex flex-col"
                        >
                            <div className="flex items-center mb-6">
                                <img
                                    src={testimonial.img}
                                    alt={testimonial.name}
                                    className="w-12 h-12 rounded-full object-cover mr-4"
                                />
                                <div>
                                    <h4 className="font-bold">{testimonial.name}</h4>
                                    <p className="text-gray-600 text-sm">
                                        {testimonial.role}
                                    </p>
                                </div>
                            </div>
                            <p
                                className="text-gray-700 italic flex-1"
                                style={{
                                    display: "-webkit-box",
                                    WebkitBoxOrient: "vertical",
                                    WebkitLineClamp: 3, // Adjust the number of lines as needed
                                    overflow: "hidden",
                                }}
                            >
                                {testimonial.text}
                            </p>
                        </motion.div>
                    </SwiperSlide>
                ))}
            </Swiper>
            <style>{`
                .testimonial-prev,
                .testimonial-next {
                  position: absolute;
                  top: 50%;
                  transform: translateY(-50%);
                  width: 40px;
                  height: 40px;
                  background: white;
                  border-radius: 50%;
                  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                  z-index: 10;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  cursor: pointer;
                  transition: all 0.3s ease;
                }

                .testimonial-prev:hover,
                .testimonial-next:hover {
                  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
                  transform: translateY(-50%) scale(1.05);
                }

                .testimonial-prev::after,
                .testimonial-next::after {
                  font-size: 1.5rem;
                  color: currentColor;
                  font-weight: bold;
                }

                @media (max-width: 768px) {
                  .testimonial-prev,
                  .testimonial-next {
                    display: none;
                  }
                }
              `}</style>
        </div>
    </motion.div>
}