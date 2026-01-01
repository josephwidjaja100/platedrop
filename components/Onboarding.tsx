"use client"

import React, { useEffect } from 'react';
import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';
import { toast } from "sonner";
import Onboarding from '@/components/Onboarding';

const OnboardingPage = () => {
  const { data: session, status } = useSession();
  const useRouter1 = useRouter();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push('/');
      return;
    }
  }, [status, session, router]);

  const handleOnboardingComplete = async (selections: string[]) => {
    console.log('Handling onboarding complete with selections:', selections);
    
    try {
      const response = await fetch("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          onboardingCompleted: true,
          adjectivePreferences: selections
        }),
      });

      if (!response.ok) {
        throw new Error("failed to save onboarding data");
      }

      const result = await response.json();
      console.log('Onboarding saved successfully:', result);
      
      toast.success("preferences saved!");
      
      // Use window.location to force a full page reload and ensure state is fresh
      window.location.href = '/profile';
    } catch (error) {
      console.error("error saving onboarding:", error);
      toast.error("failed to save preferences");
    }
  };

  if (status === "loading") {
    return null; 
  }

  if (status === "unauthenticated") {
    return null; 
  }

  return (
    <>
      {/* 1. Add the font used in other pages */}
      <link 
        href="https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&display=swap" 
        rel="stylesheet" 
      />

      {/* 2. Add the styles manually here */}
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .bg-gradient-animated {
          background: linear-gradient(135deg, #dbeafe, #e9d5ff, #fae8ff, #ddd6fe, #bfdbfe);
          background-size: 400% 400%;
          animation: gradientShift 15s ease infinite;
        }
      `}</style>

      {/* 3. Wrap the Onboarding component in the gradient div */}
      <div 
        className="fixed inset-0 bg-gradient-animated overflow-y-auto"
        style={{ fontFamily: 'Merriweather, serif' }}
      >
        <div className="min-h-full w-full flex flex-col items-center justify-center p-4">
          <Onboarding onComplete={handleOnboardingComplete} />
        </div>
      </div>
    </>
  );
};

export default OnboardingPage;
