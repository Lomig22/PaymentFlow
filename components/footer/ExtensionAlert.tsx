'use client';
import { useEffect, useState } from "react";

export function ExtensionAlert() {

    // --- Détection extensions/suspicious scripts ---
    const [extensionAlert, setExtensionAlert] = useState<string | null>(null);
    useEffect(() => {
        // Liste de patterns connus pour scripts d'extensions courantes (adblock, capture, etc)
        const suspiciousPatterns = [
            'chrome-extension://',
            'adblock',
            'web-capture',
            'cookie-banner',
            'Switch-',
            'polyfill.js',
            'feature.js',
            'lib/web-capture-bootstrap.js',
        ];
        // Liste tous les scripts présents
        const scripts = Array.from(document.getElementsByTagName('script'));
        const found = scripts.find(script => {
            const src = script.src || '';
            return suspiciousPatterns.some(pattern => src.includes(pattern));
        });
        if (found) {
            setExtensionAlert('Attention : Des extensions ou scripts tiers sont détectés sur cette page. Cela peut entraîner des bugs ou une surconsommation mémoire. Essayez de désactiver vos extensions ou d\'utiliser la navigation privée.');
        }
    }, []);
    return <>
        {/* Alerte extensions/suspicious scripts */}
        {extensionAlert && (
            <div className="mt-4 p-3 bg-yellow-100 text-yellow-800 rounded border border-yellow-300">
                {extensionAlert}
            </div>
        )}
    </>;
}