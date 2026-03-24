import { useEffect, useState } from 'react'

export const NOTICE_KEY = 'site_notice_hidden_v1'

export default function SiteNoticeModal({ onAcknowledge, onClose }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const hidden = sessionStorage.getItem(NOTICE_KEY)
    if (!hidden) {
      setOpen(true)
    }
  }, [])

  const closeNotice = () => {
    sessionStorage.setItem(NOTICE_KEY, 'true')
    setOpen(false)
    onAcknowledge?.()
  }

  const dismissNotice = () => {
    setOpen(false)
    onClose?.()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-trust-950/40 backdrop-blur-sm" onClick={dismissNotice} />
      <div className="relative w-full max-w-lg rounded-[2rem] border border-amber-200 bg-white p-6 sm:p-8 shadow-2xl">
        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-amber-700">Important Notice</p>
        <h2 className="mb-4 text-2xl font-display font-bold text-trust-900">Temporary Shipping Update</h2>
        <p className="text-sm leading-relaxed text-trust-700">
          Due to the fuel crisis, shipping costs may increase temporarily. The charges will be reduced after the crisis is over. Sorry for the inconvenience.
        </p>
        <div className="mt-6 flex justify-end">
          <button onClick={closeNotice} className="btn-primary px-6 py-3">
            I Understand
          </button>
        </div>
      </div>
    </div>
  )
}
