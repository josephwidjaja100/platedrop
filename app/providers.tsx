"use client"

import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { Analytics } from "@vercel/analytics/next"

export default function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}<Analytics /></SessionProvider>;
}
