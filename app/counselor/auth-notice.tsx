"use client";

import { useEffect } from "react";
import { CheckCircle, X } from "@phosphor-icons/react";

export function CounselorAuthNotice({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const timeout = window.setTimeout(onClose, 5000);
    return () => window.clearTimeout(timeout);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#151b3b]/20 px-5 py-6" onClick={onClose}>
      <section role="status" aria-live="polite" className="relative w-full max-w-md rounded-2xl border border-[#d8daed] bg-white p-6 shadow-[0_24px_70px_rgba(21,27,59,0.22)] sm:p-7" onClick={(event) => event.stopPropagation()}>
        <button type="button" onClick={onClose} aria-label="Dismiss notification" className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full text-[#68708b] transition hover:bg-[#f2f3fc] hover:text-[#151b3b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4F46E5]">
          <X size={19} aria-hidden="true" />
        </button>
        <span aria-hidden="true" className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-[#eef2ff] text-[#4F46E5]"><CheckCircle size={27} weight="fill" /></span>
        <h2 className="pr-8 text-xl font-bold tracking-tight text-[#151b3b]">Registration successful</h2>
        <p className="mt-2 text-sm leading-6 text-[#59617e]">Your account is ready. Please wait for an administrator to assign your counselor role before signing in to the counselor portal.</p>
        <p className="mt-4 text-xs text-[#68708b]">This notice will close automatically.</p>
      </section>
    </div>
  );
}
