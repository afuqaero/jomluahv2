import Link from "next/link";
import type { ReactNode } from "react";

export function CounselorAuthShell({
  children,
  eyebrow,
  title,
  description,
}: {
  children: ReactNode;
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <main className="min-h-screen bg-[#f5f6ff] text-[#1c1a48]">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <Link href="/counselor/login" className="flex items-center gap-3 rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#4F46E5]">
          <span aria-hidden="true" className="grid h-10 w-10 place-items-center rounded-xl bg-[#6366F1] text-sm font-extrabold tracking-tight text-white">JL</span>
          <span className="leading-tight">
            <span className="block text-sm font-bold tracking-tight">JomLuah</span>
            <span className="mt-0.5 block text-[10px] font-bold uppercase tracking-[0.16em] text-[#6b7190]">Counselor portal</span>
          </span>
        </Link>
        <Link href="/login" className="rounded-lg px-3 py-2 text-sm font-semibold text-[#393b64] transition hover:bg-white hover:text-[#4F46E5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4F46E5]">
          Student portal
        </Link>
      </header>

      <div className="mx-auto grid w-full max-w-7xl gap-8 px-5 pb-10 pt-4 sm:px-8 lg:min-h-[calc(100vh-80px)] lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:pb-16 lg:pt-2">
        <section className="relative isolate overflow-hidden rounded-[1.6rem] bg-gradient-to-br from-[#6366F1] to-[#4F46E5] px-7 py-9 text-white sm:px-10 sm:py-12 lg:min-h-[540px] lg:rounded-[2rem] lg:px-12 lg:py-14">
          <div aria-hidden="true" className="absolute inset-0 -z-10 opacity-30" style={{ backgroundImage: "linear-gradient(90deg, transparent 49.8%, rgba(224,231,255,.25) 50%, transparent 50.2%), linear-gradient(0deg, transparent 49.8%, rgba(224,231,255,.2) 50%, transparent 50.2%)", backgroundSize: "72px 72px" }} />
          <div aria-hidden="true" className="absolute -bottom-24 -right-20 -z-10 h-72 w-72 rounded-full border border-white/20" />
          <div aria-hidden="true" className="absolute -bottom-12 -right-8 -z-10 h-52 w-52 rounded-full border border-white/25" />
          <div className="flex h-full min-h-[360px] flex-col justify-between gap-12 lg:min-h-[428px]">
            <p className="text-xs font-bold uppercase tracking-[0.19em] text-[#e0e7ff]">Student wellbeing · staff access</p>
            <div>
              <p className="mb-4 text-sm font-semibold text-[#e0e7ff]">A view built for care teams</p>
              <h1 className="max-w-xl text-4xl font-semibold leading-[1.08] tracking-[-0.045em] sm:text-5xl">See the mood trend. Keep the story private.</h1>
              <p className="mt-6 max-w-lg text-base leading-7 text-[#eef2ff]">Counselors can view shared morning and evening check-ins for students assigned to them. Their chats and journal entries stay private.</p>
            </div>
            <div className="flex items-center gap-3 border-t border-white/25 pt-5 text-sm text-[#eef2ff]">
              <span aria-hidden="true" className="grid h-8 w-8 place-items-center rounded-full border border-white/40 text-white">✓</span>
              <span>Access follows each student’s sharing choice.</span>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-[480px] py-3 lg:py-10">
          <div className="mb-7">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.17em] text-[#4F46E5]">{eyebrow}</p>
            <h2 className="text-3xl font-semibold tracking-[-0.04em] text-[#1c1a48] sm:text-[2.15rem]">{title}</h2>
            <p className="mt-3 text-sm leading-6 text-[#59617e]">{description}</p>
          </div>
          {children}
          <p className="mt-7 text-center text-xs leading-5 text-[#68708b]">For access support, contact your JomLuah administrator.</p>
        </section>
      </div>
    </main>
  );
}

export const counselorInputClass = "mt-2 min-h-12 w-full rounded-xl border border-[#d5daeb] bg-white px-4 text-base text-[#1c1a48] shadow-sm outline-none transition placeholder:text-[#8188a2] focus:border-[#6366F1] focus:ring-4 focus:ring-[#6366F1]/15";

export const counselorButtonClass = "inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[#6366F1] px-5 text-sm font-bold text-white transition hover:bg-[#4F46E5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4F46E5] disabled:cursor-not-allowed disabled:opacity-55";
