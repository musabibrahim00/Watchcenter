import { useNavigate } from "react-router";
import { colors } from "../shared/design-system/tokens";

export const EXPERIENCE_KEY = "wc:experience";
export type Experience = "musab" | "ali";

export function getStoredExperience(): Experience | null {
  return localStorage.getItem(EXPERIENCE_KEY) as Experience | null;
}

export const EXPERIENCE_EVENT = "wc:experience-changed";

export function setStoredExperience(exp: Experience) {
  localStorage.setItem(EXPERIENCE_KEY, exp);
  window.dispatchEvent(new CustomEvent(EXPERIENCE_EVENT, { detail: exp }));
}

export function removeStoredExperience() {
  localStorage.removeItem(EXPERIENCE_KEY);
  window.dispatchEvent(new CustomEvent(EXPERIENCE_EVENT, { detail: null }));
}

export default function ExperienceChooser() {
  const navigate = useNavigate();

  function choose(exp: Experience) {
    setStoredExperience(exp);
    if (exp === "ali") {
      navigate("/compliance", { replace: true });
    } else {
      navigate("/", { replace: true });
    }
  }

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center"
      style={{ backgroundColor: colors.bgApp }}
    >
      {/* Logo / wordmark */}
      <div className="mb-[48px] flex flex-col items-center gap-[10px]">
        <div
          className="flex items-center justify-center rounded-[14px] size-[52px]"
          style={{ background: "linear-gradient(135deg, #076498 0%, #05374f 100%)", boxShadow: "0 0 32px rgba(7,100,152,0.35)" }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#57B1FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="4" />
            <line x1="12" y1="2" x2="12" y2="6" />
            <line x1="12" y1="18" x2="12" y2="22" />
            <line x1="2" y1="12" x2="6" y2="12" />
            <line x1="18" y1="12" x2="22" y2="12" />
          </svg>
        </div>
        <span
          className="text-[22px] font-bold tracking-[-0.5px]"
          style={{ color: colors.textPrimary }}
        >
          WatchCenter
        </span>
        <span className="text-[13px]" style={{ color: colors.textDim }}>
          Choose your experience to get started
        </span>
      </div>

      {/* Cards */}
      <div className="flex gap-[20px] w-full max-w-[720px] px-[24px]">
        {/* Musab — Security Ops */}
        <button
          onClick={() => choose("musab")}
          className="flex-1 flex flex-col gap-[20px] rounded-[18px] p-[28px] text-left transition-all duration-200 cursor-pointer group"
          style={{
            backgroundColor: colors.bgCard,
            border: `1px solid ${colors.border}`,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = colors.primary;
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = colors.bgCardHover;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = colors.border;
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = colors.bgCard;
          }}
        >
          {/* Icon */}
          <div
            className="flex items-center justify-center rounded-[12px] size-[48px]"
            style={{ backgroundColor: "rgba(7,100,152,0.15)", border: "1px solid rgba(7,100,152,0.3)" }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#57B1FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>

          {/* Text */}
          <div className="flex flex-col gap-[6px]">
            <span className="text-[18px] font-semibold tracking-[-0.3px]" style={{ color: colors.textPrimary }}>
              Musab
            </span>
            <span className="text-[13px] leading-[1.5]" style={{ color: colors.textMuted }}>
              Security Operations Center — full platform access with Watch Center, Attack Paths, Asset Register, Case Management, and all modules.
            </span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-[6px] mt-auto">
            {["Watch Center", "Attack Paths", "Case Management", "Asset Register"].map((t) => (
              <span
                key={t}
                className="px-[8px] py-[3px] rounded-[6px] text-[11px]"
                style={{ backgroundColor: "rgba(87,177,255,0.08)", color: "#57B1FF", border: "1px solid rgba(87,177,255,0.15)" }}
              >
                {t}
              </span>
            ))}
          </div>

          {/* CTA */}
          <div
            className="flex items-center gap-[6px] text-[13px] font-medium"
            style={{ color: colors.accent }}
          >
            Enter
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
        </button>

        {/* Ali — Compliance */}
        <button
          onClick={() => choose("ali")}
          className="flex-1 flex flex-col gap-[20px] rounded-[18px] p-[28px] text-left transition-all duration-200 cursor-pointer"
          style={{
            backgroundColor: colors.bgCard,
            border: `1px solid ${colors.border}`,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = "#2FD897";
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = colors.bgCardHover;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = colors.border;
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = colors.bgCard;
          }}
        >
          {/* Icon */}
          <div
            className="flex items-center justify-center rounded-[12px] size-[48px]"
            style={{ backgroundColor: "rgba(47,216,151,0.1)", border: "1px solid rgba(47,216,151,0.25)" }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2FD897" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          </div>

          {/* Text */}
          <div className="flex flex-col gap-[6px]">
            <span className="text-[18px] font-semibold tracking-[-0.3px]" style={{ color: colors.textPrimary }}>
              Ali
            </span>
            <span className="text-[13px] leading-[1.5]" style={{ color: colors.textMuted }}>
              Compliance Management — frameworks, controls, evidence collection, audit readiness, and regulatory monitoring across SOC 2, ISO 27001, NIST, PCI-DSS, and HIPAA.
            </span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-[6px] mt-auto">
            {["SOC 2", "ISO 27001", "NIST CSF", "PCI-DSS", "HIPAA"].map((t) => (
              <span
                key={t}
                className="px-[8px] py-[3px] rounded-[6px] text-[11px]"
                style={{ backgroundColor: "rgba(47,216,151,0.08)", color: "#2FD897", border: "1px solid rgba(47,216,151,0.18)" }}
              >
                {t}
              </span>
            ))}
          </div>

          {/* CTA */}
          <div
            className="flex items-center gap-[6px] text-[13px] font-medium"
            style={{ color: "#2FD897" }}
          >
            Enter
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
        </button>
      </div>

      {/* Version hint */}
      <p className="mt-[40px] text-[11px]" style={{ color: colors.textDim }}>
        You can switch experiences at any time from the header.
      </p>
    </div>
  );
}
