"use client"

import React from 'react';
import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&display=swap"
        rel="stylesheet"
      />
      <div 
        className="absolute inset-0 flex flex-col items-center justify-center px-4 overflow-hidden bg-gradient-animated" 
        style={{ 
          paddingTop: 'max(0px, env(safe-area-inset-top))', 
          paddingBottom: 'max(0px, env(safe-area-inset-bottom))', 
          paddingLeft: 'max(0px, env(safe-area-inset-left))', 
          paddingRight: 'max(0px, env(safe-area-inset-right))'
        }}
      >
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl p-8 md:p-12 max-h-[90vh] overflow-y-auto">
          <div className="mb-8">
            <h1
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-2"
              style={{ fontFamily: 'Merriweather, serif' }}
            >
              Privacy Policy
            </h1>
            <p
              className="text-sm text-gray-500"
              style={{ fontFamily: 'Merriweather, serif' }}
            >
              Last Updated: January 1, 2026
            </p>
          </div>

          <div
            className="max-w-none space-y-6 text-gray-700"
            style={{ fontFamily: 'Merriweather, serif' }}
          >
            <p>
              Welcome to likely.one ("we," "us," or "our"). We are committed to protecting your privacy and ensuring you have a positive experience on our platform. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our matching services.
            </p>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">1. Information We Collect</h2>
              <p className="mb-4">
                We collect information that identifies, relates to, describes, or is capable of being associated with you ("Personal Data").
              </p>

              <h3 className="text-xl font-bold text-gray-800 mt-6 mb-3">A. Information You Provide to Us</h3>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li><strong>Account Registration:</strong> When you register, we collect your name and email address (verified via your university email).</li>
                <li><strong>Profile Information:</strong> To facilitate matching, we collect details including your academic year, major, gender, ethnicity, and Instagram handle.</li>
                <li><strong>User Content:</strong> We collect the photographs you upload to your profile. However, the team at likely.one does not personally view the photographs provided unless it is due to technical issues within the system.</li>
                <li><strong>Preferences & Onboarding:</strong> We collect your answers regarding "vibe" preferences (e.g., aesthetic choices) and your specific matching criteria (e.g., gender and ethnicity preferences).</li>
                <li><strong>Participation Data:</strong> We track your weekly opt-in status to determine your eligibility for the current matching cycle.</li>
              </ul>

              <h3 className="text-xl font-bold text-gray-800 mt-6 mb-3">B. Information Collected Automatically</h3>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li><strong>Service Usage:</strong> We may collect anonymous analytics data regarding your interactions with the site to improve user experience.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">2. How We Use Your Information</h2>
              <p className="mb-4">
                We use your Personal Data for the following business purposes:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li><strong>Algorithmic Matching:</strong> We process your profile data, preferences, and onboarding responses to identify potential matches who share high compatibility scores.</li>
                <li><strong>Visual Compatibility Analysis:</strong> We utilize artificial intelligence (AI) and machine learning technologies to analyze user-uploaded photos. This analysis allows us to assess visual compatibility between profile images to improve match quality.</li>
                <li><strong>Fairness and Drought Prevention:</strong> We analyze match history to ensure fair distribution of matches and to prioritize users who have not matched in recent cycles.</li>
                <li><strong>Communication:</strong> We use your email address to send service notifications, including "Match" and "No Match" results.</li>
                <li><strong>Internal Operations:</strong> We use data to maintain the safety, security, and integrity of our Service (e.g., preventing duplicate matches).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">3. Our Commitment to Fairness</h2>
              <p className="mb-4">
                We are committed to operating a platform free from intentional bias. While we use algorithms to facilitate connections:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li><strong>No Intentional Bias:</strong> We do not program our algorithms to discriminate based on race, religion, or background beyond the specific preferences you explicitly set (e.g., "looking for" criteria).</li>
                <li><strong>Visual Analysis:</strong> Our use of AI for visual compatibility is strictly functional, designed to pair users with similar visual styles or photo qualities, and is not used to publicly rank or display scores.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">4. Data Sharing and Disclosure</h2>
              <p className="mb-4">
                We do not sell your Personal Data. We disclose data only as follows:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li><strong>With Your Match:</strong> If you are matched, we share your Name, Photo, Major, Year, and Instagram handle with your specific match to facilitate connection.</li>
                <li><strong>Service Providers:</strong> We share data with trusted third-party vendors who assist us in operating our Service (e.g., database hosting, email delivery, AI processing). These vendors are contractually obligated to keep your information confidential.</li>
                <li><strong>Legal Requirements:</strong> We may disclose information if required to do so by law or in response to valid requests by public authorities.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">5. Data Retention</h2>
              <p className="mb-4">
                We retain your Personal Data only for as long as necessary to fulfill the purposes for which it was collected, including satisfying any legal, accounting, or reporting requirements. We maintain a history of your past matches to prevent repeat pairings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">6. Your Rights and Choices</h2>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li><strong>Access and Correction:</strong> You may access and update your profile information at any time through your account settings.</li>
                <li><strong>Opt-Out:</strong> Participation in matching is voluntary; you must opt-in weekly to be included.</li>
                <li><strong>Account Deletion:</strong> You may request the deletion of your account. Upon deletion, your active profile data will be removed from our systems.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">7. Contact Us</h2>
              <p className="mb-4">
                If you have questions about this Privacy Policy, please contact us at{' '}
                <a
                  href="mailto:contact@likely.one"
                  className="text-purple-600 hover:text-purple-800 underline font-medium transition-colors duration-200"
                  style={{ fontFamily: 'Merriweather, serif' }}
                >
                  contact@likely.one
                </a>
                .
              </p>
            </section>
          </div>

          <div className="mt-12 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center" style={{ fontFamily: 'Merriweather, serif' }}>
              By continuing, you agree that you are 18+ and agree to our <Link href="/legal/tos" className="underline hover:text-gray-700">Terms of Service</Link> and <Link href="/legal/privacy" className="underline hover:text-gray-700">Privacy Policy</Link>.
            </p>
          </div>
        </div>
      </div>

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
    </>
  );
}

