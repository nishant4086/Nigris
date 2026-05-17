"use client";

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-[#09090b] text-white min-h-screen">
      <section className="pt-28 pb-20 lg:pt-40 lg:pb-28 border-b border-[#1c1c1f]">
        <div className="mx-auto max-w-[800px] px-6">
          <p className="text-[13px] font-medium tracking-wide text-[#a1a1aa] mb-5">Legal</p>
          <h1 className="text-[clamp(2rem,4.5vw,3.25rem)] font-semibold leading-[1.12] tracking-[-0.02em]">
            Privacy Policy
          </h1>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-[800px] px-6 space-y-8 text-[15px] leading-[1.7] text-[#a1a1aa]">
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Introduction</h2>
            <p>Welcome to Nigris. Your privacy is important to us. This Privacy Policy explains how we collect, use, store, and protect your information when you use our platform, APIs, SDKs, dashboard, and related services.</p>
            <p className="mt-4">By using Nigris, you agree to the practices described in this policy.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Information We Collect</h2>
            
            <h3 className="text-lg font-medium text-[#e4e4e7] mb-2">1. Account Information</h3>
            <p className="mb-2">When you create an account, we may collect:</p>
            <ul className="list-disc pl-5 space-y-1 mb-6">
              <li>Name</li>
              <li>Email address</li>
              <li>Password (hashed securely)</li>
              <li>Profile information</li>
            </ul>

            <h3 className="text-lg font-medium text-[#e4e4e7] mb-2">2. API & Usage Data</h3>
            <p className="mb-2">When you use the platform, we may collect:</p>
            <ul className="list-disc pl-5 space-y-1 mb-4">
              <li>API requests and responses</li>
              <li>IP address</li>
              <li>Request metadata</li>
              <li>Usage statistics</li>
              <li>Error logs</li>
              <li>Device/browser information</li>
            </ul>
            <p className="mb-6">This data helps us improve reliability, monitor abuse, and provide analytics.</p>

            <h3 className="text-lg font-medium text-[#e4e4e7] mb-2">3. Payment Information</h3>
            <p className="mb-4">If you subscribe to paid plans, payment processing is handled securely by third-party providers such as Razorpay. We do not store full card or banking information on our servers.</p>

            <h3 className="text-lg font-medium text-[#e4e4e7] mb-2">4. Cookies & Local Storage</h3>
            <p className="mb-2">We may use cookies and local storage to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Maintain sessions</li>
              <li>Store theme preferences</li>
              <li>Improve user experience</li>
              <li>Analyze platform performance</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-4">How We Use Information</h2>
            <p className="mb-2">We use collected data to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Provide and maintain services</li>
              <li>Authenticate users</li>
              <li>Generate analytics</li>
              <li>Prevent abuse and fraud</li>
              <li>Improve performance and security</li>
              <li>Process billing and subscriptions</li>
              <li>Provide customer support</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-4">API Data & User Content</h2>
            <p className="mb-4">Data stored in collections and entries belongs to the user who created it.</p>
            <p className="mb-4">We do not sell user data to third parties.</p>
            <p>Users are responsible for the content they upload or store using Nigris.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Data Security</h2>
            <p className="mb-2">We implement industry-standard security practices, including:</p>
            <ul className="list-disc pl-5 space-y-1 mb-4">
              <li>JWT authentication</li>
              <li>API key authorization</li>
              <li>Rate limiting</li>
              <li>HTTPS encryption</li>
              <li>Password hashing</li>
              <li>Access controls</li>
            </ul>
            <p>However, no system is completely secure, and we cannot guarantee absolute security.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Third-Party Services</h2>
            <p className="mb-2">Nigris may integrate with third-party services including:</p>
            <ul className="list-disc pl-5 space-y-1 mb-4">
              <li>MongoDB</li>
              <li>Render</li>
              <li>Vercel</li>
              <li>Razorpay</li>
              <li>Upstash</li>
            </ul>
            <p>These providers may process limited technical data necessary to operate the platform.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Data Retention</h2>
            <p className="mb-2">We retain user data for as long as necessary to:</p>
            <ul className="list-disc pl-5 space-y-1 mb-4">
              <li>Provide services</li>
              <li>Meet legal obligations</li>
              <li>Resolve disputes</li>
              <li>Enforce agreements</li>
            </ul>
            <p>Users may request account or data deletion where applicable.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-4">User Rights</h2>
            <p className="mb-2">Depending on your jurisdiction, you may have rights to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Access your data</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion</li>
              <li>Export your data</li>
              <li>Withdraw consent</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Children&apos;s Privacy</h2>
            <p>Nigris is not intended for children under 13 years of age. We do not knowingly collect data from children.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Changes to This Policy</h2>
            <p>We may update this Privacy Policy periodically. Continued use of the platform after updates constitutes acceptance of the revised policy.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Contact</h2>
            <p>For questions regarding this Privacy Policy, contact:</p>
            <p className="mt-2"><a href="mailto:support@nigris.com" className="text-[#3b82f6] hover:underline">support@nigris.com</a></p>
          </div>
        </div>
      </section>
    </div>
  );
}
