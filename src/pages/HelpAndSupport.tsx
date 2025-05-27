import React, { useEffect, useState } from "react";
import Header from "../components/AppHeader";
import Footer from "../components/Footer";
import HeroSection from "../components/help_and_supports/HeroSection";
import FaqSection from "../components/help_and_supports/FaqSection";
import SupportOptions from "../components/help_and_supports/SupportOptions";
import KnowledgeBase from "../components/help_and_supports/KnowledgeBase";
import ContactForm from "../components/help_and_supports/ContactForm";
import { checkAuth, supabase } from "../lib/supabase";
import { User } from "@supabase/supabase-js";
import useChatlingScript from "../lib/useChatling";

const HelpAndSupport: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const initAuth = async () => {
      try {
        const session = await checkAuth();
        setUser(session?.user ?? null);
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription?.unsubscribe();
  }, []);
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {user && <Header user={user} />}
      <main className="flex-grow">
        <HeroSection />
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <FaqSection />
              <KnowledgeBase />
            </div>
            <div className="lg:col-span-1">
              <SupportOptions />
              <ContactForm />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HelpAndSupport;
