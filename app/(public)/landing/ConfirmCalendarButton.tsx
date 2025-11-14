'use client';

export function ConfirmCalendarButton() {
    return <div className="fixed bottom-20 right-4 z-[60] md:bottom-20">
        <button
            onClick={() => {
                const calendlySection = document.querySelector('.calendly-container');
                if (calendlySection) {
                    calendlySection.scrollIntoView({ behavior: 'smooth' });
                } else {
                    window.location.hash = '#calendly';
                }
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-700 transition-all text-sm md:text-base md:px-6 md:py-3"
        >
            planifier une réunion
        </button>
    </div>
}