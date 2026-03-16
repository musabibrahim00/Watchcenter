import React from "react";

type TaskState = "pending" | "inProgress" | "done";

const TASKS = [
  "Detecting CIS control drift",
  "Validating SOC2 controls",
  "Auditing encryption config",
  "Reviewing access policies",
  "Checking retention compliance",
  "Mapping regulatory gaps",
  "Evaluating data residency",
  "Scanning benchmark deltas",
];

function useFirstTaskCycle(tasks: string[]) {
  const [startIndex, setStartIndex] = React.useState(0);
  const [firstState, setFirstState] = React.useState<TaskState>("inProgress");

  React.useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    timers.push(setTimeout(() => setFirstState("done"), 1500));
    timers.push(
      setTimeout(() => {
        setStartIndex((prev) => (prev + 1) % tasks.length);
        setFirstState("inProgress");
      }, 3500)
    );

    return () => timers.forEach(clearTimeout);
  }, [startIndex, tasks.length]);

  const visible: { label: string; state: TaskState }[] = [
    { label: tasks[startIndex % tasks.length], state: firstState },
    { label: tasks[(startIndex + 1) % tasks.length], state: "pending" },
    { label: tasks[(startIndex + 2) % tasks.length], state: "pending" },
  ];

  return visible;
}

function TaskRow({ label, state }: { label: string; state: TaskState }) {
  const dotColor =
    state === "done"
      ? "#00A46E"
      : state === "inProgress"
      ? "#62707D"
      : "#0C1D2A";
  const textColor =
    state === "done"
      ? "#dadfe3"
      : state === "inProgress"
      ? "#89949e"
      : "#1e2a34";

  return (
    <div className="content-stretch flex gap-[10px] items-center relative shrink-0">
      <div className="relative shrink-0 size-[6px]">
        <svg className="absolute block size-full" fill="none" viewBox="0 0 6 6">
          <circle cx="3" cy="3" fill={dotColor} r="3" style={{ transition: "fill 0.3s ease" }} />
        </svg>
      </div>
      <p
        className="font-['Inter:Regular',sans-serif] font-normal leading-[1.5] not-italic relative shrink-0 text-[12px]"
        style={{ color: textColor, transition: "color 0.3s ease" }}
      >
        {label}
      </p>
    </div>
  );
}

export default function ComplianceAnalyst() {
  const slots = useFirstTaskCycle(TASKS);

  return (
    <div
      className="bg-[#0c161f] content-stretch flex flex-col gap-[12px] items-start p-[16px] relative rounded-[12px] size-full"
      data-name="Governance & Compliance Analyst"
    >
      <div className="content-stretch flex font-['Inter:Medium',sans-serif] font-medium items-center justify-between leading-[normal] not-italic relative shrink-0 text-[12px] text-center w-full">
        <p className="relative shrink-0 text-[#dadfe3]">Governance & Compliance Analyst</p>
        <p className="relative shrink-0 text-[#f05b06]">Attention</p>
      </div>
      <div className="content-stretch flex flex-col gap-[4px] items-start justify-center relative shrink-0 w-full">
        {slots.map((slot, i) => (
          <TaskRow key={`${slot.label}-${i}`} label={slot.label} state={slot.state} />
        ))}
      </div>
    </div>
  );
}