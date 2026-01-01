"use client"

import React, { useEffect } from 'react';
import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';
import { toast } from "sonner";
import Onboarding from '@/components/Onboarding';

const OnboardingPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push('/');
      return;
    }

    // No need to check status - just show onboarding if authenticated
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
    return null; // Don't show anything while session loads
  }

  if (status === "unauthenticated") {
    return null; // Will redirect
  }

  return <Onboarding onComplete={handleOnboardingComplete} />;
};

export default OnboardingPage;

