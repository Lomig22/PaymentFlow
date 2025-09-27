"use client"; // mark this file as client-only

import { useEffect } from "react";

export default function StorylaneDemoEmbed() {
    useEffect(() => {
        if (!document.querySelector('script[src="https://js.storylane.io/js/v2/storylane.js"]')) {
            const script = document.createElement('script');
            script.src = "https://js.storylane.io/js/v2/storylane.js";
            script.async = true;
            document.body.appendChild(script);
        }
    }, []);

    return (
        <div className="sl-embed" style={{ position: 'relative', paddingBottom: 'calc(50.42% + 25px)', width: '100%', height: 0 }}>
            <iframe
                loading="lazy"
                className="sl-demo"
                src="https://app.storylane.io/demo/otrw27xywyf3?embed=inline"
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
            />
        </div>
    );
}
