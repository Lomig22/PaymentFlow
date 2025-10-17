'use client';
import React, { useState } from 'react';
import PricingPage from './PricingPage';

export default function Page() {
  const [showContact, setShowContact] = useState(false);
  const [defaultSubject, setDefaultSubject] = useState('');

  return (
    <PricingPage
      setShowContact={setShowContact}
      setDefaultSubject={setDefaultSubject}
    />
  );
}
