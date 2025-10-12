// Removed page-level Navigation; global header renders in layout

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Global header handled by RootLayout */}

      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
          <p className="mt-2 text-gray-600">Last updated: January 2024</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-8 prose prose-gray max-w-none">
          <h2>1. Introduction</h2>
          <p>
            SequenceHUB ("we," "our," or "us") is committed to protecting your
            privacy. This Privacy Policy explains how we collect, use, disclose,
            and safeguard your information when you use our platform.
          </p>

          <h2>2. Information We Collect</h2>

          <h3>2.1 Personal Information</h3>
          <p>
            We may collect personal information that you provide directly to us,
            including:
          </p>
          <ul>
            <li>Name and email address (required for account creation)</li>
            <li>Profile information (username, bio, profile picture)</li>
            <li>
              Payment information (processed securely through third-party
              providers)
            </li>
            <li>Communication data (messages, support tickets)</li>
            <li>Seller verification documents (for seller accounts)</li>
          </ul>

          <h3>2.2 Usage Information</h3>
          <p>
            We automatically collect certain information about your use of our
            Service:
          </p>
          <ul>
            <li>
              Device information (IP address, browser type, operating system)
            </li>
            <li>Usage patterns (pages visited, time spent, features used)</li>
            <li>
              Sequence interactions (downloads, uploads, ratings, reviews)
            </li>
            <li>Log data (access times, error logs, performance metrics)</li>
          </ul>

          <h3>2.3 Cookies and Tracking Technologies</h3>
          <p>
            We use cookies and similar tracking technologies to enhance your
            experience, analyze usage patterns, and provide personalized
            content. You can control cookie preferences through your browser
            settings.
          </p>

          <h2>3. How We Use Your Information</h2>
          <p>We use the collected information for the following purposes:</p>
          <ul>
            <li>Providing and maintaining the Service</li>
            <li>Processing transactions and payments</li>
            <li>Personalizing your experience and recommendations</li>
            <li>
              Communicating with you about updates, security alerts, and support
            </li>
            <li>Analyzing usage patterns to improve our Service</li>
            <li>Preventing fraud and ensuring platform security</li>
            <li>Complying with legal obligations</li>
          </ul>

          <h2>4. Information Sharing and Disclosure</h2>
          <p>
            We do not sell, trade, or rent your personal information to third
            parties. We may share your information in the following
            circumstances:
          </p>

          <h3>4.1 With Your Consent</h3>
          <p>
            We may share your information when you explicitly consent to such
            sharing.
          </p>

          <h3>4.2 Service Providers</h3>
          <p>
            We may share information with trusted third-party service providers
            who assist us in:
          </p>
          <ul>
            <li>Payment processing</li>
            <li>Email delivery</li>
            <li>Analytics and performance monitoring</li>
            <li>Customer support</li>
            <li>Cloud hosting and storage</li>
          </ul>

          <h3>4.3 Legal Requirements</h3>
          <p>
            We may disclose your information if required by law or in response
            to valid legal requests.
          </p>

          <h3>4.4 Business Transfers</h3>
          <p>
            In the event of a merger, acquisition, or sale of assets, your
            information may be transferred as part of that transaction.
          </p>

          <h2>5. Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to
            protect your information:
          </p>
          <ul>
            <li>Encryption of data in transit and at rest</li>
            <li>Regular security assessments and updates</li>
            <li>Access controls and authentication mechanisms</li>
            <li>Secure payment processing through PCI-compliant providers</li>
            <li>Regular backups and disaster recovery procedures</li>
          </ul>
          <p>
            However, no method of transmission over the Internet or electronic
            storage is 100% secure. We cannot guarantee absolute security of
            your information.
          </p>

          <h2>6. Data Retention</h2>
          <p>We retain your information for as long as necessary to:</p>
          <ul>
            <li>Provide the Service and fulfill transactions</li>
            <li>Comply with legal obligations</li>
            <li>Resolve disputes and enforce agreements</li>
            <li>Improve our Service and user experience</li>
          </ul>
          <p>
            You may request deletion of your account and associated data at any
            time, subject to legal and contractual obligations.
          </p>

          <h2>7. Your Rights and Choices</h2>
          <p>
            Depending on your location, you may have the following rights
            regarding your personal information:
          </p>
          <ul>
            <li>
              <strong>Access:</strong> Request a copy of the personal
              information we hold about you
            </li>
            <li>
              <strong>Correction:</strong> Request correction of inaccurate or
              incomplete information
            </li>
            <li>
              <strong>Deletion:</strong> Request deletion of your personal
              information
            </li>
            <li>
              <strong>Portability:</strong> Request transfer of your data to
              another service
            </li>
            <li>
              <strong>Restriction:</strong> Request limitation of processing of
              your information
            </li>
            <li>
              <strong>Objection:</strong> Object to certain types of processing
            </li>
          </ul>
          <p>
            To exercise these rights, please contact us using the information
            provided below.
          </p>

          <h2>8. Children's Privacy</h2>
          <p>
            Our Service is not intended for children under the age of 13. We do
            not knowingly collect personal information from children under 13.
            If you are a parent or guardian and believe your child has provided
            us with personal information, please contact us immediately.
          </p>

          <h2>9. International Data Transfers</h2>
          <p>
            Your information may be transferred to and processed in countries
            other than your own. We ensure appropriate safeguards are in place
            to protect your information in accordance with applicable data
            protection laws.
          </p>

          <h2>10. Third-Party Links</h2>
          <p>
            Our Service may contain links to third-party websites or services.
            We are not responsible for the privacy practices of these third
            parties. We encourage you to review their privacy policies before
            providing any personal information.
          </p>

          <h2>11. Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify
            you of any material changes by posting the new Privacy Policy on
            this page and updating the "Last updated" date. We encourage you to
            review this Privacy Policy periodically.
          </p>

          <h2>12. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy or our privacy
            practices, please contact us:
          </p>
          <ul>
            <li>Email: privacy@sequencehub.com</li>
            <li>Address: 123 Tech Street, San Francisco, CA 94105</li>
            <li>Phone: +1 (555) 123-4567</li>
          </ul>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-8">
            <p className="text-green-800 font-medium mb-2">
              Your Privacy Matters
            </p>
            <p className="text-green-700 text-sm">
              We are committed to transparency and protecting your privacy. If
              you have any concerns or questions about how we handle your data,
              please don&apos;t hesitate to reach out to us.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
