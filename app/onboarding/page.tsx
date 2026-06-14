"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Sparkle } from "@phosphor-icons/react";
import { supabase } from "../lib/supabaseClient";
import { useInactivityLogout } from "../lib/useInactivityLogout";

function CuteRobotFace({ className }: { className?: string }) {
  return (
    <div className={`relative w-28 h-28 rounded-full bg-white flex items-center justify-center shadow-lg ${className}`}>
      <svg viewBox="0 0 100 100" className="w-20 h-20">
        <rect x="20" y="25" width="60" height="55" rx="26" fill="#f3f4f6" />
        <rect x="23" y="28" width="54" height="49" rx="23" fill="#ffffff" />
        <path d="M 23 42 A 23 23 0 0 1 77 42 Z" fill="#e5e7eb" />
        <line x1="50" y1="28" x2="50" y2="42" stroke="#d1d5db" strokeWidth="2" />
        <circle cx="50" cy="18" r="4" fill="#fbbf24" />
        <line x1="50" y1="18" x2="50" y2="25" stroke="#fbbf24" strokeWidth="2" />
        <circle cx="38" cy="54" r="5" fill="#312e81" />
        <circle cx="62" cy="54" r="5" fill="#312e81" />
        <circle cx="28" cy="62" r="4" fill="#fbcfe8" />
        <circle cx="72" cy="62" r="4" fill="#fbcfe8" />
        <path d="M 42 63 Q 50 71 58 63" stroke="#312e81" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      </svg>
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  useInactivityLogout();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Wizard state: 1 (intro) | 2 (age) | 3 (gender) | 4 (mental illness) | 5 (goals) | 6 (success)
  const [step, setStep] = useState<number>(1);
  const [errorMsg, setErrorMsg] = useState("");

  // Answers states
  const [age, setAge] = useState<number | "">("");
  const [gender, setGender] = useState<"Male" | "Female" | "">("");
  const [selectedIllness, setSelectedIllness] = useState<string[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  const mentalIllnessOptions = [
    "Anxiety",
    "Depression",
    "ADHD",
    "PTSD",
    "Bipolar Disorder",
    "OCD",
    "Eating Disorder",
    "Other",
    "None / Rather not say"
  ];

  const goalOptions = [
    "Track my mood trends",
    "Chat with my AI companion",
    "Write private journals",
    "Manage daily tasks",
    "Practice mindfulness",
    "Reflect on old memories"
  ];

  // Auth session check
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push("/login?redirectTo=/onboarding");
        } else {
          setUserId(session.user.id);
          setUserEmail(session.user.email || null);

          // Check if user wants to reset onboarding
          const searchParams = new URLSearchParams(window.location.search);
          if (searchParams.get("reset") === "true") {
            // Clear the onboarding completed cookie
            document.cookie = "jl_ob=; path=/; max-age=0; SameSite=Lax";
            
            // Set onboarding completed to false in DB
            await supabase
              .from("profiles")
              .upsert({
                id: session.user.id,
                email: session.user.email || null,
                onboarding_completed: false
              });

            // Replace URL to clean up query param without reloading/redirect loop
            router.replace("/onboarding");
            setStep(1);
            setLoading(false);
            return;
          }

          // Check if user already finished onboarding
          const { data: profile, error } = await supabase
            .from("profiles")
            .select("onboarding_completed")
            .eq("id", session.user.id)
            .single();

          if (error) {
            console.error("Error fetching onboarding profile:", error);
            // If the profile doesn't exist yet or query fails, let them proceed with onboarding to create/update it
            setLoading(false);
          } else if (profile?.onboarding_completed) {
            document.cookie = "jl_ob=1; path=/; max-age=31536000; SameSite=Lax";
            router.push("/dashboard");
          } else {
            setLoading(false);
          }
        }
      } catch (err) {
        console.error("Onboarding session check failed:", err);
        setLoading(false);
      }
    };
    checkSession();
  }, [router]);

  const handleNext = () => {
    setErrorMsg("");

    if (step === 2) {
      if (!age || Number(age) <= 0 || Number(age) > 120) {
        setErrorMsg("Please enter a valid age between 1 and 120");
        return;
      }
    } else if (step === 3) {
      if (!gender) {
        setErrorMsg("Please select your gender");
        return;
      }
    } else if (step === 4) {
      if (selectedIllness.length === 0) {
        setErrorMsg("Please select at least one option (choose 'None' if applicable)");
        return;
      }
    } else if (step === 5) {
      if (selectedGoals.length === 0) {
        setErrorMsg("Please select at least one goal");
        return;
      }
      // Save answers and move to success step
      saveOnboardingData();
      return;
    }

    setStep(step + 1);
  };

  const handleBack = () => {
    setErrorMsg("");
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const toggleIllness = (option: string) => {
    setErrorMsg("");
    if (option === "None / Rather not say") {
      setSelectedIllness(["None / Rather not say"]);
      return;
    }

    let updated = [...selectedIllness].filter((item) => item !== "None / Rather not say");
    if (updated.includes(option)) {
      updated = updated.filter((item) => item !== option);
    } else {
      updated.push(option);
    }
    setSelectedIllness(updated);
  };

  const toggleGoal = (option: string) => {
    setErrorMsg("");
    if (selectedGoals.includes(option)) {
      setSelectedGoals(selectedGoals.filter((item) => item !== option));
    } else {
      setSelectedGoals([...selectedGoals, option]);
    }
  };

  const saveOnboardingData = async () => {
    if (!userId) return;
    setSaving(true);
    setErrorMsg("");

    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: userId,
          email: userEmail,
          onboarding_completed: true,
          age: Number(age),
          gender,
          mental_history: selectedIllness,
          goals: selectedGoals
        });

      if (error) {
        setErrorMsg(error.message);
      } else {
        // Set lightweight cookie so middleware can skip the DB profile query on every request
        document.cookie = "jl_ob=1; path=/; max-age=31536000; SameSite=Lax";
        setStep(6);
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to save details");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-[#6366f1] to-[#4f46e5]">
        <div className="text-white text-xl font-bold tracking-wider animate-pulse">Loading setup...</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-[#6366f1] to-[#4f46e5] overflow-hidden font-sans">
      <div aria-hidden="true" className="absolute -top-24 -left-24 w-[600px] h-[600px] bg-blue-500 rounded-full blur-[120px] opacity-25 pointer-events-none z-0" />
      <div aria-hidden="true" className="absolute -bottom-24 -right-24 w-[500px] h-[500px] bg-purple-500 rounded-full blur-[120px] opacity-25 pointer-events-none z-0" />

      <div key={step} className="relative z-10 w-full max-w-[460px] min-h-screen flex flex-col justify-between py-12 px-6 animate-page-entrance">
        
        {/* Header Back Button */}
        <header className="flex items-center justify-start w-full mb-8 min-h-[38px]">
          {step > 1 && step < 6 && (
            <button onClick={handleBack} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 hover:border-white/30 transition-all text-sm font-bold cursor-pointer hover:scale-[1.02] active:scale-[0.98]">
              <ArrowLeft weight="bold" className="w-4 h-4" />
              <span>Back</span>
            </button>
          )}
        </header>

        {/* Wizard Main Content */}
        <div className="text-center flex-1 flex flex-col justify-center mb-8">
          <CuteRobotFace className="mx-auto mb-8 hover:scale-105 hover:-translate-y-1 transition-all duration-300 cursor-pointer" />

          {/* Step titles */}
          <h2 className="text-2xl sm:text-3xl font-extrabold leading-snug text-white mb-6 max-w-[380px] mx-auto">
            {step === 1 && "Welcome to JomLuah! Let's personalize your private space."}
            {step === 2 && "First, how old are you?"}
            {step === 3 && "What is your gender?"}
            {step === 4 && "Do you have any past history of mental illness?"}
            {step === 5 && "What goals do you want to focus on here?"}
            {step === 6 && "You are all set!"}
          </h2>

          {errorMsg && (
            <div className="w-full p-4 rounded-2xl bg-red-500/12 border border-red-500/30 text-red-200 text-sm font-semibold max-w-full text-center mb-4 animate-pop-in">
              {errorMsg}
            </div>
          )}

          {/* Step Input Elements */}
          <div className="w-full">
            
            {step === 1 && (
              <p className="text-white/85 text-base sm:text-lg leading-relaxed max-w-[320px] mx-auto">
                I will ask you a few quick questions to align the app tools to support you best.
              </p>
            )}

            {step === 2 && (
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value !== "" ? Number(e.target.value) : "")}
                placeholder="Enter your age..."
                className="w-full bg-white/10 border border-white/20 py-4 px-6 rounded-full text-xl text-white font-sans text-center outline-none focus:border-white/45 focus:bg-white/15 transition-all placeholder-white/40 shadow-inner"
                min="1"
                max="120"
                autoFocus
              />
            )}

            {step === 3 && (
              <div className="flex flex-col gap-4">
                {["Male", "Female"].map((g) => (
                  <button
                    key={g}
                    onClick={() => setGender(g as "Male" | "Female")}
                    className={`w-full py-4 px-6 rounded-full border text-lg font-bold transition-all hover:scale-[1.01] ${
                      gender === g
                        ? "bg-white text-indigo-600 border-white shadow-lg"
                        : "bg-white/10 text-white border-white/20 hover:bg-white/15"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            )}

            {step === 4 && (
              <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto scrollbar-thin pr-1">
                {mentalIllnessOptions.map((option) => {
                  const isSelected = selectedIllness.includes(option);
                  return (
                    <button
                      key={option}
                      onClick={() => toggleIllness(option)}
                      className={`w-full py-3 px-5 rounded-full border text-sm font-semibold transition-all flex items-center justify-between hover:scale-[1.005] ${
                        isSelected
                          ? "bg-white text-indigo-600 border-white shadow-md"
                          : "bg-white/10 text-white border-white/20 hover:bg-white/15"
                      }`}
                    >
                      <span>{option}</span>
                      {isSelected && <Check weight="bold" className="w-4 h-4 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}

            {step === 5 && (
              <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto scrollbar-thin pr-1">
                {goalOptions.map((option) => {
                  const isSelected = selectedGoals.includes(option);
                  return (
                    <button
                      key={option}
                      onClick={() => toggleGoal(option)}
                      className={`w-full py-3 px-5 rounded-full border text-sm font-semibold transition-all flex items-center justify-between hover:scale-[1.005] ${
                        isSelected
                          ? "bg-white text-indigo-600 border-white shadow-md"
                          : "bg-white/10 text-white border-white/20 hover:bg-white/15"
                      }`}
                    >
                      <span>{option}</span>
                      {isSelected && <Check weight="bold" className="w-4 h-4 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}

            {step === 6 && (
              <div className="space-y-4">
                <div className="inline-flex p-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 mb-2">
                  <Sparkle weight="fill" className="w-8 h-8 animate-pulse" />
                </div>
                <p className="text-white/85 text-lg leading-relaxed max-w-[320px] mx-auto">
                  Good luck using the system! We are so glad to have you here.
                </p>
              </div>
            )}

          </div>
        </div>

        {/* Wizard Footer Controls */}
        <div className="w-full mt-4">
          <div className="w-full mb-8">
            {step === 1 && (
              <button onClick={handleNext} className="w-full py-4 px-8 rounded-full bg-white text-indigo-600 font-extrabold text-base tracking-wider shadow-lg hover:-translate-y-0.5 hover:scale-[1.01] active:scale-[0.99] hover:shadow-xl hover:bg-opacity-95 transition-all cursor-pointer">
                LET'S GO!
              </button>
            )}
            {step > 1 && step < 5 && (
              <button onClick={handleNext} className="w-full py-4 px-8 rounded-full bg-white text-indigo-600 font-extrabold text-base tracking-wider shadow-lg hover:-translate-y-0.5 hover:scale-[1.01] active:scale-[0.99] hover:shadow-xl hover:bg-opacity-95 transition-all cursor-pointer">
                CONTINUE
              </button>
            )}
            {step === 5 && (
              <button onClick={handleNext} disabled={saving} className="w-full py-4 px-8 rounded-full bg-white text-indigo-600 font-extrabold text-base tracking-wider shadow-lg hover:-translate-y-0.5 hover:scale-[1.01] active:scale-[0.99] hover:shadow-xl hover:bg-opacity-95 transition-all cursor-pointer">
                {saving ? "SAVING..." : "COMPLETE SETUP"}
              </button>
            )}
            {step === 6 && (
              <button onClick={() => { window.location.href = "/dashboard"; }} className="w-full py-4 px-8 rounded-full bg-white text-indigo-600 font-extrabold text-base tracking-wider shadow-lg hover:-translate-y-0.5 hover:scale-[1.01] active:scale-[0.99] hover:shadow-xl hover:bg-opacity-95 transition-all cursor-pointer">
                GO TO DASHBOARD
              </button>
            )}
          </div>

          {/* Dots Indicator */}
          {step < 6 && (
            <div className="flex gap-2 justify-center pt-4">
              {[1, 2, 3, 4, 5].map((s) => (
                <div
                  key={s}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    s === step ? "bg-white scale-125" : s < step ? "bg-white/65" : "bg-white/25"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
