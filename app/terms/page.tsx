'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <div className="sticky top-0 z-20 backdrop-blur-md" style={{ backgroundColor: 'rgba(var(--card-bg-rgb), 0.9)', borderBottom: '1px solid var(--card-border)' }}>
        <div className="max-w-3xl mx-auto px-4 md:pl-52 py-3">
          <div className="flex items-center gap-3">
            <Link href="/legal" className="p-2 rounded-lg hover:bg-white/10 transition-colors">
              <ArrowLeft className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
            </Link>
            <div>
              <h1 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Terms of Service</h1>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Last updated: December 1, 2025</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="rounded-xl p-6 md:p-8" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
          <div className="prose prose-sm max-w-none space-y-6" style={{ color: 'var(--text-secondary)' }}>
            <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              PLEASE READ THESE TERMS CAREFULLY BEFORE USING THE APP.
            </p>

            <section>
              <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>1. Acceptance of Terms</h2>
              <p>By accessing or using The Busy Christian App ("App"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree, do not use the App.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>2. Description of Service</h2>
              <p>The App provides:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Daily devotional content and Bible study tools</li>
                <li>AI-assisted pastoral guidance conversations</li>
                <li>Community prayer features</li>
                <li>Sermon library and study resources</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>3. Account Registration</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>You must provide accurate information when creating an account.</li>
                <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
                <li>You must be at least 13 years old to use the App. Users under 18 should have parental consent.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>4. Subscription and Payments</h2>
              <h3 className="font-semibold mt-4 mb-2" style={{ color: 'var(--text-primary)' }}>Pricing</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Monthly: $3.99/month</li>
                <li>Annual: $35.88/year ($2.99/month equivalent)</li>
                <li>New users receive a 7-day free trial</li>
              </ul>
              <h3 className="font-semibold mt-4 mb-2" style={{ color: 'var(--text-primary)' }}>Billing</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Subscriptions auto-renew unless cancelled</li>
                <li>Cancel anytime through your account settings, App Store, or by contacting us</li>
                <li>No refunds for partial subscription periods, except as required by law or app store policies</li>
              </ul>
            </section>

            <section className="p-4 rounded-lg border border-red-500/30" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
              <h2 className="text-xl font-semibold mb-3 text-red-500">5. AI Pastoral Guidance - Important Disclaimers</h2>
              <h3 className="font-semibold mt-4 mb-2 text-red-400">NOT PROFESSIONAL COUNSELING</h3>
              <p>The AI pastoral guidance feature provides spiritual support and biblical perspective. IT IS NOT:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Professional mental health counseling</li>
                <li>Medical advice</li>
                <li>A substitute for licensed therapy</li>
                <li>An emergency service</li>
              </ul>
              <h3 className="font-semibold mt-4 mb-2 text-red-400">SEEK PROFESSIONAL HELP</h3>
              <p>For serious mental health concerns, please consult a licensed mental health professional. For emergencies, call 911 or 988 (Suicide & Crisis Lifeline).</p>
              <h3 className="font-semibold mt-4 mb-2 text-red-400">ASSUMPTION OF RISK</h3>
              <p>By using the AI pastoral guidance feature, you acknowledge and accept that:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>You use this feature at your own risk</li>
                <li>The App is not liable for decisions made based on AI responses</li>
                <li>You will seek professional help for serious mental health concerns</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>6. Crisis Detection and Reporting</h2>
              <h3 className="font-semibold mt-4 mb-2" style={{ color: 'var(--text-primary)' }}>Safety Monitoring</h3>
              <p>Our App monitors conversations for safety-related keywords to provide appropriate resources and support.</p>
              <h3 className="font-semibold mt-4 mb-2" style={{ color: 'var(--text-primary)' }}>Mandatory Reporting</h3>
              <p>In compliance with Louisiana law (Children's Code Article 609), we may report suspected child abuse or neglect to appropriate authorities when:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>A minor discloses abuse or neglect</li>
                <li>There is reasonable cause to believe a child is being abused</li>
              </ul>
              <h3 className="font-semibold mt-4 mb-2" style={{ color: 'var(--text-primary)' }}>Duty to Warn</h3>
              <p>If you express intent to harm yourself or others, pastoral staff may be notified and emergency resources provided. In cases of imminent danger, we may contact emergency services.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>7. Community Guidelines</h2>
              <h3 className="font-semibold mt-4 mb-2" style={{ color: 'var(--text-primary)' }}>Prayer Requests</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Be respectful and supportive of others</li>
                <li>Do not share others' private information</li>
                <li>No spam, advertising, or inappropriate content</li>
              </ul>
              <h3 className="font-semibold mt-4 mb-2" style={{ color: 'var(--text-primary)' }}>Prohibited Content</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Hate speech or discrimination</li>
                <li>Explicit or adult content</li>
                <li>Harassment or bullying</li>
                <li>False or misleading information</li>
                <li>Content promoting illegal activities</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>8. Intellectual Property</h2>
              <p>The App, including design, text, graphics, and software, is owned by us or our licensors. You may not copy, modify, or distribute our content without permission.</p>
              <p className="mt-2">Scripture quotations are from The Holy Bible, English Standard Version (ESV). Copyright 2001 by Crossway, a publishing ministry of Good News Publishers. Used by permission.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>9. Limitation of Liability</h2>
              <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>The App is provided "as is" without warranties of any kind</li>
                <li>We are not liable for any indirect, incidental, special, or consequential damages</li>
                <li>Our total liability shall not exceed the amount you paid us in the past 12 months</li>
              </ul>
              <p className="mt-2">SPECIFICALLY, WE ARE NOT LIABLE FOR:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Decisions made based on AI pastoral guidance</li>
                <li>Emotional distress from using the App</li>
                <li>Technical failures or data loss</li>
                <li>Actions of other users</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>10. Dispute Resolution</h2>
              <p>These Terms are governed by the laws of the State of Louisiana. Any legal action shall be brought in the courts of St. Tammany Parish, Louisiana.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>11. Termination</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>By You:</strong> You may delete your account at any time.</li>
                <li><strong>By Us:</strong> We may suspend or terminate your account for Terms violations or at our discretion.</li>
                <li><strong>Effect:</strong> Upon termination, your right to use the App ceases immediately.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>12. Changes to Terms</h2>
              <p>We may modify these Terms at any time. Material changes will be communicated via email or in-app notice. Continued use after changes constitutes acceptance.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>13. Contact</h2>
              <p>Questions about these Terms:</p>
              <p>Email: <a href="mailto:developer@ilovecornerstone.com" className="text-blue-500 hover:underline">developer@ilovecornerstone.com</a></p>
              <p className="mt-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                The Busy Christian App is a ministry of Cornerstone Church, Mandeville, Louisiana.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
