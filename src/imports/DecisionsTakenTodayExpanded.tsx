import React, { useState } from "react";
import svgPaths from "./svg-wuk3jrrx4n";
import checkSvgPaths from "./svg-nroquucgr2";

const TASKS = [
  { title: "Critical vulnerability patched - orders-service", status: "Approved by You", time: "03:12 AM", subtasks: ["Isolated container from ingress", "Applied patched dependency v2.17.1", "Redeployed service via CI/CD", "Post-deploy scan verified remediation"], result: "Patched and verified. Zero downtime." },
  { title: "Rotate exposed credentials", status: "Approved by You", time: "03:12 AM", subtasks: ["Revoked compromised API key", "Generated new credentials", "Updated secrets vault", "Verified service connectivity"], result: "Credentials rotated. No service interruption." },
  { title: "Review over-privileged service account", status: "Auto-resolved under policy", time: "03:12 AM", subtasks: ["Audited current permissions", "Removed excessive privileges", "Applied least-privilege policy", "Logged changes for compliance"], result: "Permissions scoped down. Policy compliant." },
  { title: "TLS certificate renewed api.payments.internal", status: "Approved by You", time: "03:12 AM", subtasks: ["Generated CSR for renewal", "Issued new certificate via ACME", "Deployed to load balancers", "Verified TLS handshake"], result: "Certificate renewed. Valid until 2027." },
  { title: "Stale container images-staging-cluster", status: "Auto-resolved under policy", time: "03:12 AM", subtasks: ["Scanned registry for stale images", "Identified 12 images > 90 days", "Purged unused images", "Freed 4.2 GB storage"], result: "Registry cleaned. Storage recovered." },
  { title: "Privilege drift-policy scope exceeded", status: "Auto-resolved under policy", time: "03:12 AM", subtasks: ["Detected unintended permission grant", "Compared against baseline policy", "Reverted s3:DeleteObject access", "Notified security team"], result: "Drift corrected. Baseline restored." },
  { title: "Unused API keys-3 keys inactive 90+ days", status: "Auto-resolved under policy", time: "03:12 AM", subtasks: ["Identified 3 inactive API keys", "Deactivated stale keys", "Notified key owners via Slack", "Documented in audit log"], result: "Stale keys deactivated. Owners notified." },
  { title: "Suspicious login pattern-admin console", status: "Approved by You", time: "03:12 AM", subtasks: ["Flagged anomalous login IP", "Verified MFA challenge passed", "Enabled 24h session monitoring", "Alerted SOC team"], result: "Session monitored. No breach detected." },
];

function Title({ onCollapse }: { onCollapse: (e: React.MouseEvent) => void }) {
  return (
    <div className="relative shrink-0 w-full" data-name="Title">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[4px] items-center relative w-full">
        <div className="overflow-clip relative shrink-0 size-[20px]" data-name="Icons">
          <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[16px] top-1/2" data-name="Container" />
          <div className="absolute inset-[18.75%]" data-name="Subtract">
            <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12.5 12.5">
              <path d={svgPaths.paf75d00} fill="var(--fill-0, #00A46E)" id="Subtract" />
            </svg>
          </div>
        </div>
        <p className="flex-[1_0_0] font-['Inter:Medium',sans-serif] font-medium leading-[normal] min-h-px min-w-px not-italic relative text-[#89949e] tracking-[0.4px] uppercase whitespace-pre-wrap text-[12px]">Decisions Taken Today</p>
        <div className="overflow-clip relative shrink-0 size-[16px] cursor-pointer" data-name="Icons" onClick={onCollapse}>
          <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[16px] top-1/2" data-name="Container" />
          <div className="absolute flex inset-[41.67%_29.17%_37.5%_29.17%] items-center justify-center">
            <div className="-scale-y-100 flex-none h-[5px] w-[10px]">
              <div className="relative size-full" data-name="Vector">
                <div className="absolute inset-[-15%_-7.5%]">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7.66667 4.33333">
                    <path d={svgPaths.pfbb3280} id="Vector" stroke="var(--stroke-0, #62707D)" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TaskItem({ title, status, time, subtasks, result }: { title: string; status: string; time: string; subtasks: string[]; result: string }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="bg-[#050B11] relative rounded-[8px] shrink-0 w-full cursor-pointer"
      data-name={expanded ? "TaskExpanded" : "TaskCollapsed"}
      onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
    >
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[8px]" style={{ border: "1px solid transparent", background: "linear-gradient(134.825deg, #030708 0%, #000000 35.132%, #000000 65.097%, #030708 90.93%) padding-box, linear-gradient(134.825deg, #030609 0%, #57B1FF1F 100%) border-box" }} />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start p-[12px] relative w-full">
        <div className="content-stretch flex flex-col font-['Inter:Regular',sans-serif] font-normal gap-[8px] items-start leading-[normal] not-italic relative shrink-0 w-full" data-name="Title">
          <p className="relative shrink-0 text-[#dadfe3] text-[12px] w-full whitespace-pre-wrap">{title}</p>
          <div className="content-stretch flex items-center justify-between relative shrink-0 text-[#89949e] text-[10px] w-full">
            <p className="relative shrink-0">{status}</p>
            <p className="relative shrink-0">{time}</p>
          </div>
        </div>
        {expanded && (
          <div className="content-stretch flex flex-col gap-[16px] items-start mt-[16px] w-full">
            <div className="content-stretch flex flex-col gap-[8px] items-start justify-center relative shrink-0 w-full" data-name="Tasks">
              <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[10px] uppercase text-[#89949e]">What was done</p>
              {subtasks.map((subtask, i) => (
                <div key={i} className="content-stretch flex gap-[4px] items-center relative shrink-0 w-full" data-name="task">
                  <div className="overflow-clip relative shrink-0 size-[16px]" data-name="Icons">
                    <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[16px] top-1/2" data-name="Container" />
                    <div className="absolute inset-[20.83%]" data-name="Vector">
                      <div className="absolute inset-[-5.36%]">
                        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.3333 10.3333">
                          <path d={checkSvgPaths.p2d194f00} id="Vector" stroke="var(--stroke-0, #00A46E)" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <p className="flex-[1_0_0] font-['Inter:Regular',sans-serif] font-normal leading-[normal] min-h-px min-w-px not-italic relative text-[10px] whitespace-pre-wrap text-[#89949e]">{subtask}</p>
                </div>
              ))}
            </div>
            <div className="content-stretch flex font-['Inter:Regular',sans-serif] font-normal gap-[4px] items-center leading-[normal] not-italic relative shrink-0 text-[10px] w-full" data-name="Result">
              <p className="relative shrink-0 uppercase text-[#89949e]">Result:</p>
              <p className="relative shrink-0 text-[#dadfe3]">{result}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Tasks() {
  return (
    <div className="flex-[1_0_0] min-h-0 min-w-px relative w-full overflow-y-auto" data-name="Tasks">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[12px] items-start relative rounded-[inherit] w-full">
        {TASKS.map((task, i) => (
          <TaskItem key={i} title={task.title} status={task.status} time={task.time} subtasks={task.subtasks} result={task.result} />
        ))}
      </div>
    </div>
  );
}

export default function DecisionsTakenTodayExpanded({ onCollapse }: { onCollapse: () => void }) {
  return (
    <div className="content-stretch flex flex-col gap-[32px] items-start p-[17px] relative rounded-[12px] w-full h-[600px]" data-name="DecisionsTakenTodayExpanded">
      <Title onCollapse={(e) => { e.stopPropagation(); onCollapse(); }} />
      <Tasks />
    </div>
  );
}