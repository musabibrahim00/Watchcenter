import svgPaths from "./svg-nroquucgr2";

function Frame() {
  return (
    <div className="content-stretch flex h-[15px] items-center justify-between relative shrink-0 text-[#454545] text-[10px] w-full">
      <p className="relative shrink-0">Approved by You</p>
      <p className="relative shrink-0">03:12 AM</p>
    </div>
  );
}

function Title() {
  return (
    <div className="content-stretch flex flex-col font-['Inter:Regular',sans-serif] font-normal gap-[8px] items-start leading-[normal] not-italic relative shrink-0 w-full" data-name="Title">
      <p className="relative shrink-0 text-[#262626] text-[12px] w-full whitespace-pre-wrap">Critical vulnerability patched - orders-service</p>
      <Frame />
    </div>
  );
}

function Task() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0 w-full" data-name="task">
      <div className="overflow-clip relative shrink-0 size-[16px]" data-name="Icons">
        <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[16px] top-1/2" data-name="Container" />
        <div className="absolute inset-[20.83%]" data-name="Vector">
          <div className="absolute inset-[-5.36%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.3333 10.3333">
              <path d={svgPaths.p2d194f00} id="Vector" stroke="var(--stroke-0, #00A46E)" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>
      <p className="flex-[1_0_0] font-['Inter:Regular',sans-serif] font-normal leading-[normal] min-h-px min-w-px not-italic relative text-[#454545] text-[10px] whitespace-pre-wrap">Isolated container from ingress</p>
    </div>
  );
}

function Task1() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0 w-full" data-name="task">
      <div className="overflow-clip relative shrink-0 size-[16px]" data-name="Icons">
        <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[16px] top-1/2" data-name="Container" />
        <div className="absolute inset-[20.83%]" data-name="Vector">
          <div className="absolute inset-[-5.36%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.3333 10.3333">
              <path d={svgPaths.p2d194f00} id="Vector" stroke="var(--stroke-0, #00A46E)" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>
      <p className="flex-[1_0_0] font-['Inter:Regular',sans-serif] font-normal leading-[normal] min-h-px min-w-px not-italic relative text-[#454545] text-[10px] whitespace-pre-wrap">Applied patched dependency v2.17.1</p>
    </div>
  );
}

function Task2() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0 w-full" data-name="task">
      <div className="overflow-clip relative shrink-0 size-[16px]" data-name="Icons">
        <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[16px] top-1/2" data-name="Container" />
        <div className="absolute inset-[20.83%]" data-name="Vector">
          <div className="absolute inset-[-5.36%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.3333 10.3333">
              <path d={svgPaths.p2d194f00} id="Vector" stroke="var(--stroke-0, #00A46E)" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>
      <p className="flex-[1_0_0] font-['Inter:Regular',sans-serif] font-normal leading-[normal] min-h-px min-w-px not-italic relative text-[#454545] text-[10px] whitespace-pre-wrap">Redeployed service via CI/CD</p>
    </div>
  );
}

function Task3() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0 w-full" data-name="task">
      <div className="overflow-clip relative shrink-0 size-[16px]" data-name="Icons">
        <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[16px] top-1/2" data-name="Container" />
        <div className="absolute inset-[20.83%]" data-name="Vector">
          <div className="absolute inset-[-5.36%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.3333 10.3333">
              <path d={svgPaths.p2d194f00} id="Vector" stroke="var(--stroke-0, #00A46E)" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>
      <p className="flex-[1_0_0] font-['Inter:Regular',sans-serif] font-normal leading-[normal] min-h-px min-w-px not-italic relative text-[#454545] text-[10px] whitespace-pre-wrap">Post-deploy scan verified remediation</p>
    </div>
  );
}

function Tasks() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start justify-center relative shrink-0 w-[270px]" data-name="Tasks">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#454545] text-[10px] uppercase">What was done</p>
      <Task />
      <Task1 />
      <Task2 />
      <Task3 />
    </div>
  );
}

function Result() {
  return (
    <div className="content-stretch flex font-['Inter:Regular',sans-serif] font-normal gap-[4px] items-center leading-[normal] not-italic relative shrink-0 text-[10px] w-[270px]" data-name="Result">
      <p className="relative shrink-0 text-[#454545] uppercase">Result:</p>
      <p className="relative shrink-0 text-[#262626]">Patched and verified. Zero downtime.</p>
    </div>
  );
}

export default function TaskExpanded() {
  return (
    <div className="bg-[#030609] content-stretch flex flex-col gap-[16px] items-start p-[12px] relative rounded-[8px] size-full" data-name="TaskExpanded">
      <div aria-hidden="true" className="absolute border border-[#030609] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <Title />
      <Tasks />
      <Result />
    </div>
  );
}