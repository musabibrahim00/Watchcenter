import React from "react";
import DetailContainer from "./Container";
import svgPaths from "./svg-tu9d27elxy";
import MoveLeft from "./MoveLeft";
import MoveRight from "./MoveRight";
import svgKdPaths from "./svg-g917fa6ogx";
import { useTaskInvestigation, buildTaskRequest } from "./TaskInvestigationBridge";

export interface TaskData {
  id: string;
  title: string;
  subtitle: string;
  reason: string;
  actionLabel: string;
  type?: "standard" | "kd";
  mttdValue?: string;
  mttdChange?: string;
}

const TASK_POOL: TaskData[] = [
  {
    id: "task-1",
    title: "Deploy critical patch to finance-db-01",
    subtitle: "CVE-2024-5821 actively exploited in the wild. Finance database directly exposed.",
    reason: "KEV match + internet exposed + asset classified as crown jewel",
    actionLabel: "Authorize",
  },
  {
    id: "task-2",
    title: "Block lateral movement to domain controller",
    subtitle: "Simulated attack path reaches domain admin in 3 hops via compromised jump server.",
    reason: "Domain admin reachable in 3 hops — active exploitation pattern detected",
    actionLabel: "Authorize",
    type: "kd",
    mttdValue: "3.6 hrs",
    mttdChange: "23.5%",
  },
  {
    id: "task-3",
    title: "Certificate rotation — production load balancers",
    subtitle: "Production TLS certificates expire in < 72 hours. External services at risk.",
    reason: "Production TLS expiry < 72h — external-facing services affected",
    actionLabel: "Authorize",
  },
  {
    id: "task-4",
    title: "Revoke stale API tokens — billing microservice",
    subtitle: "23 API tokens with admin scope haven't been rotated in 180+ days.",
    reason: "Over-privileged tokens with no rotation — lateral movement risk via billing API",
    actionLabel: "Authorize",
  },
  {
    id: "task-5",
    title: "Isolate compromised endpoint — WKS-0447",
    subtitle: "EDR flagged C2 beacon activity from workstation in the engineering VLAN.",
    reason: "Active C2 communication detected — blast radius includes source code repos",
    actionLabel: "Authorize",
    type: "kd",
    mttdValue: "1.2 hrs",
    mttdChange: "41.8%",
  },
  {
    id: "task-6",
    title: "Patch RCE in internal Jenkins instance",
    subtitle: "CVE-2025-1103 allows unauthenticated remote code execution on CI/CD pipeline.",
    reason: "Unauthenticated RCE on build server — supply chain compromise risk",
    actionLabel: "Authorize",
  },
  {
    id: "task-7",
    title: "Enforce MFA on privileged service accounts",
    subtitle: "12 service accounts with domain admin privileges lack multi-factor authentication.",
    reason: "Credential stuffing campaign active — unprotected admin accounts at risk",
    actionLabel: "Authorize",
    type: "kd",
    mttdValue: "5.1 hrs",
    mttdChange: "12.3%",
  },
  {
    id: "task-8",
    title: "Remediate S3 bucket public exposure",
    subtitle: "Customer PII dataset accessible via misconfigured bucket policy since last deploy.",
    reason: "Public read access on PII bucket — regulatory and breach notification risk",
    actionLabel: "Authorize",
  },
];

function TaskCard({ task, onViewDetails, onAction }: { task: TaskData; onViewDetails?: () => void; onAction?: () => void }) {
  const [loading, setLoading] = React.useState(false);

  const handleAction = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onAction?.();
    }, 3000);
  };

  return (
    <div
      className="content-stretch flex flex-col flex-1 min-h-px min-w-px gap-[20px] items-start p-[17px] relative rounded-[12px]"
      style={{ animation: "tasksFadeIn 0.3s ease forwards", backgroundImage: "linear-gradient(35deg, rgba(5, 11, 17, 0) 73.614%, rgba(255, 87, 87, 0.12) 100%)" }}
      data-name="TaskCard"
    >
      <div aria-hidden="true" className="absolute inset-0 mix-blend-screen pointer-events-none rounded-[12px]" style={{ backgroundImage: "linear-gradient(112.026deg, rgb(8, 3, 3) 0%, rgb(0, 0, 0) 35.132%, rgb(0, 0, 0) 65.097%, rgb(8, 3, 3) 90.93%)" }} />
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[10px] overflow-hidden" style={{ WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)", WebkitMaskComposite: "xor", maskComposite: "exclude", padding: "1px" }}>
        <div className="absolute inset-[-50%] animate-[border-spin_4s_linear_infinite]" style={{ background: "conic-gradient(from 0deg, #030609 0%, #FF575752 25%, #030609 50%, #FF575752 75%, #030609 100%)" }} />
      </div>
      {/* Header */}
      <div className="relative shrink-0 w-full" data-name="Container">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start justify-between relative w-full">
          <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="Container">
            <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[4px] items-start leading-[normal] not-italic relative w-full tracking-[0.4px] whitespace-pre-wrap">
              <p className="font-['Inter:Medium',sans-serif] font-medium relative shrink-0 text-[#dadfe3] text-[12px] w-full">{task.title}</p>
            </div>
          </div>
        </div>
      </div>
      {/* Reason */}
      <div className="relative shrink-0 w-full" data-name="Container">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[12px] items-start relative w-full">
          <div className="flex h-0 items-center justify-center relative self-center shrink-0 w-0" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "19" } as React.CSSProperties}>
            <div className="flex-none h-full rotate-90">
              <div className="h-full relative w-[27px]" data-name="separator">
                <div className="absolute inset-[-1px_0_0_0]">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 27 1">
                    <line stroke="var(--stroke-0, #FF5757)" x2="27" y1="0.5" y2="0.5" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="Container">
            <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col font-['Inter:Regular',sans-serif] font-normal gap-[4px] items-start leading-[normal] not-italic relative text-[10px] w-full">
              <p className="h-[11px] relative shrink-0 text-[#dadfe3] w-full whitespace-pre-wrap">Why this matters</p>
              <p className="relative shrink-0 text-[#89949e]">{task.reason}</p>
            </div>
          </div>
        </div>
      </div>
      {/* Buttons / Loader */}
      <div className="relative shrink-0 w-full mt-auto" data-name="Buttons">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-between relative w-full">
          <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="buttons">
            <div className={`h-[24px] min-w-[84px] relative rounded-[6px] shrink-0 transition-colors ${loading ? 'bg-transparent cursor-default' : 'bg-[#076498] cursor-pointer hover:bg-[#0a7ab8]'}`} data-name="ButtonPrimary" onClick={!loading ? handleAction : undefined}>
              <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[12px] h-full items-center justify-center min-w-[inherit] p-[8px] relative">
                {loading ? (
                  <div className="content-stretch flex gap-[8px] items-center relative size-full">
                    <div className="overflow-clip relative shrink-0 size-[14px]" style={{ animation: "loaderSpin 1s linear infinite" }}>
                      <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[12px] top-1/2">
                        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
                          <path d={svgPaths.p4071f00} fill="#076498" fillOpacity="0.24" />
                        </svg>
                      </div>
                      <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[12px] top-1/2">
                        <div className="absolute bottom-[0.23%] left-1/2 right-[0.23%] top-1/2">
                          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.97276 5.97276">
                            <path d={svgPaths.p22ac670} fill="#0781C2" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#dadfe3] text-[10px] whitespace-pre-wrap">Authorizing</p>
                  </div>
                ) : (
                  <p className="flex-[1_0_0] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[12px] min-h-px min-w-px not-italic relative text-[#f1f3ff] text-[10px] text-center whitespace-pre-wrap">{task.actionLabel}</p>
                )}
              </div>
            </div>
            {!loading && (
            <div onClick={handleAction} className="cursor-pointer">
              <div className="h-[24px] relative rounded-[6px] shrink-0 hover:bg-[#1e2a34] transition-colors" data-name="ButtonGray">
                <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex h-full items-center justify-center px-[12px] py-[8px] relative">
                  <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[12px] not-italic relative shrink-0 text-[#f1f3ff] text-[10px] text-center">Defer</p>
                </div>
              </div>
            </div>
            )}
          </div>
          <div className="content-stretch flex gap-[6px] items-center shrink-0">
            <div
              className="content-stretch flex h-[24px] items-center justify-center px-[12px] py-[8px] relative rounded-[6px] shrink-0 cursor-pointer hover:bg-[#1e2a34] transition-colors"
              data-name="ButtonGray"
              onClick={onViewDetails}
            >
              <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[12px] not-italic relative shrink-0 text-[#f1f3ff] text-[10px] text-center">View details</p>
            </div>
            <div
              className="content-stretch flex h-[24px] items-center justify-center px-[8px] py-[8px] relative rounded-[6px] shrink-0 cursor-pointer hover:bg-[rgba(87,177,255,0.08)] transition-colors"
              onClick={(e) => { e.stopPropagation(); window.dispatchEvent(new CustomEvent("aibox-inject-query", { detail: { query: `Why does "${task.title}" matter? Explain the risk.` } })); }}
            >
              <p className="font-['Inter:Medium',sans-serif] leading-[12px] not-italic relative shrink-0 text-[#57b1ff] text-[9px] text-center">Ask why</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function KdTaskCard({ task, onViewDetails, onAction }: { task: TaskData; onViewDetails?: () => void; onAction?: () => void }) {
  const [loading, setLoading] = React.useState(false);

  const handleAction = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onAction?.();
    }, 3000);
  };

  return (
    <div
      className="content-stretch flex flex-col flex-1 min-h-px min-w-px gap-[20px] items-start p-[17px] relative rounded-[12px]"
      style={{ animation: "tasksFadeIn 0.3s ease forwards", backgroundImage: "linear-gradient(35deg, rgba(5, 11, 17, 0) 73.614%, rgba(255, 87, 87, 0.12) 100%)" }}
      data-name="KdTaskCard"
    >
      <div aria-hidden="true" className="absolute inset-0 mix-blend-screen pointer-events-none rounded-[12px]" style={{ backgroundImage: "linear-gradient(111.789deg, rgb(8, 3, 3) 0%, rgb(0, 0, 0) 35.132%, rgb(0, 0, 0) 65.097%, rgb(8, 3, 3) 90.93%)" }} />
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[10px] overflow-hidden" style={{ WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)", WebkitMaskComposite: "xor", maskComposite: "exclude", padding: "1px" }}>
        <div className="absolute inset-[-50%] animate-[border-spin_4s_linear_infinite]" style={{ background: "conic-gradient(from 0deg, #030609 0%, #FF575752 25%, #030609 50%, #FF575752 75%, #030609 100%)" }} />
      </div>
      {/* Header */}
      <div className="relative shrink-0 w-full" data-name="Container">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start justify-between relative w-full">
          <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="Container">
            <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[0px] items-start leading-[normal] not-italic relative w-full tracking-[0.4px]">
              <p className="font-['Inter:Medium',sans-serif] font-medium relative shrink-0 text-[#dadfe3] text-[12px] w-full">{task.title}</p>
            </div>
          </div>
        </div>
      </div>
      {/* Why this matters + MTTD row */}
      <div className="relative shrink-0 w-full" data-name="Frame">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[16px] items-center relative w-full">
          {/* Why this matters */}
          <div className="content-stretch flex flex-[1_0_0] gap-[12px] items-start min-h-px min-w-px relative" data-name="Container">
            <div className="flex h-0 items-center justify-center relative self-center shrink-0 w-0" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "19" } as React.CSSProperties}>
              <div className="flex-none h-full rotate-90">
                <div className="h-full relative w-[39px]" data-name="separator">
                  <div className="absolute inset-[-1px_0_0_0]">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 39 1">
                      <line stroke="var(--stroke-0, #FF5757)" x2="39" y1="0.5" y2="0.5" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="Container">
              <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col font-['Inter:Regular',sans-serif] font-normal gap-[4px] items-start leading-[normal] not-italic relative text-[10px] w-full">
                <p className="h-[11px] relative shrink-0 text-[#dadfe3] w-full">Why this matters</p>
                <p className="relative shrink-0 text-[#89949e] w-full">{task.reason}</p>
              </div>
            </div>
          </div>
          {/* Vertical separator */}
          <div className="flex flex-row items-center self-stretch">
            <div className="flex h-0 items-center justify-center relative self-center shrink-0 w-0" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "19" } as React.CSSProperties}>
              <div className="flex-none h-full rotate-90">
                <div className="h-full relative w-[39px]" data-name="separator">
                  <div className="absolute inset-[-1px_0_0_0]">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 39 1">
                      <line opacity="0.2" stroke="var(--stroke-0, #89949E)" x2="39" y1="0.5" y2="0.5" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* MTTD */}
          <div className="bg-[#050B11] content-stretch flex flex-col gap-[2px] items-start relative rounded-[12px] shadow-[0px_0px_15px_0px_rgba(0,0,0,0.1)] shrink-0" data-name="MTTD">
            <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#dadfe3] text-[10px] whitespace-nowrap">MTTD</p>
            <div className="relative shrink-0" data-name="Metrics">
              <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center relative">
                <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] not-italic relative shrink-0 text-[14px] text-white tracking-[-0.5px] whitespace-nowrap">{task.mttdValue}</p>
                <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="progress">
                  <div className="flex items-center justify-center relative shrink-0">
                    <div className="-scale-y-100 flex-none">
                      <div className="overflow-clip relative size-[14px]" data-name="Icons">
                        <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[16px] top-1/2" data-name="Container" />
                        <div className="absolute bottom-[20.83%] flex items-center justify-center left-1/4 right-1/4 top-[20.83%]">
                          <div className="-rotate-90 flex-none h-[12px] w-[14px]">
                            <div className="relative size-full" data-name="Vector">
                              <div className="absolute inset-[-7.14%_-6.12%]">
                                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.16667 8">
                                  <path d={svgKdPaths.p13457880} stroke="var(--stroke-0, #FF5757)" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="font-['Inter:Regular',sans-serif] font-normal leading-[14px] not-italic relative shrink-0 text-[#ff5757] text-[14px] whitespace-nowrap">{task.mttdChange}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Buttons / Loader */}
      <div className="relative shrink-0 w-full mt-auto" data-name="Buttons">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-between relative w-full">
          <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="buttons">
            <div className={`h-[24px] min-w-[84px] relative rounded-[6px] shrink-0 transition-colors ${loading ? 'bg-transparent cursor-default' : 'bg-[#076498] cursor-pointer hover:bg-[#0a7ab8]'}`} data-name="ButtonPrimary" onClick={!loading ? handleAction : undefined}>
              <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[12px] h-full items-center justify-center min-w-[inherit] p-[8px] relative">
                {loading ? (
                  <div className="content-stretch flex gap-[8px] items-center relative size-full">
                    <div className="overflow-clip relative shrink-0 size-[14px]" style={{ animation: "loaderSpin 1s linear infinite" }}>
                      <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[12px] top-1/2">
                        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
                          <path d={svgPaths.p4071f00} fill="#076498" fillOpacity="0.24" />
                        </svg>
                      </div>
                      <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[12px] top-1/2">
                        <div className="absolute bottom-[0.23%] left-1/2 right-[0.23%] top-1/2">
                          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.97276 5.97276">
                            <path d={svgPaths.p22ac670} fill="#0781C2" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#dadfe3] text-[10px] whitespace-pre-wrap">Authorizing</p>
                  </div>
                ) : (
                  <p className="flex-[1_0_0] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[12px] min-h-px min-w-px not-italic relative text-[#f1f3ff] text-[10px] text-center whitespace-pre-wrap">{task.actionLabel}</p>
                )}
              </div>
            </div>
            {!loading && (
            <div onClick={handleAction} className="cursor-pointer">
              <div className="h-[24px] relative rounded-[6px] shrink-0 hover:bg-[#1e2a34] transition-colors" data-name="ButtonGray">
                <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex h-full items-center justify-center px-[12px] py-[8px] relative">
                  <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[12px] not-italic relative shrink-0 text-[#f1f3ff] text-[10px] text-center">Defer</p>
                </div>
              </div>
            </div>
            )}
          </div>
          <div className="content-stretch flex gap-[6px] items-center shrink-0">
            <div
              className="content-stretch flex h-[24px] items-center justify-center px-[12px] py-[8px] relative rounded-[6px] shrink-0 cursor-pointer hover:bg-[#1e2a34] transition-colors"
              data-name="ButtonGray"
              onClick={onViewDetails}
            >
              <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[12px] not-italic relative shrink-0 text-[#f1f3ff] text-[10px] text-center">View details</p>
            </div>
            <div
              className="content-stretch flex h-[24px] items-center justify-center px-[8px] py-[8px] relative rounded-[6px] shrink-0 cursor-pointer hover:bg-[rgba(87,177,255,0.08)] transition-colors"
              onClick={(e) => { e.stopPropagation(); window.dispatchEvent(new CustomEvent("aibox-inject-query", { detail: { query: `Why does "${task.title}" matter? Explain the risk.` } })); }}
            >
              <p className="font-['Inter:Medium',sans-serif] leading-[12px] not-italic relative shrink-0 text-[#57b1ff] text-[9px] text-center">Ask why</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Tasks({ onViewChange, onTaskDone }: { onViewChange?: (isDetail: boolean) => void; onTaskDone?: (task: TaskData) => void } = {}) {
  const [showDetail, setShowDetail] = React.useState(false);
  const [slideIndex, setSlideIndex] = React.useState(0);
  const [isAnimating, setIsAnimating] = React.useState(false);
  const [containerWidth, setContainerWidth] = React.useState(0);
  const [hiddenTaskIds, setHiddenTaskIds] = React.useState<Set<string>>(new Set());
  const [collapsingTaskIds, setCollapsingTaskIds] = React.useState<Set<string>>(new Set());
  const containerRef = React.useRef<HTMLDivElement>(null);
  const visibleTasks = TASK_POOL.filter((t) => !hiddenTaskIds.has(t.id));
  const VISIBLE_COUNT = 3;
  const GAP = 12;
  const maxIndex = Math.max(0, visibleTasks.length - VISIBLE_COUNT);

  const { investigateTask } = useTaskInvestigation();

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(el);
    setContainerWidth(el.offsetWidth);
    return () => observer.disconnect();
  }, []);

  const cardWidth = containerWidth > 0
    ? (containerWidth - GAP * (VISIBLE_COUNT - 1)) / VISIBLE_COUNT
    : 0;
  const translateX = -(slideIndex * (cardWidth + GAP));

  const handleSlideLeft = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setSlideIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
    setTimeout(() => setIsAnimating(false), 500);
  };

  const handleSlideRight = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setSlideIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    setTimeout(() => setIsAnimating(false), 500);
  };

  const handleDismissCard = (taskId: string) => {
    setCollapsingTaskIds((prev) => new Set(prev).add(taskId));
    const task = TASK_POOL.find((t) => t.id === taskId);
    if (task) onTaskDone?.(task);
    setTimeout(() => {
      setHiddenTaskIds((prev) => new Set(prev).add(taskId));
      setCollapsingTaskIds((prev) => {
        const next = new Set(prev);
        next.delete(taskId);
        return next;
      });
      setSlideIndex((prev) => Math.min(prev, Math.max(0, visibleTasks.length - 1 - VISIBLE_COUNT)));
    }, 650);
  };

  const handleShowDetail = (show: boolean) => {
    setShowDetail(show);
    onViewChange?.(show);
  };

  const handleInvestigateTask = React.useCallback((task: TaskData, actionType: "investigate" | "view_details" | "open_case" | "authorize") => {
    const request = buildTaskRequest(
      task.id,
      task.title,
      task.subtitle,
      task.reason,
      actionType,
      "watchcenter",
    );
    investigateTask(request);
  }, [investigateTask]);

  if (showDetail) {
    return (
      <div className="relative size-full" data-name="Tasks">
        <div
          className="size-full"
          style={{
            animation: "tasksFadeIn 0.3s ease forwards",
          }}
        >
          <DetailContainer onHideDetails={() => handleShowDetail(false)} />
        </div>
      </div>
    );
  }

  return (
    <div className="content-stretch flex items-center relative size-full" data-name="Tasks">
      <div className="shrink-0 size-[64px] cursor-pointer" onClick={handleSlideLeft}>
        <MoveLeft />
      </div>
      <div className="flex-1 min-w-0 px-[12px] overflow-hidden" ref={containerRef}>
        <div
          className="flex items-stretch"
          style={{
            transform: `translateX(${translateX}px)`,
            transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          {visibleTasks.map((task, index) => {
            const isCollapsing = collapsingTaskIds.has(task.id);
            const isLast = index === visibleTasks.length - 1;
            return (
              <div
                key={task.id}
                className="shrink-0 flex flex-col"
                style={{
                  width: isCollapsing ? 0 : (cardWidth > 0 ? `${cardWidth}px` : "calc((100% - 24px) / 3)"),
                  opacity: isCollapsing ? 0 : 1,
                  marginRight: isCollapsing ? 0 : (isLast ? 0 : `${GAP}px`),
                  transition: "width 0.6s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1), margin-right 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                  overflow: "hidden",
                }}
              >
                <div className="flex-1 flex flex-col" style={{ minWidth: cardWidth > 0 ? `${cardWidth}px` : undefined }}>
                  {task.type === "kd" ? (
                    <KdTaskCard
                      task={task}
                      onViewDetails={() => handleInvestigateTask(task, "view_details")}
                      onAction={() => handleDismissCard(task.id)}
                    />
                  ) : (
                    <TaskCard
                      task={task}
                      onViewDetails={() => handleInvestigateTask(task, "view_details")}
                      onAction={() => handleDismissCard(task.id)}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="shrink-0 size-[64px] cursor-pointer" onClick={handleSlideRight}>
        <MoveRight />
      </div>
    </div>
  );
}