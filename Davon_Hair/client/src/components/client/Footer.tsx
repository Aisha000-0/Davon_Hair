import React from 'react'

export default function Footer() {
  return (
    <footer className="py-24 bg-[var(--ink)] text-[var(--smoke)]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 mb-12">
          <div className="col-span-2 lg:col-span-1">
            <h3 className="text-2xl font-serif font-bold text-[var(--gold)] mb-4">
              DEVON KUXURY WIGS
            </h3>
            <p className="text-[var(--smoke)] leading-relaxed">
              Premium hand-tied luxury wigs crafted from 100% raw human hair. Elevate your confidence, express your style.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-serif font-bold text-[var(--gold)] mb-3">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="/shop" className="hover:text-[var(--champagne)] transition-colors">Shop</a></li>
              <li><a href="/account" className="hover:text-[var(--champagne)] transition-colors">Account</a></li>
              <li><a href="/contact" className="hover:text-[var(--champagne)] transition-colors">Contact</a></li>
              <li><a href="/about" className="hover:text-[var(--champagne)] transition-colors">About</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-serif font-bold text-[var(--gold)] mb-3">Customer Service</h4>
            <ul className="space-y-2">
              <li><a href="/faqs" className="hover:text-[var(--champagne)] transition-colors">FAQ</a></li>
              <li><a href="/delivery" className="hover:text-[var(--champagne)] transition-colors">Delivery</a></li>
              <li><a href="/returns" className="hover:text-[var(--champagne)] transition-colors">Returns</a></li>
              <li><a href="/privacy" className="hover:text-[var(--champagne)] transition-colors">Privacy</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-charcoal pt-8 flex flex-col sm:flex-row justify-between align-items-center gap-4">
          <p className="text-sm">
            &copy; {new Date().getFullYear()} DEVON KUXURY WIGS. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a
              href="#"
              className="text-[var(--champagne)] hover:text-[var(--gold)] transition-colors"
            >
              Instagram
            </a>
            <a
              href="#"
              className="text-[var(--champagne)] hover:text-[var(--gold)] transition-colors"
            >
              TikTok
            </a>
            <a
              href="#"
              className="text-[var(--champagne)] hover:text-[var(--gold)] transition-colors"
            >
              Facebook
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}