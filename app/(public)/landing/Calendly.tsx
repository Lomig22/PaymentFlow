'use client';

import { InlineWidget } from "react-calendly";

export function Calendly() {
    return <InlineWidget
        url="https://calendly.com/paymentfloww/30min"
        styles={{
            height: "100%",
            width: "100%",
            margin: "0",
            padding: "0",
        }}
    />
}