import Link from 'next/link'

// Stripe redirects here with ?session_id=... after successful payment.
// The actual order processing happens in the webhook — this page is just
// a friendly confirmation. Never use the session_id here to confirm the order.

export default function OrderConfirmed() {
  return (
    <main className="min-h-[calc(100vh-3.5rem)] bg-black flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center animate-fade-up">

        <div className="text-6xl mb-8">🍦</div>

        {/* Diamond separator */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="h-px w-16 bg-[#C9A96E]/30" />
          <span className="text-[#C9A96E]/50 text-xs">◇</span>
          <div className="h-px w-16 bg-[#C9A96E]/30" />
        </div>

        <h1 className="font-serif text-4xl text-white mb-4">
          Your dream is in the making.
        </h1>

        <p className="text-white/40 mb-6 leading-relaxed text-sm">
          We&apos;ve received your order and are already thinking about how to make it perfect.
          You&apos;ll get a confirmation email shortly with all the details.
        </p>

        <div className="bg-[#0D0D0D] border border-white/8 rounded-xl px-6 py-5 mb-8 text-left">
          <h2 className="font-serif text-lg text-white mb-4">What happens next</h2>
          <ol className="space-y-3 text-sm text-white/50">
            <li className="flex gap-3">
              <span className="text-[#C9A96E] font-bold flex-shrink-0">1.</span>
              You&apos;ll receive an order confirmation email within a few minutes.
            </li>
            <li className="flex gap-3">
              <span className="text-[#C9A96E] font-bold flex-shrink-0">2.</span>
              We&apos;ll make your flavor fresh — every batch is hand-crafted to your spec.
            </li>
            <li className="flex gap-3">
              <span className="text-[#C9A96E] font-bold flex-shrink-0">3.</span>
              Your order ships the next qualifying Monday (minimum 3 days from order).
            </li>
          </ol>
        </div>

        <Link
          href="/"
          className="
            inline-block bg-[#C9A96E] text-black text-xs font-medium
            uppercase tracking-[0.25em] px-10 py-4 rounded-lg
            hover:bg-[#D4B47A] transition-colors
          "
        >
          Create Another Flavor ✦
        </Link>

        <p className="text-white/20 text-xs mt-6">
          Questions? Email us at hello@legendairyicecream.com
        </p>
      </div>
    </main>
  )
}
