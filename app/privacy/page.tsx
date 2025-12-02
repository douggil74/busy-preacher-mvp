import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
        <div className="mb-6">
          <Link href="/legal" className="text-blue-500 hover:text-blue-600 text-sm flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Legal
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">Last updated: December 1, 2025</p>

        <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-gray-700 dark:text-gray-300">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">1. Introduction</h2>
            <p>The Busy Christian App ("App," "we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and website.</p>
            <p>Please read this Privacy Policy carefully. By using the App, you agree to the collection and use of information in accordance with this policy.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">2. Information We Collect</h2>

            <h3 className="font-semibold mt-4 mb-2">Personal Information You Provide</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Account Information:</strong> Email address, name, phone number (optional)</li>
              <li><strong>Profile Information:</strong> Study preferences, notification settings, location (city/state for weather features)</li>
              <li><strong>Payment Information:</strong> Processed securely through Square/Apple; we do not store payment card details</li>
              <li><strong>User Content:</strong> Prayer requests, pastoral guidance conversations, study notes</li>
            </ul>

            <h3 className="font-semibold mt-4 mb-2">Information Collected Automatically</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Device Information:</strong> Device type, operating system, unique device identifiers</li>
              <li><strong>Usage Data:</strong> Features accessed, time spent, interaction patterns</li>
              <li><strong>Log Data:</strong> IP address, browser type, access times (collected during pastoral guidance for safety purposes)</li>
            </ul>

            <h3 className="font-semibold mt-4 mb-2">Sensitive Information</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Health-Related Information:</strong> Prayer requests may contain health information you choose to share</li>
              <li><strong>Crisis Information:</strong> Our system monitors conversations for safety keywords to provide appropriate resources</li>
              <li><strong>Location Data:</strong> City and state (user-provided) for weather personalization; we do not track GPS location</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">3. How We Use Your Information</h2>

            <h3 className="font-semibold mt-4 mb-2">To Provide Services</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Deliver personalized devotional content and Bible study features</li>
              <li>Enable AI-assisted pastoral guidance conversations</li>
              <li>Facilitate community prayer features</li>
              <li>Display weather-based visual themes</li>
            </ul>

            <h3 className="font-semibold mt-4 mb-2">For Safety and Compliance</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Monitor for crisis situations to provide emergency resources (988 Suicide & Crisis Lifeline)</li>
              <li>Comply with mandatory reporting laws for suspected child abuse (Louisiana Children's Code Article 609)</li>
              <li>Respond to legal requests and prevent harm</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">4. Third-Party Services</h2>
            <p>We share information with the following service providers:</p>

            <h3 className="font-semibold mt-4 mb-2">AI Services</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Anthropic (Claude):</strong> Powers pastoral guidance conversations</li>
              <li><strong>OpenAI:</strong> Provides embeddings for sermon search and supplementary AI features</li>
            </ul>
            <p className="text-sm mt-2">These services process your questions to generate responses. Conversations may be used to improve AI safety but are not used for advertising.</p>

            <h3 className="font-semibold mt-4 mb-2">Infrastructure Services</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Firebase (Google):</strong> Authentication, data storage, push notifications</li>
              <li><strong>Supabase:</strong> Sermon embeddings, conversation storage</li>
              <li><strong>Vercel:</strong> Website hosting</li>
            </ul>

            <h3 className="font-semibold mt-4 mb-2">Payment Processing</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Square:</strong> Subscription payments (web)</li>
              <li><strong>Apple:</strong> In-app purchases (iOS)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">5. Data Retention</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Account Data:</strong> Retained while your account is active; deleted within 30 days of account deletion request</li>
              <li><strong>Conversation History:</strong> Retained for 12 months for service improvement, then anonymized</li>
              <li><strong>Crisis-Related Data:</strong> May be retained longer for safety and legal compliance purposes</li>
              <li><strong>Payment Records:</strong> Retained as required by tax and financial regulations (typically 7 years)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">6. Your Rights</h2>

            <h3 className="font-semibold mt-4 mb-2">All Users</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Update inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your account and associated data</li>
              <li><strong>Data Portability:</strong> Receive your data in a common format</li>
            </ul>

            <h3 className="font-semibold mt-4 mb-2">California Residents (CCPA/CPRA)</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Right to know what personal information is collected</li>
              <li>Right to delete personal information</li>
              <li>Right to opt-out of sale/sharing (we do not sell your data)</li>
              <li>Right to limit use of sensitive personal information</li>
              <li>Right to non-discrimination for exercising your rights</li>
            </ul>

            <p className="mt-4">To exercise these rights, contact: <a href="mailto:developer@ilovecornerstone.com" className="text-blue-500 hover:underline">developer@ilovecornerstone.com</a></p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">7. Children's Privacy</h2>
            <p>The App is not intended for children under 13. We do not knowingly collect personal information from children under 13. If we discover we have collected such information, we will delete it promptly.</p>
            <p>Minors aged 13-17 may use the App with parental consent. If a minor reports abuse or crisis situations, we may be legally required to report to appropriate authorities.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">8. Security</h2>
            <p>We implement industry-standard security measures including:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Encryption in transit (TLS/SSL)</li>
              <li>Encryption at rest for sensitive data</li>
              <li>Secure authentication through Firebase</li>
              <li>Regular security assessments</li>
            </ul>
            <p className="mt-2">However, no method of transmission or storage is 100% secure. We cannot guarantee absolute security.</p>
          </section>

          <section className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
            <h2 className="text-xl font-semibold text-amber-800 dark:text-amber-400 mb-3">9. Crisis Detection and Response</h2>
            <p>Our App includes safety features that monitor pastoral guidance conversations for crisis keywords (suicide, self-harm, abuse). When detected:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>You will see emergency resources (988 Suicide & Crisis Lifeline)</li>
              <li>Pastoral staff may be notified to provide support</li>
              <li>For minors reporting abuse, we comply with mandatory reporting laws</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">10. Push Notifications</h2>
            <p>We may send push notifications for:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Prayer request updates</li>
              <li>Study reminders</li>
              <li>Devotional content</li>
            </ul>
            <p className="mt-2">You can disable notifications in your device settings at any time.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">11. Changes to This Policy</h2>
            <p>We may update this Privacy Policy periodically. We will notify you of significant changes via email or in-app notification. Continued use after changes constitutes acceptance.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">12. Contact Us</h2>
            <p>Questions about this Privacy Policy:</p>
            <p>Email: <a href="mailto:developer@ilovecornerstone.com" className="text-blue-500 hover:underline">developer@ilovecornerstone.com</a></p>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              The Busy Christian App is a ministry of Cornerstone Church, Mandeville, Louisiana.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
