"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkle, Eyedropper, Flame, Compass, Heart } from "@phosphor-icons/react";

export function PreviewBar() {
  const pathname = usePathname();

  const designs = [
    { id: "combo", name: "✨ Design 1+4 Combo (Journal Focus)", href: "/preview/combo", icon: Heart },
    { id: "design1", name: "Design 1: Interactive Hero", href: "/preview/design1", icon: Sparkle },
    { id: "design2", name: "Design 2: Venting Box Focus", href: "/preview/design2", icon: Flame },
    { id: "design3", name: "Design 3: Minimalist Zen", href: "/preview/design3", icon: Compass },
    { id: "design4", name: "Design 4: Serene Editorial", href: "/preview/design4", icon: Eyedropper },
  ];

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-slate-900/90 backdrop-blur-md text-white py-2 px-4 shadow-xl border-b border-indigo-500/30 flex flex-wrap items-center justify-between gap-3 text-xs font-sans">
      <div className="flex items-center gap-2">
        <span className="bg-indigo-600 text-white font-bold px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wider">
          Design Preview Mode
        </span>
        <span className="text-slate-300 hidden sm:inline">
          Same codebase color theme (#eef2ff, #6366f1, #1e1b4b)
        </span>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto py-1">
        {designs.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (pathname === "/preview" && item.id === "combo");
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium transition-all text-xs whitespace-nowrap ${
                isActive
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/40 ring-1 ring-indigo-400 font-bold"
                  : "bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white"
              }`}
            >
              <Icon weight={isActive ? "fill" : "regular"} className="w-3.5 h-3.5" />
              {item.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
