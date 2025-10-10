// /app/setup/page.tsx
"use client";
import { studyStyles } from "../config/studyStyles";
import { useStudyStyle } from "../hooks/useStudyStyle";
import { useRouter } from "next/navigation";

export default function SetupPage() {
  const { saveStyle } = useStudyStyle();
  const router = useRouter();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <h1 className="text-3xl font-bold mb-6">Choose Your Study Style</h1>
      <div className="grid gap-4 max-w-md">
        {Object.entries(studyStyles).map(([key, value]) => (
          <button
            key={key}
            onClick={() => {
              saveStyle(key as any);
              router.push("/");
            }}
            className="rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition"
          >
            <h2 className="text-xl font-semibold mb-2">{key}</h2>
            <p className="text-white/70 text-sm">{value.description}</p>
          </button>
        ))}
      </div>
    </main>
  );
}
