export const metadata = {
  title: "About Us | Nigris",
  description: "Learn more about the mission and vision behind Nigris.",
};

export default function AboutPage() {
  return (
    <div className="bg-slate-50 py-24 sm:py-32 h-full">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:mx-0">
          <h2 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
            About Nigris
          </h2>
          <p className="mt-6 text-lg leading-8 text-slate-600">
            We are building the complete infrastructure for modern API products. 
            Nigris helps developers ship faster, meter usage perfectly, and monetize 
            their APIs without writing boilerplate backend code.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl lg:mx-0 lg:max-w-none">
          <div className="grid grid-cols-1 gap-x-8 gap-y-16 lg:grid-cols-2">
            <div>
              <h3 className="text-2xl font-bold tracking-tight text-slate-900">Our Mission</h3>
              <p className="mt-4 text-base leading-7 text-slate-600">
                Building an API should be about the core business logic, not about setting up 
                rate limits, generating API keys, metering usage, and managing Stripe webhooks.
                Our mission is to democratize API monetization by providing a beautiful, unified 
                dashboard that handles all of this out-of-the-box.
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-bold tracking-tight text-slate-900">Our Vision</h3>
              <p className="mt-4 text-base leading-7 text-slate-600">
                We envision a world where anyone can launch a highly-available, perfectly metered, 
                and beautifully documented API product in a single weekend. By abstracting away 
                the complexities of infrastructure and billing, we empower creators to focus on 
                what truly matters: building great products.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
