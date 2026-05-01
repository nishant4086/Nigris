export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    // Already loaded
    if (typeof (window as any).Razorpay !== "undefined") {
      return resolve(true);
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}
