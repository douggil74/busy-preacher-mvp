export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Privacy Policy</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">Last updated: November 25, 2025</p>
        <div className="space-y-6 text-gray-700 dark:text-gray-300">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Introduction</h2>
            <p>The Busy Christian App is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Information We Collect</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Email address (for account creation)</li>
              <li>Prayer requests you submit</li>
              <li>App usage analytics</li>
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>To provide and maintain our services</li>
              <li>To enable prayer community features</li>
              <li>To improve our app</li>
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Data Security</h2>
            <p>We use Firebase to securely store your data with industry-standard encryption.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Contact Us</h2>
            <p>Email: developer@ilovecornerstone.com</p>
          </section>
        </div>
      </div>
    </div>
  );
}
