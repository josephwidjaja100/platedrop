"use client"

import React from 'react';
import Link from 'next/link';

export default function TermsOfService() {
  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&display=swap"
        rel="stylesheet"
      />
      <div className="min-h-screen bg-gradient-animated flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl p-8 md:p-12 max-h-[90vh] overflow-y-auto">
          <div className="mb-8">
            <h1
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-2"
              style={{ fontFamily: 'Merriweather, serif' }}
            >
              Terms and Conditions
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
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">1. Acceptance of Terms</h2>
              <p className="mb-4">
                By creating an account or using likely.one (the "Service"), you agree to be bound by these Terms and Conditions. If you do not agree to these Terms, you may not access or use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">2. Eligibility</h2>
              <p className="mb-4">
                You must be at least 18 years of age and a currently enrolled university student to use the Service. By using the Service, you represent and warrant that you meet these eligibility requirements. Failure to comply will result in account deactivation.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">3. Description of Service</h2>
              <p className="mb-4">
                likely.one provides a periodic matching service.
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li><strong>Matching Cycle:</strong> Matches are generated on a periodic basis (e.g., weekly). Opting into a cycle does not guarantee a match.</li>
                <li><strong>Algorithmic Matching:</strong> You acknowledge and agree that we use proprietary algorithms, including artificial intelligence and visual analysis tools, to select matches.</li>
                <li><strong>Visual Compatibility:</strong> By uploading photos to the Service, you grant us permission to process your images using AI technologies for the purpose of determining visual compatibility. You understand that this is an automated process used to enhance match relevance.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">4. User Conduct and Content</h2>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li><strong>Accuracy:</strong> You agree to provide accurate, current, and complete information during the registration and onboarding process.</li>
                <li><strong>Prohibited Conduct:</strong> You agree not to harass, intimidate, or threaten other users. We reserve the right to suspend or terminate your account for any behavior that violates these Terms or community standards.</li>
                <li><strong>Content Rights:</strong> You retain ownership of the photos you upload. However, you grant likely.one a non-exclusive, royalty-free license to use, display, and process your content solely for the purpose of operating the Service.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">5. Disclaimers</h2>
              <p className="mb-4">
                By usage of this service, you agree to comply with the following disclaimers:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li><strong>No Guarantee of Compatibility:</strong> We make no warranties regarding the compatibility of users or the success of any match. Interaction with other users is at your sole risk.</li>
                <li><strong>No Liability for Emotional Well-being:</strong> You acknowledge that dating and social interactions can be emotionally challenging. likely.one is not responsible for any emotional distress, mental health issues, anxiety, depression, or other psychological impacts resulting from: (i) the use of the app; (ii) the nature of your matches; (iii) the lack of matches; or (iv) any interactions with other users.</li>
                <li><strong>No Responsibility for Off-Site Conduct:</strong> We do not conduct criminal background checks or verify the character of users. We are not responsible for the conduct of any user on or off the Service. You are solely responsible for your interactions with other users.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">6. Limitation of Liability</h2>
              <p className="mb-4">
                To the fullest extent permitted by law, likely.one, its affiliates, officers, employees, and agents shall NOT be liable for any:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li><strong>Indirect or Consequential Damages:</strong> Including but not limited to damages for loss of profits, goodwill, use, data, or other intangible losses.</li>
                <li><strong>Personal Injury or Emotional Distress:</strong> Any bodily injury, emotional distress, or mental suffering arising out of or in any way connected with your use of the Service or your interactions with other users.</li>
                <li><strong>Third-Party Conduct:</strong> Any offensive, defamatory, or illegal conduct of any third party or user.</li>
                <li><strong>Technical Failures:</strong> Any errors, mistakes, or inaccuracies of content, or technical issues that prevent the Service from operating as intended.</li>
              </ul>
              <p className="mb-4 font-bold">
                YOUR USE OF THE SERVICE IS AT YOUR SOLE RISK. WE PROVIDE THE SERVICE ON AN "AS IS" AND "AS AVAILABLE" BASIS.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">7. Changes to Terms</h2>
              <p className="mb-4">
                We reserve the right to modify these Terms at any time. We will notify you of any changes by posting the new Terms on this page. Your continued use of the Service after any such change constitutes your acceptance of the new Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">8. Contact Us</h2>
              <p className="mb-4">
                If you have questions about these Terms and Conditions, please contact us at{' '}
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

