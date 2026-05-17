"use client";

export default function TermsOfServicePage() {
  return (
    <div className="bg-[#09090b] text-white min-h-screen">
      <section className="pt-28 pb-20 lg:pt-40 lg:pb-28 border-b border-[#1c1c1f]">
        <div className="mx-auto max-w-[800px] px-6">
          <p className="text-[13px] font-medium tracking-wide text-[#a1a1aa] mb-5">Legal</p>
          <h1 className="text-[clamp(2rem,4.5vw,3.25rem)] font-semibold leading-[1.12] tracking-[-0.02em]">
            Terms of Service
          </h1>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-[800px] px-6 space-y-8 text-[15px] leading-[1.7] text-[#a1a1aa]">
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Introduction</h2>
            <p>Welcome to Nigris. These Terms of Service govern your use of the Nigris platform, APIs, SDKs, dashboard, and related services.</p>
            <p className="mt-4">By accessing or using Nigris, you agree to these terms.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Eligibility</h2>
            <p className="mb-4">You must be at least 13 years old to use the platform.</p>
            <p>By using Nigris, you confirm that you have the legal authority to agree to these terms.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Accounts</h2>
            <p className="mb-2">Users are responsible for:</p>
            <ul className="list-disc pl-5 space-y-1 mb-4">
              <li>Maintaining account security</li>
              <li>Protecting API keys and credentials</li>
              <li>Activities performed under their account</li>
            </ul>
            <p>You must provide accurate and current information.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-4">API Usage</h2>
            <p className="mb-2">Users may use Nigris APIs subject to:</p>
            <ul className="list-disc pl-5 space-y-1 mb-4">
              <li>Usage limits</li>
              <li>Rate limits</li>
              <li>Subscription restrictions</li>
              <li>Applicable laws</li>
            </ul>
            <p>Abuse, scraping, automated attacks, or attempts to bypass security mechanisms are prohibited.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Prohibited Activities</h2>
            <p className="mb-2">You agree NOT to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Abuse APIs or infrastructure</li>
              <li>Attempt unauthorized access</li>
              <li>Distribute malware or harmful code</li>
              <li>Perform denial-of-service attacks</li>
              <li>Violate laws or regulations</li>
              <li>Store illegal content</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Billing & Subscriptions</h2>
            <p className="mb-4">Paid features may require subscriptions through providers such as Razorpay.</p>
            <p className="mb-4">Subscriptions may renew automatically unless canceled.</p>
            <p>Fees are generally non-refundable unless required by law.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Service Availability</h2>
            <p className="mb-4">We aim to provide reliable uptime but do not guarantee uninterrupted availability.</p>
            <p>Services may be modified, suspended, or discontinued at any time.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Intellectual Property</h2>
            <p className="mb-4">Nigris and its associated branding, software, and documentation are protected by intellectual property laws.</p>
            <p>Users retain ownership of the content and data they upload.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Limitation of Liability</h2>
            <p className="mb-2">To the maximum extent permitted by law:</p>
            <ul className="list-disc pl-5 space-y-1 mb-4">
              <li>Nigris is provided &quot;as is&quot;</li>
              <li>We are not liable for indirect or consequential damages</li>
              <li>We do not guarantee error-free operation</li>
            </ul>
            <p>Use the platform at your own risk.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Termination</h2>
            <p className="mb-2">We may suspend or terminate accounts that:</p>
            <ul className="list-disc pl-5 space-y-1 mb-4">
              <li>Violate these terms</li>
              <li>Abuse the platform</li>
              <li>Create security risks</li>
            </ul>
            <p>Users may stop using the service at any time.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Privacy</h2>
            <p>Your use of the platform is also governed by the Privacy Policy.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Changes to Terms</h2>
            <p>We may update these Terms periodically. Continued use after updates constitutes acceptance of revised terms.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Governing Law</h2>
            <p>These Terms shall be governed by the laws applicable in your jurisdiction.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Contact</h2>
            <p>For legal or support inquiries:</p>
            <p className="mt-2"><a href="mailto:support@nigris.com" className="text-[#3b82f6] hover:underline">support@nigris.com</a></p>
          </div>
        </div>
      </section>
    </div>
  );
}
