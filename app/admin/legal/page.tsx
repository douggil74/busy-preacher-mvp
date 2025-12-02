'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  ArrowLeft,
  FileText,
  Shield,
  AlertTriangle,
  Scale,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import AdminAuth from '@/components/AdminAuth';

type DocumentKey = 'privacy' | 'terms' | 'crisis' | 'mandatory';

export default function LegalDocumentsPage() {
  const [expandedDoc, setExpandedDoc] = useState<DocumentKey | null>('privacy');
  const [copiedDoc, setCopiedDoc] = useState<string | null>(null);

  const copyToClipboard = async (text: string, docName: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedDoc(docName);
    setTimeout(() => setCopiedDoc(null), 2000);
  };

  const toggleDoc = (doc: DocumentKey) => {
    setExpandedDoc(expandedDoc === doc ? null : doc);
  };

  return (
    <AdminAuth>
      <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
        {/* Header */}
        <div className="sticky top-0 z-20 backdrop-blur-md" style={{ backgroundColor: 'rgba(var(--card-bg-rgb), 0.9)', borderBottom: '1px solid var(--card-border)' }}>
          <div className="max-w-4xl mx-auto px-4 py-3">
            <div className="flex items-center gap-3">
              <Link href="/admin" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <ArrowLeft className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
              </Link>
              <div>
                <h1 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Legal Documents</h1>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Draft policies and disclaimers for review</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
          {/* Important Notice */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-500">Important: Legal Review Required</p>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                  These are draft documents based on common practices. You should have an attorney review
                  these before publishing, especially the mandatory reporting and crisis disclaimers due
                  to the sensitive nature of pastoral guidance and counseling features.
                </p>
              </div>
            </div>
          </div>

          {/* Privacy Policy */}
          <DocumentCard
            title="Privacy Policy"
            icon={<Shield className="w-5 h-5 text-blue-500" />}
            description="Comprehensive privacy policy covering data collection, AI services, and user rights"
            expanded={expandedDoc === 'privacy'}
            onToggle={() => toggleDoc('privacy')}
            onCopy={() => copyToClipboard(PRIVACY_POLICY, 'privacy')}
            copied={copiedDoc === 'privacy'}
            priority="Critical"
            priorityColor="red"
          >
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <pre className="whitespace-pre-wrap text-xs p-4 rounded-lg overflow-auto" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
                {PRIVACY_POLICY}
              </pre>
            </div>
          </DocumentCard>

          {/* Terms of Service */}
          <DocumentCard
            title="Terms of Service"
            icon={<Scale className="w-5 h-5 text-purple-500" />}
            description="User agreement covering subscriptions, AI counseling, and liability limitations"
            expanded={expandedDoc === 'terms'}
            onToggle={() => toggleDoc('terms')}
            onCopy={() => copyToClipboard(TERMS_OF_SERVICE, 'terms')}
            copied={copiedDoc === 'terms'}
            priority="Critical"
            priorityColor="red"
          >
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <pre className="whitespace-pre-wrap text-xs p-4 rounded-lg overflow-auto" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
                {TERMS_OF_SERVICE}
              </pre>
            </div>
          </DocumentCard>

          {/* Crisis Disclaimer */}
          <DocumentCard
            title="Crisis & Mental Health Disclaimer"
            icon={<AlertTriangle className="w-5 h-5 text-red-500" />}
            description="Required disclaimer for AI pastoral guidance - display before first use"
            expanded={expandedDoc === 'crisis'}
            onToggle={() => toggleDoc('crisis')}
            onCopy={() => copyToClipboard(CRISIS_DISCLAIMER, 'crisis')}
            copied={copiedDoc === 'crisis'}
            priority="Critical"
            priorityColor="red"
          >
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <pre className="whitespace-pre-wrap text-xs p-4 rounded-lg overflow-auto" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
                {CRISIS_DISCLAIMER}
              </pre>
            </div>
          </DocumentCard>

          {/* Mandatory Reporting Disclosure */}
          <DocumentCard
            title="Mandatory Reporting Disclosure"
            icon={<FileText className="w-5 h-5 text-amber-500" />}
            description="Louisiana-specific disclosure about child abuse reporting obligations"
            expanded={expandedDoc === 'mandatory'}
            onToggle={() => toggleDoc('mandatory')}
            onCopy={() => copyToClipboard(MANDATORY_REPORTING_DISCLOSURE, 'mandatory')}
            copied={copiedDoc === 'mandatory'}
            priority="Critical"
            priorityColor="red"
          >
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <pre className="whitespace-pre-wrap text-xs p-4 rounded-lg overflow-auto" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
                {MANDATORY_REPORTING_DISCLOSURE}
              </pre>
            </div>
          </DocumentCard>

          {/* Implementation Checklist */}
          <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
            <h3 className="font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Implementation Checklist</h3>
            <div className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded" />
                <span>Replace /privacy page with comprehensive Privacy Policy</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded" />
                <span>Create /terms page with Terms of Service</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded" />
                <span>Add Crisis Disclaimer modal before first pastoral guidance use</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded" />
                <span>Add Mandatory Reporting notice to onboarding flow</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded" />
                <span>Add &quot;I agree to Terms & Privacy Policy&quot; checkbox at signup</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded" />
                <span>Add footer links to Privacy Policy and Terms of Service</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded" />
                <span>Have attorney review all documents</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </AdminAuth>
  );
}

function DocumentCard({
  title,
  icon,
  description,
  expanded,
  onToggle,
  onCopy,
  copied,
  priority,
  priorityColor,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  description: string;
  expanded: boolean;
  onToggle: () => void;
  onCopy: () => void;
  copied: boolean;
  priority: string;
  priorityColor: string;
  children: React.ReactNode;
}) {
  const colors: Record<string, string> = {
    red: 'bg-red-500/10 text-red-500',
    amber: 'bg-amber-500/10 text-amber-500',
    green: 'bg-green-500/10 text-green-500',
  };

  return (
    <div className="rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          {icon}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{title}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${colors[priorityColor]}`}>{priority}</span>
            </div>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCopy();
            }}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Copy to clipboard"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
            )}
          </button>
          {expanded ? (
            <ChevronUp className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
          ) : (
            <ChevronDown className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
          )}
        </div>
      </button>
      {expanded && (
        <div className="px-4 pb-4" style={{ borderTop: '1px solid var(--card-border)' }}>
          <div className="pt-4">{children}</div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// LEGAL DOCUMENT DRAFTS
// ============================================================================

const PRIVACY_POLICY = `PRIVACY POLICY
The Busy Christian App
Last Updated: December 1, 2025

1. INTRODUCTION

The Busy Christian App ("App," "we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and website.

Please read this Privacy Policy carefully. By using the App, you agree to the collection and use of information in accordance with this policy.

2. INFORMATION WE COLLECT

2.1 Personal Information You Provide
- Account Information: Email address, name, phone number (optional)
- Profile Information: Study preferences, notification settings, location (city/state for weather features)
- Payment Information: Processed securely through Square/Apple; we do not store payment card details
- User Content: Prayer requests, pastoral guidance conversations, study notes

2.2 Information Collected Automatically
- Device Information: Device type, operating system, unique device identifiers
- Usage Data: Features accessed, time spent, interaction patterns
- Log Data: IP address, browser type, access times (collected during pastoral guidance for safety purposes)

2.3 Sensitive Information
- Health-Related Information: Prayer requests may contain health information you choose to share
- Crisis Information: Our system monitors conversations for safety keywords to provide appropriate resources
- Location Data: City and state (user-provided) for weather personalization; we do not track GPS location

3. HOW WE USE YOUR INFORMATION

3.1 To Provide Services
- Deliver personalized devotional content and Bible study features
- Enable AI-assisted pastoral guidance conversations
- Facilitate community prayer features
- Display weather-based visual themes

3.2 For Safety and Compliance
- Monitor for crisis situations to provide emergency resources (988 Suicide & Crisis Lifeline)
- Comply with mandatory reporting laws for suspected child abuse (Louisiana Children's Code Article 609)
- Respond to legal requests and prevent harm

3.3 To Improve Our Services
- Analyze usage patterns to enhance features
- Debug and troubleshoot technical issues
- Develop new features based on user needs

4. THIRD-PARTY SERVICES

We share information with the following service providers:

4.1 AI Services
- Anthropic (Claude): Powers pastoral guidance conversations
- OpenAI: Provides embeddings for sermon search and supplementary AI features

These services process your questions to generate responses. Conversations may be used to improve AI safety but are not used for advertising.

4.2 Infrastructure Services
- Firebase (Google): Authentication, data storage, push notifications
- Supabase: Sermon embeddings, conversation storage
- Vercel: Website hosting

4.3 Payment Processing
- Square: Subscription payments (web)
- Apple: In-app purchases (iOS)

4.4 Communications
- Resend: Transactional emails (conversation transcripts, crisis alerts to pastoral staff)

5. DATA RETENTION

- Account Data: Retained while your account is active; deleted within 30 days of account deletion request
- Conversation History: Retained for 12 months for service improvement, then anonymized
- Crisis-Related Data: May be retained longer for safety and legal compliance purposes
- Payment Records: Retained as required by tax and financial regulations (typically 7 years)

6. YOUR RIGHTS

6.1 All Users
- Access: Request a copy of your personal data
- Correction: Update inaccurate information
- Deletion: Request deletion of your account and associated data
- Data Portability: Receive your data in a common format

6.2 California Residents (CCPA/CPRA)
- Right to know what personal information is collected
- Right to delete personal information
- Right to opt-out of sale/sharing (we do not sell your data)
- Right to limit use of sensitive personal information
- Right to non-discrimination for exercising your rights

6.3 European Users (GDPR)
- All rights listed above, plus:
- Right to object to processing
- Right to restrict processing
- Right to withdraw consent

To exercise these rights, contact: developer@ilovecornerstone.com

7. CHILDREN'S PRIVACY

The App is not intended for children under 13. We do not knowingly collect personal information from children under 13. If we discover we have collected such information, we will delete it promptly.

Minors aged 13-17 may use the App with parental consent. If a minor reports abuse or crisis situations, we may be legally required to report to appropriate authorities.

8. SECURITY

We implement industry-standard security measures including:
- Encryption in transit (TLS/SSL)
- Encryption at rest for sensitive data
- Secure authentication through Firebase
- Regular security assessments

However, no method of transmission or storage is 100% secure. We cannot guarantee absolute security.

9. PUSH NOTIFICATIONS

We may send push notifications for:
- Prayer request updates
- Study reminders
- Devotional content

You can disable notifications in your device settings at any time.

10. CRISIS DETECTION AND RESPONSE

Our App includes safety features that monitor pastoral guidance conversations for crisis keywords (suicide, self-harm, abuse). When detected:
- You will see emergency resources (988 Suicide & Crisis Lifeline)
- Pastoral staff may be notified to provide support
- For minors reporting abuse, we comply with mandatory reporting laws

11. CHANGES TO THIS POLICY

We may update this Privacy Policy periodically. We will notify you of significant changes via email or in-app notification. Continued use after changes constitutes acceptance.

12. CONTACT US

Questions about this Privacy Policy:
Email: developer@ilovecornerstone.com

The Busy Christian App is a ministry of Cornerstone Church, Mandeville, Louisiana.`;

const TERMS_OF_SERVICE = `TERMS OF SERVICE
The Busy Christian App
Last Updated: December 1, 2025

PLEASE READ THESE TERMS CAREFULLY BEFORE USING THE APP.

1. ACCEPTANCE OF TERMS

By accessing or using The Busy Christian App ("App"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree, do not use the App.

2. DESCRIPTION OF SERVICE

The App provides:
- Daily devotional content and Bible study tools
- AI-assisted pastoral guidance conversations
- Community prayer features
- Sermon library and study resources

3. ACCOUNT REGISTRATION

3.1 You must provide accurate information when creating an account.
3.2 You are responsible for maintaining the confidentiality of your login credentials.
3.3 You must be at least 13 years old to use the App. Users under 18 should have parental consent.

4. SUBSCRIPTION AND PAYMENTS

4.1 Pricing
- Monthly: $3.99/month
- Annual: $35.88/year ($2.99/month equivalent)
- New users receive a 7-day free trial

4.2 Billing
- Subscriptions auto-renew unless cancelled
- Cancel anytime through your account settings, App Store, or by contacting us
- No refunds for partial subscription periods, except as required by law or app store policies

4.3 Price Changes
We may change subscription prices with 30 days notice. Existing subscribers will be notified before renewal at the new price.

5. AI PASTORAL GUIDANCE - IMPORTANT DISCLAIMERS

5.1 NOT PROFESSIONAL COUNSELING
The AI pastoral guidance feature provides spiritual support and biblical perspective. IT IS NOT:
- Professional mental health counseling
- Medical advice
- A substitute for licensed therapy
- An emergency service

5.2 SEEK PROFESSIONAL HELP
For serious mental health concerns, please consult a licensed mental health professional. For emergencies, call 911 or 988 (Suicide & Crisis Lifeline).

5.3 LIMITATIONS OF AI
- The AI may not always understand context correctly
- Responses are generated by artificial intelligence, not human pastors
- The AI may miss signs of crisis or provide incomplete guidance
- All spiritual guidance should be verified against Scripture

5.4 ASSUMPTION OF RISK
By using the AI pastoral guidance feature, you acknowledge and accept that:
- You use this feature at your own risk
- The App is not liable for decisions made based on AI responses
- You will seek professional help for serious mental health concerns

6. CRISIS DETECTION AND REPORTING

6.1 Safety Monitoring
Our App monitors conversations for safety-related keywords to provide appropriate resources and support.

6.2 Mandatory Reporting
In compliance with Louisiana law (Children's Code Article 609), we may report suspected child abuse or neglect to appropriate authorities when:
- A minor discloses abuse or neglect
- There is reasonable cause to believe a child is being abused

6.3 Duty to Warn
If you express intent to harm yourself or others, pastoral staff may be notified and emergency resources provided. In cases of imminent danger, we may contact emergency services.

7. COMMUNITY GUIDELINES

7.1 Prayer Requests
- Be respectful and supportive of others
- Do not share others' private information
- No spam, advertising, or inappropriate content

7.2 Prohibited Content
- Hate speech or discrimination
- Explicit or adult content
- Harassment or bullying
- False or misleading information
- Content promoting illegal activities

7.3 Moderation
We reserve the right to remove content and suspend accounts that violate these guidelines.

8. INTELLECTUAL PROPERTY

8.1 Our Content
The App, including design, text, graphics, and software, is owned by us or our licensors. You may not copy, modify, or distribute our content without permission.

8.2 Bible Content
Scripture quotations are from the ESV® Bible (The Holy Bible, English Standard Version®), copyright © 2001 by Crossway, a publishing ministry of Good News Publishers. Used by permission.

8.3 Your Content
You retain ownership of content you submit (prayers, notes). By submitting content, you grant us a license to use it for providing and improving the service.

9. LIMITATION OF LIABILITY

9.1 TO THE MAXIMUM EXTENT PERMITTED BY LAW:
- The App is provided "as is" without warranties of any kind
- We are not liable for any indirect, incidental, special, or consequential damages
- Our total liability shall not exceed the amount you paid us in the past 12 months

9.2 SPECIFICALLY, WE ARE NOT LIABLE FOR:
- Decisions made based on AI pastoral guidance
- Emotional distress from using the App
- Technical failures or data loss
- Actions of other users

10. INDEMNIFICATION

You agree to indemnify and hold harmless The Busy Christian App, Cornerstone Church, and their officers, directors, employees, and agents from any claims arising from your use of the App or violation of these Terms.

11. DISPUTE RESOLUTION

11.1 Governing Law
These Terms are governed by the laws of the State of Louisiana.

11.2 Informal Resolution
Before filing any legal claim, you agree to try to resolve disputes informally by contacting us.

11.3 Jurisdiction
Any legal action shall be brought in the courts of St. Tammany Parish, Louisiana.

12. TERMINATION

12.1 By You: You may delete your account at any time.
12.2 By Us: We may suspend or terminate your account for Terms violations or at our discretion.
12.3 Effect: Upon termination, your right to use the App ceases immediately.

13. CHANGES TO TERMS

We may modify these Terms at any time. Material changes will be communicated via email or in-app notice. Continued use after changes constitutes acceptance.

14. CONTACT

Questions about these Terms:
Email: developer@ilovecornerstone.com

The Busy Christian App is a ministry of Cornerstone Church, Mandeville, Louisiana.`;

const CRISIS_DISCLAIMER = `CRISIS & MENTAL HEALTH DISCLAIMER
The Busy Christian App - Pastoral Guidance Feature

IMPORTANT: PLEASE READ BEFORE USING PASTORAL GUIDANCE

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

THIS IS NOT AN EMERGENCY SERVICE

If you are experiencing a mental health emergency:
• Call 911 for immediate danger
• Call 988 (Suicide & Crisis Lifeline) for crisis support
• Go to your nearest emergency room

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

WHAT THIS FEATURE IS:

✓ AI-assisted spiritual guidance based on biblical principles
✓ A tool for exploring faith questions and seeking encouragement
✓ A supplement to your personal faith journey
✓ Available 24/7 for spiritual support

WHAT THIS FEATURE IS NOT:

✗ Professional mental health counseling or therapy
✗ Medical advice or diagnosis
✗ A substitute for licensed professional care
✗ An emergency response service
✗ A replacement for human pastoral care

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

LIMITATIONS OF AI GUIDANCE:

• Responses are generated by artificial intelligence, not human pastors
• The AI may misunderstand context or nuance in your questions
• The AI may not recognize all signs of crisis or distress
• AI responses should be verified against Scripture and pastoral wisdom
• The AI cannot provide the personal relationship of human pastoral care

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SAFETY FEATURES:

Our app includes safety monitoring to help protect you:

• Crisis keywords (suicide, self-harm, abuse) trigger emergency resources
• Pastoral staff may be notified of serious concerns to provide human support
• For minors reporting abuse, we comply with mandatory reporting laws

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

WHEN TO SEEK PROFESSIONAL HELP:

Please seek help from a licensed mental health professional if you experience:

• Persistent feelings of hopelessness or despair
• Thoughts of self-harm or suicide
• Anxiety or depression affecting daily life
• Trauma or abuse (past or present)
• Relationship crises
• Grief that feels overwhelming
• Any mental health symptoms causing significant distress

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BY USING THIS FEATURE, YOU ACKNOWLEDGE:

□ I understand this is AI-assisted spiritual guidance, not professional counseling
□ I will seek professional help for serious mental health concerns
□ I will call 988 or 911 in a crisis situation
□ I accept that AI responses have limitations and may not always be accurate
□ I understand my conversations may be monitored for safety purposes

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CRISIS RESOURCES:

988 Suicide & Crisis Lifeline: Call or text 988
National Domestic Violence Hotline: 1-800-799-7233
Crisis Text Line: Text HOME to 741741
SAMHSA National Helpline: 1-800-662-4357

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

const MANDATORY_REPORTING_DISCLOSURE = `MANDATORY REPORTING DISCLOSURE
The Busy Christian App

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

IMPORTANT NOTICE ABOUT CHILD SAFETY

The Busy Christian App takes the safety of children seriously. This notice explains our legal obligations regarding reports of child abuse or neglect.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

WHAT YOU SHOULD KNOW:

Under Louisiana law (Children's Code Article 609), certain individuals are required to report suspected child abuse or neglect to authorities. While clergy have limited exemptions for information received during spiritual counseling, our app operates with transparency about how reports are handled.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

WHAT TRIGGERS A REPORT:

Reports may be made to appropriate authorities when:

• A minor (under 18) discloses current abuse or neglect
• A user reports that a child is in immediate danger
• There is reasonable cause to believe a child is being abused or neglected

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

WHAT HAPPENS WHEN A REPORT IS TRIGGERED:

1. You will see information about resources and next steps
2. Pastoral staff will be notified to provide support
3. Pastoral staff may be required to report to Louisiana Child Protective Services
4. CPS will determine what investigation or action is needed

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

LOUISIANA CHILD PROTECTIVE SERVICES:

If you need to report child abuse or neglect directly:
Phone: 1-855-452-5437 (toll-free, 24/7)
Online: www.dcfs.louisiana.gov

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FOR ADULTS REPORTING PAST ABUSE:

If you are an adult discussing past childhood abuse:
• These conversations are confidential and supportive
• Past abuse does not trigger mandatory reporting for your own history
• We encourage seeking professional counseling for healing
• We can provide resources for survivors of abuse

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DUTY TO WARN (Tarasoff):

If you express credible intent to harm yourself or another person:
• We will provide crisis resources (988 Suicide & Crisis Lifeline)
• Pastoral staff may be notified
• In cases of imminent danger, emergency services may be contacted
• This is to protect you and others from harm

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

WHY WE DO THIS:

Our commitment to child safety and user wellbeing means we must balance:
• Providing a safe space for spiritual guidance
• Protecting children from harm
• Complying with legal requirements
• Supporting those in crisis

We believe transparency about these obligations helps you make informed decisions about what you share.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

QUESTIONS?

If you have questions about our reporting policies:
Email: developer@ilovecornerstone.com

The Busy Christian App is a ministry of Cornerstone Church, Mandeville, Louisiana.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
