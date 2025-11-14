'use client';
import { useEffect, useRef, useState } from "react";
import ContactModal from "../../pages/landing/ContactModal";

export function FooterContactModal() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);


    const [showContactModal, setShowContactModal] = useState(false);
    const showContactModalRef = useRef(showContactModal);

    const isMobileMenuOpenRef = useRef(isMobileMenuOpen);

    useEffect(() => {
        isMobileMenuOpenRef.current = isMobileMenuOpen;
    }, [isMobileMenuOpen]);

    useEffect(() => {
        showContactModalRef.current = showContactModal;
    }, [showContactModal]);

    // Add ESC key handler
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                // Close contact modal first if open
                if (showContactModalRef.current) {
                    setShowContactModal(false);
                }
                // Then close mobile menu if open
                else if (isMobileMenuOpenRef.current) {
                    setIsMobileMenuOpen(false);
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);
    return <>

        <li>
            <button
                onClick={() => setShowContactModal(true)}
                className="text-gray-500 hover:text-gray-700"
            >
                Contactez-nous
            </button>
        </li>
        {showContactModal && (
            <ContactModal onClose={() => setShowContactModal(false)} />
        )}
    </>;
}