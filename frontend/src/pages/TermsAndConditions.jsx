import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import { policyAPI } from '../services/api'

export default function TermsAndConditions() {
  const [policies, setPolicies] = useState(null)

  useEffect(() => {
    policyAPI.getPublic().then(({ data }) => setPolicies(data)).catch(() => {})
  }, [])

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 min-h-screen">
      <Link to="/register" className="flex items-center gap-2 text-trust-400 hover:text-brand-600 text-[10px] font-bold uppercase tracking-widest mb-10 transition-all group">
        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Register
      </Link>

      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-trust-900 rounded-2xl flex items-center justify-center shadow-xl">
          <ShieldCheck size={22} className="text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-display font-bold text-trust-900">Terms &amp; Conditions</h1>
          <p className="text-trust-400 font-body text-sm mt-1">LankaParts Marketplace - Effective: March 23, 2026</p>
        </div>
      </div>

      <div className="space-y-8 font-body text-trust-700 text-sm leading-relaxed">
        <section>
          <h2 className="text-lg font-display font-bold text-trust-900 mb-3">1. Acceptance of Terms</h2>
          <p>By creating an account on LankaParts, you agree to be bound by these Terms and Conditions. If you do not agree to any part of these terms, you must not use the platform. LankaParts reserves the right to update these terms at any time, and continued use of the platform constitutes acceptance of the revised terms.</p>
        </section>

        <section>
          <h2 className="text-lg font-display font-bold text-trust-900 mb-3">2. User Eligibility</h2>
          <p>You must be at least 18 years of age to register and use LankaParts. By registering, you confirm that all information you provide is accurate, current, and complete. You are solely responsible for maintaining the confidentiality of your account credentials.</p>
        </section>

        <section>
          <h2 className="text-lg font-display font-bold text-trust-900 mb-3">3. Listing Products (Sellers)</h2>
          <ul className="list-disc list-outside ml-5 space-y-2">
            {(policies?.terms_sections?.find(section => section.title === 'Seller Rules')?.items || [
              'Only items priced above LKR 1,000 are accepted on the platform.',
              'Listings are reviewed by LankaParts before they go live.',
              'The seller must pay the shipping cost when sending an item to the LankaParts warehouse.',
              'Seller must ship within 48 hours after LankaParts confirms the order.',
              'Payments are released after LankaParts verifies the part, and payout handling happens on Fridays.',
            ]).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-display font-bold text-trust-900 mb-3">4. Purchasing Items (Buyers)</h2>
          <ul className="list-disc list-outside ml-5 space-y-2">
            {(policies?.terms_sections?.find(section => section.title === 'Buyer Rules')?.items || [
              'Every order includes a shipping charge of LKR 450.',
              'The total payable amount is item price plus the shipping charge.',
              'Buyers should provide a correct shipping address before placing the order.',
              'LankaParts reviews and coordinates delivery for each order.',
            ]).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-display font-bold text-trust-900 mb-3">5. Brokerage &amp; Payment</h2>
          <p>
            LankaParts operates as an intermediary platform. All transactions are facilitated and secured by the LankaParts team. Seller earnings are released only after part verification, and payout handling is processed every {policies?.seller_payout_day || 'Friday'}.
          </p>
          <p className="mt-3">
            Sellers are responsible for paying the shipping cost to send items to the LankaParts warehouse.
          </p>
          <p className="mt-3">
            If a buyer rejects the part, LankaParts returns it and charges delivery cost.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-display font-bold text-trust-900 mb-3">6. Prohibited Activities</h2>
          <ul className="list-disc list-outside ml-5 space-y-2">
            <li>Listing counterfeit, stolen, or hazardous goods.</li>
            <li>Attempting to conduct transactions outside of the LankaParts platform.</li>
            <li>Providing false information in your profile or listings.</li>
            <li>Harassing other users or platform staff.</li>
            <li>Attempting to reverse engineer or compromise the platform's security.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-display font-bold text-trust-900 mb-3">7. Limitation of Liability</h2>
          <p>LankaParts provides a marketplace platform and is not responsible for the quality, safety, or legality of items listed by third-party sellers. While we strive to ensure platform security, LankaParts is not liable for any indirect, incidental, or consequential damages arising from the use of the platform.</p>
        </section>

        <section>
          <h2 className="text-lg font-display font-bold text-trust-900 mb-3">8. Privacy</h2>
          <p>Your personal information (name, phone, address, bank details) is used solely for facilitating transactions and verifying identity on the LankaParts platform. We do not sell your data to third parties. Seller contact details are kept private and never shared directly with buyers.</p>
        </section>

        <section>
          <h2 className="text-lg font-display font-bold text-trust-900 mb-3">9. Account Termination</h2>
          <p>LankaParts reserves the right to suspend or permanently terminate any account that violates these terms, without prior warning. Users may also request account deletion by contacting our support team.</p>
        </section>

        <section>
          <h2 className="text-lg font-display font-bold text-trust-900 mb-3">10. Contact</h2>
          <p>For any queries regarding these terms, please reach out to the LankaParts support team via the contact details provided on the platform. We are available Monday-Saturday, 9 AM-6 PM.</p>
        </section>
      </div>

      <div className="mt-12 p-6 bg-trust-50 rounded-3xl border border-trust-100 text-center">
        <p className="text-xs font-bold font-body text-trust-500 uppercase tracking-widest">By registering, you confirm you have read and agreed to these terms.</p>
        <Link to="/register" className="inline-block mt-4 btn-primary px-8">
          Back to Registration
        </Link>
      </div>
    </div>
  )
}
