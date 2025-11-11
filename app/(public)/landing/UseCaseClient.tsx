'use client';

import * as motion from 'motion/react-client';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from "swiper/modules";
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import Link from 'next/link';

interface UseCaseClientProps {
    title: React.ReactNode; // server-rendered h2
}

export interface UseCaseClientDesktopMobileProps {
    desktop: UseCaseClientProps,
    mobile: UseCaseClientProps
}

export default function UseCaseClient({ desktop, mobile }: UseCaseClientDesktopMobileProps) {
    return (
        <motion.div className="mt-32" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} >
            {/* Section desktop uniquement */}
            <div className="hidden md:block">
                {desktop.title}
                <div className="flex flex-col items-center">
                    <div className="relative w-full max-w-[950px] mx-auto">
                        {/* Flèches Swiper custom hors cadre */}
                        <div className="absolute -left-10 top-1/2 z-10 hidden md:block">
                            <div className="swiper-button-prev usecases-prev custom-swiper-arrow left-0 text-blue-600 hover:text-blue-800 transition-colors" />
                        </div>
                        <div className="absolute -right-10 top-1/2 z-10 hidden md:block">
                            <div className="swiper-button-next usecases-prev custom-swiper-arrow right-0 text-blue-600 hover:text-blue-800 transition-colors" />
                        </div>
                        <div className="bg-white rounded-2xl shadow-xl border border-blue-100 px-0 md:px-4 py-8 md:py-10 flex flex-col md:flex-row items-stretch gap-0 md:gap-8">
                            <Swiper modules={[Navigation, Pagination]} navigation={{ prevEl: '.usecases-prev', nextEl: '.usecases-next', }} pagination={{ clickable: true }} spaceBetween={0} slidesPerView={1} className="flex-1" style={{ minWidth: 0 }} >
                                <SwiperSlide>
                                    <div className="w-full flex flex-col">
                                        <h3 className="text-2xl md:text-3xl font-bold mb-6 text-blue-700 text-center"> Automatisez vos relances et gagnez du temps </h3>
                                        <div className="flex flex-col md:flex-row items-center md:items-stretch">
                                            {/* Zone texte à gauche */}
                                            <div className="w-full md:w-1/3 flex flex-col justify-center px-6 md:pl-8 md:pr-6 py-4">
                                                <p className="text-gray-700 mb-6 text-base md:text-lg"> Payment Flow vous permet de centraliser toutes vos créances, d’automatiser vos relances et de suivre vos paiements en temps réel. Gagnez en sérénité et concentrez-vous sur l’essentiel : votre activité. </p>
                                                {/* Avis testeuse */}
                                                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg shadow-sm flex flex-col gap-2">
                                                    <span className="italic text-blue-900 text-sm md:text-base">“J’ai testé Payment Flow pendant 1 mois et j’ai réduit mes impayés de moitié, sans stress. L’outil est intuitif et le support au top !”</span>
                                                    <span className="font-semibold text-blue-700">— Claire, testeuse PME</span>
                                                </div>
                                                {/* Call-to-action */}
                                                <button className="mt-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow transition-all text-lg w-fit" >
                                                    <Link href={"/signup"}>
                                                        Essayez gratuitement Payment Flow
                                                    </Link>
                                                </button>
                                            </div>
                                            {/* Image à droite */}
                                            <div className="w-full md:w-2/3 flex items-center justify-center p-2 md:p-4">
                                                <img src="/images/1.png" alt="Présentation Payment Flow 1" className="w-full object-contain rounded-xl" style={{ maxHeight: 540, background: '#fff' }} />
                                            </div>
                                        </div>
                                    </div>
                                </SwiperSlide>
                                <SwiperSlide>
                                    <div className="w-full flex flex-col">
                                        <h3 className="text-2xl md:text-3xl font-bold mb-6 text-blue-700 text-center"> Visualisez l’impact de vos actions </h3>
                                        <div className="flex flex-col md:flex-row items-center md:items-stretch">
                                            {/* Zone texte à gauche */}
                                            <div className="w-full md:w-1/3 flex flex-col justify-center px-6 md:pl-8 md:pr-6 py-4">
                                                <p className="text-gray-700 mb-6 text-base md:text-lg"> Suivez l’évolution de votre DSO, analysez vos résultats et partagez des rapports clairs à vos équipes ou partenaires. Payment Flow, c’est la maîtrise de votre trésorerie en un coup d’œil. </p>
                                                {/* Avis testeuse */}
                                                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg shadow-sm flex flex-col gap-2">
                                                    <span className="italic text-blue-900 text-sm md:text-base">“La visualisation des résultats est super claire, et j’ai enfin une vue d’ensemble sur mes paiements. Je recommande à tous les entrepreneurs !”</span>
                                                    <span className="font-semibold text-blue-700">— Sophie, testeuse TPE</span>
                                                </div>
                                                {/* Call-to-action */}
                                                <button className="mt-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow transition-all text-lg w-fit" >
                                                    <Link href={"/signup"}> Essayez gratuitement Payment Flow
                                                    </Link>
                                                </button>
                                            </div>
                                            {/* Image à droite */}
                                            <div className="w-full md:w-2/3 flex items-center justify-center p-2 md:p-4">
                                                <img src="/images/2.png" alt="Présentation Payment Flow 2" className="w-full object-contain rounded-xl" style={{ maxHeight: 540, background: '#fff' }} />
                                            </div>
                                        </div>
                                    </div>
                                </SwiperSlide>
                                <SwiperSlide>
                                    <div className="w-full flex flex-col items-center justify-center min-h-[350px] py-8">
                                        <h3 className="text-2xl md:text-3xl font-bold mb-6 text-blue-700 text-center"> Essayez Payment Flow gratuitement pendant 30 jours ! </h3>
                                        <div className="flex flex-col md:flex-row items-center md:items-stretch w-full max-w-3xl mx-auto">
                                            {/* Zone texte à gauche */}
                                            <div className="w-full md:w-1/2 flex flex-col justify-center px-6 py-4 items-center md:items-start">
                                                <p className="text-gray-700 mb-6 text-base md:text-lg text-center md:text-left"> Profitez de toutes les fonctionnalités de Payment Flow sans engagement et sans carte bancaire. Testez la gestion automatisée de vos créances, le reporting en temps réel et l’accompagnement personnalisé : 0 risque, 100% efficacité. </p>
                                                <ul className="mb-6 text-blue-700 text-sm md:text-base flex flex-col gap-1">
                                                    <li className="flex items-center gap-2">
                                                        <span className="inline-block w-4 h-4">
                                                            <svg xmlns='http://www.w3.org/2000/svg' className='text-blue-600' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' /></svg>
                                                        </span>30 jours d’accès complet
                                                    </li>
                                                    <li className="flex items-center gap-2">
                                                        <span className="inline-block w-4 h-4">
                                                            <svg xmlns='http://www.w3.org/2000/svg' className='text-blue-600' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                                                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                                                            </svg>
                                                        </span>Sans carte bancaire
                                                    </li>
                                                    <li className="flex items-center gap-2">
                                                        <span className="inline-block w-4 h-4">
                                                            <svg xmlns='http://www.w3.org/2000/svg' className='text-blue-600' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                                                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                                                            </svg>
                                                        </span>Sans engagement
                                                    </li>
                                                </ul>
                                                <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow transition-all text-lg w-fit" >
                                                    <Link href={"/signup"}>
                                                        Commencer mon essai gratuit
                                                    </Link>
                                                </button>
                                            </div>
                                            {/* Logos clients et avis certifiés */}
                                            <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-6 gap-8">
                                                <div className="flex flex-row items-center justify-center gap-8 mb-4">
                                                    <div className="flex flex-col items-center">
                                                        <img src="/images/image-de-marque.webp" alt="Logo Image de Marque" className="h-16 w-auto mb-2 rounded shadow-md bg-white p-2" />
                                                        <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded shadow text-xs md:text-sm max-w-[180px]">
                                                            <span className="italic">“Grâce à Payment Flow, nous avons récupéré 98% de nos créances en 2 mois !”</span>
                                                            <br />
                                                            — Julie, Dir. admin. Image de Marque
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-center">
                                                        <img src="/images/ouestelio.png" alt="Logo Ouestelio" className="h-16 w-auto mb-2 rounded shadow-md bg-white p-2" />
                                                        <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded shadow text-xs md:text-sm max-w-[180px]">
                                                            <span className="italic">“La relance automatique a transformé notre trésorerie, c’est bluffant.”</span>
                                                            <br />— Marc, Gérant Ouestelio
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* (Arrow removed to preserve layout; spacing retained) */}
                                                <div className="w-full flex justify-center mt-4">
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </SwiperSlide>
                            </Swiper>
                            {/* Pagination Swiper en-dessous */}
                            <div className="flex justify-center mt-6">
                                <div className="swiper-pagination" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Section mobile/tablette uniquement */}
            <div className="block md:hidden">
                {mobile.title}
                <div className="flex flex-col items-center">
                    <div className="w-full max-w-md mx-auto">
                        <div className="relative bg-white rounded-xl shadow-lg border border-blue-100 px-2 py-4 mt-8">
                            <Swiper modules={[Navigation, Pagination]} pagination={{ clickable: true }} spaceBetween={0} slidesPerView={1} className="w-full" >
                                {/* Slide 1 */}
                                <SwiperSlide>
                                    <div className="flex flex-col items-center">
                                        <h3 className="text-xl font-bold mb-4 text-blue-700 text-center">Automatisez vos relances et gagnez du temps</h3>
                                        <img src="/images/1.png" alt="Présentation Payment Flow 1" className="w-full max-w-xs object-contain rounded-xl mb-4" style={{ background: '#fff' }} />
                                        <p className="text-gray-700 mb-4 text-base text-center px-2"> Payment Flow vous permet de centraliser toutes vos créances, d’automatiser vos relances et de suivre vos paiements en temps réel. Gagnez en sérénité et concentrez-vous sur l’essentiel : votre activité. </p>
                                        <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-lg shadow-sm flex flex-col gap-2 mb-4">
                                            <span className="italic text-blue-900 text-sm">“J’ai testé Payment Flow pendant 1 mois et j’ai réduit mes impayés de moitié, sans stress. L’outil est intuitif et le support au top !”</span>
                                            <span className="font-semibold text-blue-700">— Claire, testeuse PME</span>
                                        </div>
                                        <button className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow transition-all text-base w-fit" > <Link href={"/signup"}> Essayez gratuitement Payment Flow </Link>
                                        </button>
                                    </div> </SwiperSlide> {/* Slide 2 */}
                                <SwiperSlide>
                                    <div className="flex flex-col items-center">
                                        <h3 className="text-xl font-bold mb-4 text-blue-700 text-center">Visualisez l’impact de vos actions</h3>
                                        <img src="/images/2.png" alt="Présentation Payment Flow 2" className="w-full max-w-xs object-contain rounded-xl mb-4" style={{ background: '#fff' }} />
                                        <p className="text-gray-700 mb-4 text-base text-center px-2"> Suivez l’évolution de votre DSO, analysez vos résultats et partagez des rapports clairs à vos équipes ou partenaires. Payment Flow, c’est la maîtrise de votre trésorerie en un coup d’œil. </p>
                                        <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-lg shadow-sm flex flex-col gap-2 mb-4">
                                            <span className="italic text-blue-900 text-sm">“La visualisation des résultats est super claire, et j’ai enfin une vue d’ensemble sur mes paiements. Je recommande à tous les entrepreneurs !”</span>
                                            <span className="font-semibold text-blue-700">— Sophie, testeuse TPE</span> </div> <button className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow transition-all text-base w-fit" >
                                            <Link href={"/signup"}> Essayez gratuitement Payment Flow </Link> </button> </div> </SwiperSlide> {/* Slide 3 */} <SwiperSlide>
                                    <div className="flex flex-col items-center">
                                        <h3 className="text-xl font-bold mb-4 text-blue-700 text-center">Essayez Payment Flow gratuitement pendant 30 jours !</h3>
                                        <ul className="mb-4 text-blue-700 text-sm flex flex-col gap-1 px-2"> <li className="flex items-center gap-2"><span className="inline-block w-4 h-4">
                                            <svg xmlns='http://www.w3.org/2000/svg' className='text-blue-600' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                                            </svg>
                                        </span>30 jours d’accès complet</li> <li className="flex items-center gap-2"><span className="inline-block w-4 h-4"><svg xmlns='http://www.w3.org/2000/svg' className='text-blue-600' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' /></svg></span>Sans carte bancaire</li> <li className="flex items-center gap-2"><span className="inline-block w-4 h-4">
                                                <svg xmlns='http://www.w3.org/2000/svg' className='text-blue-600' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' /></svg>
                                            </span>Sans engagement</li> </ul> {/* Logos clients et avis certifiés */} <div className="flex flex-col items-center gap-4 w-full">
                                            <div className="flex flex-col items-center">
                                                <img src="/images/image-de-marque.webp" alt="Logo Image de Marque" className="h-16 w-auto mb-2 rounded shadow-md bg-white p-2" />
                                                <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded shadow text-xs max-w-[180px]"> <span className="italic">“Grâce à Payment Flow, nous avons récupéré 98% de nos créances en 2 mois !”</span>
                                                    <br />— Julie, Dir. admin. Image de Marque
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-center">
                                                <img src="/images/ouestelio.png" alt="Logo Ouestelio" className="h-16 w-auto mb-2 rounded shadow-md bg-white p-2" />
                                                <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded shadow text-xs max-w-[180px]"> <span className="italic">“La relance automatique a transformé notre trésorerie, c’est bluffant.”</span>
                                                    <br />— Marc, Gérant Ouestelio
                                                </div>
                                            </div>
                                        </div>
                                        <button className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow transition-all text-base w-fit mb-4" >
                                            <Link href={"/signup"}> Commencer mon essai gratuit </Link>
                                        </button>
                                        {/* Pagination Swiper mobile - Slide 3 */}
                                        <div className="flex justify-center mt-6">
                                            <div />
                                        </div>
                                        {/* Pagination Swiper mobile - Slide 3 */}
                                        <div className="flex justify-center mt-6">
                                            <div className="swiper-pagination" />
                                        </div>
                                    </div>
                                </SwiperSlide>
                            </Swiper>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
