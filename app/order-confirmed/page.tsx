import Link from 'next/link'

// Stripe redirects here with ?session_id=... after successful payment.
// The actual order processing happens in the webhook — this page is just
// a friendly confirmation. Never use the session_id here to confirm the order.

export default function OrderConfirmed() {
  return (
    <main className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="max-w-lg text-center animate-fade-up">

        <div className="text-6xl mb-8">🍦</div>

        <h1 className="font-serif text-4xl text-navy mb-4">
          Your dream is in the making.
        </h1>

        <p className="text-navy/60 mb-6 leading-relaxed">
          We've received your order and are already thinking about how to make it perfect.
          You'll get a confirmation email shortly with all the details.
        </p>

        <div className="bg-white border border-navy/10 rounded-xl px-6 py-5 mb-8 text-left">
          <h2 className="font-serif text-lg text-navy mb-3">What happens next</h2>
          <ol className="space-y-2 text-sm text-navy/70">
            <li className="flex gap-3">
              <span className="text-forest font-bold">1.</span>
              You'll receive an order confirmation email within a few minutes.
            </li>
            <li className="flex gap-3">
              <span className="text-forest font-bold">2.</span>
              We'll make your flavor fresh — every batch is hand-crafted to your spec.
            </li>
            <li className="flex gap-3">
              <span className="text-forest font-bold">3.</span>
              Your order ships the next qualifying Monday (minimum 3 days from order).
            </li>
          </ol>
        </div>

        <Link
          href="/"
          className="inline-block bg-navy text-cream font-serif text-lg px-8 py-4 rounded-xl hover:bg-navy/90 transition-opacity"
        >
          Create Another Flavor
        </Link>

        <p className="text-navy/30 text-xs mt-6">
          Questions? Email us at hello@legendairyicecream.com
        </p>
      </div>
    </main>
  )
}
