import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import { policyAPI } from '../services/api'

const SINHALA_TERMS = {
  acceptance:
    'LankaParts හි ගිණුමක් සෑදීමෙන් ඔබ මෙම නියමයන් හා කොන්දේසි වලට එකඟ වන බව පිළිගනී. මෙම නියමයන්හි කිසියම් කොටසකට එකඟ නොවන්නේ නම්, ඔබ වේදිකාව භාවිතා නොකළ යුතුය. LankaParts අවශ්‍ය අවස්ථාවලදී මෙම නියමයන් යාවත්කාලීන කළ හැකි අතර, වේදිකාව අඛණ්ඩව භාවිතා කිරීම යාවත්කාලීන නියමයන් පිළිගැනීම ලෙස සැලකේ.',
  eligibility:
    'LankaParts සඳහා ලියාපදිංචි වී භාවිතා කිරීමට ඔබ අවම වශයෙන් වයස අවුරුදු 18 ක් විය යුතුය. ලියාපදිංචි වීමෙන් ඔබ ලබාදෙන සියලු තොරතුරු නිවැරදි, වත්මන් හා සම්පූර්ණ බව තහවුරු කරයි. ',
  sellerRules: [
    'LKR 1,000 ට වඩා වැඩි මිලක් ඇති භාණ්ඩ පමණක් වේදිකාවේ පිළිගනු ලැබේ.',
    'ලැයිස්තුගත කිරීම් සජීවී වීමට පෙර LankaParts විසින් සමාලෝචනය කරයි.',
    'ඇණවුම තහවුරු කළ පසු විකුණුම්කරු පැය 48 ක් ඇතුළත භාණ්ඩය LankaParts වෙත යැවිය යුතුය.',
  ],
  buyerRules: [
    'සම්පූර්ණ ගෙවිය යුතු මුදල භාණ්ඩ මිලට සහ ප්‍රවාහන ගාස්තුවට එකතුව වේ.',
    'සුදුසු ඇණවුම් සඳහා මුදල් ගෙවා භාණ්ඩ ලබාගැනීමේ සේවාව ලබාගත හැක.',
    'ඇණවුමක් කිරීමට පෙර නිවැරදි බෙදාහැරීමේ ලිපිනයක් ලබා දිය යුතුය.',
    'සෑම ඇණවුමක්ම LankaParts විසින් සමාලෝචනය කර බෙදාහැරීම සම්බන්ධීකරණය කරයි.',
  ],
  brokerage: [
    'LankaParts අතරමැදි වේදිකාවක් ලෙස ක්‍රියා කරයි. සියලු ගනුදෙනු LankaParts කණ්ඩායම විසින් පහසු කරමින් ආරක්ෂිත කරයි. විකුණුම්කරුවන්ගේ ආදායම භාණ්ඩය සත්‍යාපනය කළ පසු පමණක් නිකුත් කරන අතර ගෙවීම් සැකසීම සෑම සිකුරාදා දිනකම සිදු වේ.',
    'විකුණුම්කරුවන් භාණ්ඩය LankaParts ගබඩාව වෙත යැවීම සඳහා ප්‍රවාහන ගාස්තු දරනු ලැබේ.',
    'ගැනුම්කරු භාණ්ඩය ප්‍රතික්ෂේප කළහොත් LankaParts එය ආපසු යවා බෙදාහැරීමේ ගාස්තුව අය කරයි.',
  ],
  prohibited: [
    'ව්‍යාජ, සොරකම් කළ හෝ අනතුරුදායක භාණ්ඩ ලැයිස්තුගත කිරීම.',
    'LankaParts වේදිකාවෙන් පිටත ගනුදෙනු කිරීමට උත්සාහ කිරීම.',
    'ඔබගේ පැතිකඩ හෝ ලැයිස්තුගත කිරීම් වල වැරදි තොරතුරු ලබාදීම.',
    'වෙනත් භාවිතාකරුවන් හෝ වේදිකා කාර්ය මණ්ඩලයට හිංසා කිරීම.',
    'වේදිකාවේ ආරක්ෂාව බිඳ දමන්න හෝ ප්‍රතිනිර්මාණය කිරීමට උත්සාහ කිරීම.',
  ],
  liability:
    'LankaParts යනු වෙළඳපොළ වේදිකාවක් වන අතර තුන්වන පාර්ශ්ව විකුණුම්කරුවන් විසින් ලැයිස්තුගත කරන භාණ්ඩවල ගුණාත්මකභාවය, ආරක්ෂාව හෝ නීතිමය භාවය සඳහා වගකියනු ලැබේ. වේදිකාව ආරක්ෂිතව තබා ගැනීමට අප උත්සාහ කරන නමුත්, LankaParts භාවිතයෙන් ඇතිවන වක්‍ර හෝ අනුපූරක අලාභ සඳහා වගකීම් භාර නොගනී.',
  privacy:
    'ඔබගේ පුද්ගලික තොරතුරු වන නම, දුරකථන අංකය, ලිපිනය සහ බැංකු විස්තර, ගනුදෙනු පහසු කිරීම හා අනන්‍යතාව තහවුරු කිරීම සඳහා පමණක් භාවිතා කරයි. අපි ඔබගේ දත්ත තුන්වන පාර්ශ්වයන්ට විකුණන්නේ නැත. විකුණුම්කරුගේ සම්බන්ධතා විස්තර ගැනුම්කරුවන්ට සෘජුවම ලබා නොදේ.',
  termination:
    'මෙම නියමයන් උල්ලංඝනය කරන ගිණුම් කිසිදු පෙර අවවාදයක් නොමැතිව තාවකාලිකව හෝ ස්ථිරව අත්හිටුවීමට LankaParts හට අයිතිය ඇත. භාවිතාකරුවන්ට ද සහාය කණ්ඩායම අමතා ගිණුම මකා දැමීමට ඉල්ලීමක් කළ හැක.',
  contact:
    'මෙම නියමයන් පිළිබඳ ප්‍රශ්න ඇත්නම්, වේදිකාවේ ඇති සම්බන්ධතා විස්තර හරහා LankaParts සහාය කණ්ඩායම අමතන්න. අපි සඳුදා සිට සෙනසුරාදා දක්වා උදේ 9 සිට සවස 6 දක්වා සේවය සපයන්නෙමු.',
  confirmation:
    'ලියාපදිංචි වීමෙන් ඔබ මෙම නියමයන් ඉතා හොඳින් කියවා ඒවාට එකඟ වූ බව තහවුරු කරයි.',
}

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

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-8 rounded-[2rem] border border-trust-100 bg-white p-6 font-body text-sm leading-relaxed text-trust-700 shadow-sm">
          <div className="border-b border-trust-100 pb-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-600">English</p>
            <h2 className="mt-2 text-2xl font-display font-bold text-trust-900">Terms &amp; Conditions</h2>
          </div>

          <section>
            <h2 className="mb-3 text-lg font-display font-bold text-trust-900">1. Acceptance of Terms</h2>
            <p>By creating an account on LankaParts, you agree to be bound by these Terms and Conditions. If you do not agree to any part of these terms, you must not use the platform. LankaParts reserves the right to update these terms at any time, and continued use of the platform constitutes acceptance of the revised terms.</p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-display font-bold text-trust-900">2. User Eligibility</h2>
            <p>You must be at least 18 years of age to register and use LankaParts. By registering, you confirm that all information you provide is accurate, current, and complete. You are solely responsible for maintaining the confidentiality of your account credentials.</p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-display font-bold text-trust-900">3. Listing Products (Sellers)</h2>
            <ul className="list-disc list-outside ml-5 space-y-2">
              <li>LankaParts charges a service fee of LKR 250 for each listing.</li>
              {(policies?.terms_sections?.find(section => section.title === 'Seller Rules')?.items || [
                'Only items priced above LKR 1,000 are accepted on the platform.',
                'Listings are reviewed by LankaParts before they go live.',
                'Seller must ship within 48 hours after LankaParts confirms the order.',
              ]).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-display font-bold text-trust-900">4. Purchasing Items (Buyers)</h2>
            <ul className="list-disc list-outside ml-5 space-y-2">
              {(policies?.terms_sections?.find(section => section.title === 'Buyer Rules')?.items || [
                'Every order includes a shipping charge of LKR 450.',
                'The total payable amount is item price plus the shipping charge.',
                'Cash on delivery is available for eligible orders.',
                'Buyers should provide a correct shipping address before placing the order.',
                'LankaParts reviews and coordinates delivery for each order.',
              ]).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-display font-bold text-trust-900">5. Brokerage &amp; Payment</h2>
            <p>
              LankaParts operates as an intermediary platform. All transactions are facilitated and secured by the LankaParts team. Seller earnings are released only after part verification, and payout handling is processed every {policies?.seller_payout_day || 'Friday'}.
            </p>
            <p className="mt-3">
              LankaParts charges a service fee of LKR 250 for each seller listing.
            </p>
            <p className="mt-3">
              Sellers are responsible for paying the shipping cost to send items to the LankaParts warehouse.
            </p>
            <p className="mt-3">
              If a buyer rejects the part, LankaParts returns it and charges delivery cost.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-display font-bold text-trust-900">6. Prohibited Activities</h2>
            <ul className="list-disc list-outside ml-5 space-y-2">
              <li>Listing counterfeit, stolen, or hazardous goods.</li>
              <li>Attempting to conduct transactions outside of the LankaParts platform.</li>
              <li>Providing false information in your profile or listings.</li>
              <li>Harassing other users or platform staff.</li>
              <li>Attempting to reverse engineer or compromise the platform's security.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-display font-bold text-trust-900">7. Limitation of Liability</h2>
            <p>LankaParts provides a marketplace platform and is responsible for the quality, safety, or legality of items listed by third-party sellers. While we strive to ensure platform security, LankaParts is not liable for any indirect, incidental, or consequential damages arising from the use of the platform.</p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-display font-bold text-trust-900">8. Privacy</h2>
            <p>Your personal information (name, phone, address, bank details) is used solely for facilitating transactions and verifying identity on the LankaParts platform. We do not sell your data to third parties. Seller contact details are kept private and never shared directly with buyers.</p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-display font-bold text-trust-900">9. Account Termination</h2>
            <p>LankaParts reserves the right to suspend or permanently terminate any account that violates these terms, without prior warning. Users may also request account deletion by contacting our support team.</p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-display font-bold text-trust-900">10. Contact</h2>
            <p>For any queries regarding these terms, please reach out to the LankaParts support team via the contact details provided on the platform. We are available Monday-Saturday, 9 AM-6 PM.</p>
          </section>
        </div>

        <div className="space-y-8 rounded-[2rem] border border-brand-100 bg-brand-50/40 p-6 text-sm leading-relaxed text-trust-700 shadow-sm">
          <div className="border-b border-brand-100 pb-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-600">සිංහල</p>
            <h2 className="mt-2 text-2xl font-bold text-trust-900">නියමයන් සහ කොන්දේසි</h2>
          </div>

          <section>
            <h2 className="mb-3 text-lg font-bold text-trust-900">1. නියමයන් පිළිගැනීම</h2>
            <p>{SINHALA_TERMS.acceptance}</p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-trust-900">2. භාවිතාකරු සුදුසුකම්</h2>
            <p>{SINHALA_TERMS.eligibility}</p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-trust-900">3. භාණ්ඩ ලැයිස්තුගත කිරීම (විකුණුම්කරුවන්)</h2>
            <ul className="list-disc list-outside ml-5 space-y-2">
              <li>LankaParts වෙබ් අඩවියේ ලැයිස්තුගත කරන සෑම භාණ්ඩයකටම රු. 250ක සේවා ගාස්තුවක් අය කෙරේ. මෙම ගාස්තුව භාණ්ඩයේ විකුණුම් මිලට එකතු වේ.</li>
              {SINHALA_TERMS.sellerRules.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-trust-900">4. භාණ්ඩ මිලදී ගැනීම (ගැනුම්කරුවන්)</h2>
            <ul className="list-disc list-outside ml-5 space-y-2">
              {SINHALA_TERMS.buyerRules.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-trust-900">5. අතරමැදි සේවාව සහ ගෙවීම්</h2>
            <p className="mt-3 first:mt-0">
              LankaParts විසින් සෑම ලැයිස්තුගත කිරීමකටම LKR 250 ක සේවා ගාස්තුවක් අය කරයි.
            </p>
            {SINHALA_TERMS.brokerage.map((item) => (
              <p key={item} className="mt-3 first:mt-0">
                {item}
              </p>
            ))}
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-trust-900">6. තහනම් ක්‍රියාකාරකම්</h2>
            <ul className="list-disc list-outside ml-5 space-y-2">
              {SINHALA_TERMS.prohibited.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-trust-900">7. වගකීම් සීමා කිරීම</h2>
            <p>{SINHALA_TERMS.liability}</p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-trust-900">8. පුද්ගලිකත්වය</h2>
            <p>{SINHALA_TERMS.privacy}</p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-trust-900">9. ගිණුම් අවසන් කිරීම</h2>
            <p>{SINHALA_TERMS.termination}</p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-trust-900">10. සම්බන්ධ වීම</h2>
            <p>{SINHALA_TERMS.contact}</p>
          </section>
        </div>
      </div>

      <div className="mt-12 p-6 bg-trust-50 rounded-3xl border border-trust-100 text-center">
        <p className="text-xs font-bold font-body text-trust-500 uppercase tracking-widest">By registering, you confirm you have read and agreed to these terms.</p>
        <p className="mt-3 text-sm text-trust-600">{SINHALA_TERMS.confirmation}</p>
        <Link to="/register" className="inline-block mt-4 btn-primary px-8">
          Back to Registration
        </Link>
      </div>
    </div>
  )
}
