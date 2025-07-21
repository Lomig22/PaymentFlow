import React from "react";
import { FaQuoteLeft, FaQuoteRight, FaDownload, FaLinkedin, FaFacebook, FaTwitter, FaWhatsapp, FaEnvelope, FaChartBar, FaPlay, FaCheckCircle } from "react-icons/fa";

export const TestimonialBox = ({ quote, author, gain }: { quote: string; author: string; gain?: string }) => (
  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-6 rounded-lg shadow-sm">
    <div className="flex items-start mb-2">
      <FaQuoteLeft className="text-blue-400 mr-2" />
      <span className="italic text-gray-800 flex-1">{quote}</span>
      <FaQuoteRight className="text-blue-400 ml-2" />
    </div>
    <div className="text-sm text-blue-700 font-semibold mt-2">{author} {gain && <span className="ml-2 text-green-700">{gain}</span>}</div>
  </div>
);

export const CaseStudyBlock = ({ title, children, result }: { title: string; children: React.ReactNode; result?: string }) => (
  <div className="bg-white border-l-4 border-green-500 p-4 my-6 rounded-lg shadow">
    <div className="font-bold text-green-700 mb-1">{title}</div>
    <div className="text-gray-700 text-sm mb-2">{children}</div>
    {result && <div className="text-green-800 font-semibold mt-2">{result}</div>}
  </div>
);

export const InfographicBlock = ({ src, alt, caption }: { src: string; alt: string; caption?: string }) => (
  <div className="my-6 flex flex-col items-center">
    <img src={src} alt={alt} className="max-w-full h-auto rounded shadow-md" />
    {caption && <div className="text-xs text-gray-500 mt-2">{caption}</div>}
  </div>
);

export const ChecklistDownload = ({ url, label }: { url: string; label: string }) => (
  <a href={url} download className="flex items-center bg-green-100 border border-green-400 text-green-800 px-4 py-2 rounded-md my-4 hover:bg-green-200 transition-colors">
    <FaDownload className="mr-2" /> {label}
  </a>
);

export const ShareButtons = ({ url, title }: { url: string; title: string }) => (
  <div className="flex flex-wrap gap-3 my-4">
    <a href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:text-blue-900"><FaLinkedin size={22} /></a>
    <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:text-blue-900"><FaFacebook size={22} /></a>
    <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:text-blue-900"><FaTwitter size={22} /></a>
    <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(title + ' ' + url)}`} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-800"><FaWhatsapp size={22} /></a>
    <a href={`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`} className="text-gray-700 hover:text-gray-900"><FaEnvelope size={22} /></a>
  </div>
);

export const FAQAccordion = ({ items }: { items: { question: string; answer: string }[] }) => {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);
  return (
    <div className="my-8">
      {items.map((item, idx) => (
        <div key={idx} className="border-b border-gray-200">
          <button className="w-full text-left py-3 flex justify-between items-center font-semibold text-blue-700 hover:text-blue-900 focus:outline-none" onClick={() => setOpenIndex(openIndex === idx ? null : idx)}>
            {item.question}
            <span>{openIndex === idx ? '-' : '+'}</span>
          </button>
          {openIndex === idx && <div className="py-2 text-gray-700 text-sm">{item.answer}</div>}
        </div>
      ))}
    </div>
  );
};

export const DSOEmbed = ({ url }: { url: string }) => (
  <div className="my-8 flex flex-col items-center">
    <iframe src={url} title="Simulateur DSO" className="w-full max-w-xl h-72 border rounded shadow" allow="clipboard-write" />
    <div className="text-xs text-gray-500 mt-2">Simulez votre DSO gratuitement</div>
  </div>
);

export const CTA = ({ label, href, variant = "primary" }: { label: string; href: string; variant?: "primary" | "secondary" }) => (
  <a href={href} className={`inline-block px-6 py-3 rounded-md font-bold transition-colors my-4 ${variant === "primary" ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-100 text-blue-700 border border-blue-300 hover:bg-blue-50"}`}>{label}</a>
);

export const AnimatedGif = ({ src, alt, caption }: { src: string; alt: string; caption?: string }) => (
  <div className="my-6 flex flex-col items-center">
    <img src={src} alt={alt} className="max-w-full h-auto rounded shadow-md" />
    {caption && <div className="text-xs text-gray-500 mt-2">{caption}</div>}
  </div>
);

export const VideoEmbed = ({ src, title }: { src: string; title: string }) => (
  <div className="my-8 flex flex-col items-center">
    <video controls className="max-w-full rounded shadow-lg">
      <source src={src} type="video/mp4" />
      Votre navigateur ne supporte pas la lecture vidéo.
    </video>
    <div className="text-xs text-gray-500 mt-2">{title}</div>
  </div>
);
