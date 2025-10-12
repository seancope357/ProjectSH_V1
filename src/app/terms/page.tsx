// Removed page-level Navigation; global header renders in layout

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Global header handled by RootLayout */}

      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
          <p className="mt-2 text-gray-600">Last updated: January 2024</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-8 prose prose-gray max-w-none">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using SequenceHUB (&quot;the Service&quot;), you
            accept and agree to be bound by the terms and provision of this
            agreement. If you do not agree to abide by the above, please do not
            use this service.
          </p>

          <h2>2. Description of Service</h2>
          <p>
            SequenceHUB is a platform that allows users to share, discover, and
            purchase automation sequences, macros, and workflows. The service
            includes but is not limited to:
          </p>
          <ul>
            <li>Uploading and sharing automation sequences</li>
            <li>Browsing and downloading sequences created by other users</li>
            <li>Purchasing premium sequences from verified sellers</li>
            <li>Accessing marketplace features and vendor tools</li>
            <li>Participating in community discussions</li>
          </ul>

          <h2>3. User Accounts</h2>
          <p>
            To access certain features of the Service, you must register for an
            account. You agree to:
          </p>
          <ul>
            <li>
              Provide accurate, current, and complete information during
              registration
            </li>
            <li>Maintain and update your account information</li>
            <li>Keep your password secure and confidential</li>
            <li>Accept responsibility for all activities under your account</li>
            <li>
              Notify us immediately of any unauthorized use of your account
            </li>
          </ul>

          <h2>4. User Content and Conduct</h2>
          <p>
            You are solely responsible for the content you upload, post, or
            share on SequenceHUB. You agree not to:
          </p>
          <ul>
            <li>Upload malicious, harmful, or destructive sequences</li>
            <li>Violate any applicable laws or regulations</li>
            <li>Infringe on intellectual property rights of others</li>
            <li>Share personal information of other users without consent</li>
            <li>Engage in spam, harassment, or abusive behavior</li>
            <li>
              Attempt to gain unauthorized access to the Service or other
              users&apos; accounts
            </li>
          </ul>

          <h2>5. Intellectual Property</h2>
          <p>
            By uploading content to SequenceHUB, you grant us a non-exclusive,
            worldwide, royalty-free license to use, display, and distribute your
            content on the platform. You retain ownership of your content and
            can remove it at any time.
          </p>
          <p>
            You represent and warrant that you own or have the necessary rights
            to all content you upload and that such content does not infringe on
            the rights of any third party.
          </p>

          <h2>6. Seller Terms</h2>
          <p>
            If you choose to sell sequences on SequenceHUB, additional terms
            apply:
          </p>
          <ul>
            <li>
              You must complete seller verification before listing paid content
            </li>
            <li>SequenceHUB charges a 10% platform commission on all sales</li>
            <li>
              Payments are processed weekly with a minimum threshold of $25
            </li>
            <li>
              You are responsible for the quality and functionality of your
              sequences
            </li>
            <li>
              Refunds may be issued at our discretion for defective or
              misrepresented content
            </li>
          </ul>

          <h2>7. Privacy and Data Protection</h2>
          <p>
            Your privacy is important to us. Please review our Privacy Policy,
            which also governs your use of the Service, to understand our
            practices regarding the collection and use of your information.
          </p>

          <h2>8. Quality Standards</h2>
          <p>
            All content on our platform must meet quality standards. We review
            sequences to ensure they provide value to users and maintain
            platform integrity.
          </p>

          <h2>9. Disclaimers and Limitations</h2>
          <p>
            SequenceHUB is provided &quot;as is&quot; without warranties of any
            kind. We do not guarantee:
          </p>
          <ul>
            <li>
              The accuracy, completeness, or functionality of user-generated
              sequences
            </li>
            <li>Uninterrupted or error-free service</li>
            <li>Performance of sequences on all system configurations</li>
            <li>The security of data transmitted through the Service</li>
          </ul>
          <p>
            You use sequences at your own risk. Always test sequences in a safe
            environment before implementing them in production systems.
          </p>

          <h2>9. Limitation of Liability</h2>
          <p>
            In no event shall SequenceHUB, its officers, directors, employees,
            or agents be liable for any indirect, incidental, special,
            consequential, or punitive damages, including without limitation,
            loss of profits, data, use, goodwill, or other intangible losses,
            resulting from your use of the Service.
          </p>

          <h2>10. Termination</h2>
          <p>
            We may terminate or suspend your account and access to the Service
            immediately, without prior notice or liability, for any reason
            whatsoever, including without limitation if you breach the Terms.
          </p>
          <p>
            Upon termination, your right to use the Service will cease
            immediately. If you wish to terminate your account, you may simply
            discontinue using the Service.
          </p>

          <h2>11. Changes to Terms</h2>
          <p>
            We reserve the right to modify or replace these Terms at any time.
            If a revision is material, we will try to provide at least 30 days
            notice prior to any new terms taking effect.
          </p>

          <h2>12. Governing Law</h2>
          <p>
            These Terms shall be interpreted and governed by the laws of the
            State of California, United States, without regard to conflict of
            law provisions.
          </p>

          <h2>13. Contact Information</h2>
          <p>
            If you have any questions about these Terms of Service, please
            contact us at:
          </p>
          <p>
            Email: legal@sequencehub.com
            <br />
            Address: 123 Tech Street, San Francisco, CA 94105
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-8">
            <p className="text-blue-800 font-medium mb-2">Important Notice</p>
            <p className="text-blue-700 text-sm">
              By continuing to use SequenceHUB, you acknowledge that you have
              read, understood, and agree to be bound by these Terms of Service.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
