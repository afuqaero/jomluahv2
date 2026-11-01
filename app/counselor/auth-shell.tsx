import type { ReactNode } from "react";
import { ChartNoAxesCombined, ShieldCheck, UsersRound } from "lucide-react";

export function CounselorAuthShell({
  children,
  title,
  description,
  compact = false,
}: {
  children: ReactNode;
  title: string;
  description: string;
  compact?: boolean;
}) {
  return (
    <main className="min-h-screen overflow-x-hidden bg-white font-sans text-[#151b3b]">
      <div className="grid min-h-screen w-full min-w-0 lg:grid-cols-[57.5%_42.5%]">
        <section className="relative isolate flex min-h-[460px] min-w-0 flex-col justify-center overflow-hidden bg-[#f0f1ff] px-7 py-12 sm:px-12 lg:min-h-0 lg:px-[5.5vw] lg:py-16">
          <div aria-hidden="true" className="absolute -right-24 -top-64 -z-10 h-[620px] w-[620px] rounded-full bg-[#d9d9ff]/75" />
          <div aria-hidden="true" className="absolute -right-36 -top-52 -z-10 h-[650px] w-[650px] rounded-full border-[34px] border-white/35" />
          <div aria-hidden="true" className="absolute -bottom-[440px] -left-52 -z-10 h-[660px] w-[112%] rotate-[-8deg] rounded-[50%] bg-[#d6d4ff]/90" />
          <div aria-hidden="true" className="absolute -bottom-[490px] -left-44 -z-10 h-[660px] w-[116%] rotate-[-8deg] rounded-[50%] border-t-[30px] border-white/30" />
          <div className="mx-auto w-full max-w-[760px]">
            <p className="mb-8 text-[11px] font-bold uppercase tracking-[0.28em] text-[#5146dc]">JomLuah counselor portal</p>
            <h1 className="max-w-[700px] text-[clamp(2.75rem,6.3vw,5.5rem)] font-extrabold leading-[1.02] tracking-[-0.055em] text-[#101936]">A clearer<br />view of care.</h1>
            <p className="mt-6 max-w-[590px] text-base leading-7 text-[#56617e] sm:mt-7 sm:text-lg sm:leading-8">A private space for university counselors to view assigned students’ shared mood check-ins and offer thoughtful support.</p>
            <div className="mt-9 grid max-w-[720px] grid-cols-1 gap-5 sm:mt-16 sm:grid-cols-3 sm:gap-8">
              {([
                [ShieldCheck, "Private by design", "Chats and journals stay private."],
                [UsersRound, "Assigned students", "Access is limited to your roster."],
                [ChartNoAxesCombined, "Shared check-ins", "See moods students choose to share."],
              ] as const).map(([Icon, heading, detail]) => (
                <div key={heading} className="flex items-center gap-3 sm:block sm:max-w-[180px]">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#d8daf7] bg-[#e4e5ff] text-[#5146dc] sm:mb-4 sm:h-16 sm:w-16" aria-hidden="true">
                    <Icon className="h-5 w-5 sm:h-7 sm:w-7" strokeWidth={1.75} />
                  </span>
                  <div>
                    <h2 className="text-sm font-bold leading-5 text-[#151b3b] sm:text-lg sm:leading-6">{heading}</h2>
                    <p className="mt-1 text-xs leading-5 text-[#66708b] sm:mt-2 sm:text-sm sm:leading-6">{detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={`flex min-w-0 items-center justify-center bg-white px-5 sm:px-12 lg:px-[5.5vw] ${compact ? "py-8 sm:py-10" : "py-12 sm:py-14"}`}>
          <div className="w-full min-w-0 max-w-[510px]">
            <p className={`${compact ? "mb-3" : "mb-5"} text-[11px] font-bold uppercase tracking-[0.28em] text-[#5146dc]`}>JomLuah</p>
            <h2 className="text-3xl font-extrabold leading-tight tracking-[-0.04em] text-[#101936] sm:text-4xl">{title}</h2>
            <p className={`${compact ? "mt-2 text-sm leading-5" : "mt-4 text-base leading-7"} text-[#59617e]`}>{description}</p>
            {children}
            {!compact && <p className="mt-5 text-center text-xs leading-5 text-[#68708b]">For access support, contact your JomLuah administrator.</p>}
          </div>
        </section>
      </div>
    </main>
  );
}

export const counselorInputClass = "mt-2 min-h-12 w-full rounded-xl border border-[#d5daeb] bg-white px-4 text-base text-[#1c1a48] shadow-sm outline-none transition placeholder:text-[#8188a2] focus:border-[#6366F1] focus:ring-4 focus:ring-[#6366F1]/15";

export const counselorButtonClass = "inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[#6366F1] px-5 text-sm font-bold text-white transition hover:bg-[#4F46E5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4F46E5] disabled:cursor-not-allowed disabled:opacity-55";
