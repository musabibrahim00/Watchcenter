import { useNavigate } from "react-router";
import { ArrowLeft, ShieldOff } from "lucide-react";
import { colors } from "../shared/design-system/tokens";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="relative flex-1 flex items-center justify-center overflow-clip" style={{ backgroundColor: colors.bgApp }}>
      <div className="absolute w-[400px] h-[400px] rounded-full opacity-[0.05] blur-[100px] bg-[#EF4444]" />
      <div className="flex flex-col items-center gap-6 max-w-md text-center z-10">
        <div className="p-5 rounded-2xl bg-[#EF444415] border border-[#EF444430]">
          <ShieldOff size={48} color="#EF4444" strokeWidth={1.5} />
        </div>
        <h1 style={{ color: colors.textSecondary }} className="tracking-[-0.5px] text-[28px]">Page Not Found</h1>
        <p style={{ color: colors.textMuted }} className="leading-[1.6] text-[14px]">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors cursor-pointer text-[13px]"
          style={{ backgroundColor: "rgba(20,162,227,0.12)", border: "1px solid rgba(20,162,227,0.25)", color: colors.accent }}
        >
          <ArrowLeft size={14} />
          Back to Watch Center
        </button>
      </div>
    </div>
  );
}
