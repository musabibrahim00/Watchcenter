import svgPaths from "./svg-8fodtn1stz";
import imgOld from "../assets/TeammateAvatar.png";

function Teammate() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-[194.667px]" data-name="Teammate">
      <div className="relative rounded-[96px] shrink-0 size-[32px]" data-name="TeammateAvatar">
        <div className="overflow-clip relative rounded-[inherit] size-full">
          <div className="absolute inset-[-2.94%]" data-name="old">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgOld} />
            </div>
          </div>
        </div>
        <div aria-hidden="true" className="absolute border-0 border-[#1e2a34] border-solid inset-0 pointer-events-none rounded-[96px]" />
      </div>
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[14px] not-italic relative shrink-0 text-[#dadfe3] text-[12px] whitespace-nowrap">Alex</p>
    </div>
  );
}

function Icons() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icons">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icons">
          <path d={svgPaths.p17435b80} id="Vector" stroke="var(--stroke-0, #62707D)" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
}

function Icons1() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icons">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icons">
          <g id="Vector">
            <path d={svgPaths.p2c04b380} stroke="var(--stroke-0, #62707D)" strokeLinecap="round" strokeLinejoin="round" />
            <path d={svgPaths.p13764280} stroke="var(--stroke-0, #62707D)" strokeLinecap="round" strokeLinejoin="round" />
            <path d={svgPaths.p2219fc40} stroke="var(--stroke-0, #62707D)" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function MoreOptions() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="MoreOptions">
      <Icons />
      <Icons1 />
    </div>
  );
}

function Header() {
  return (
    <div className="relative shrink-0 w-full z-[3]" data-name="Header">
      <div aria-hidden="true" className="absolute border-[#121e27] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between p-[16px] relative w-full">
          <Teammate />
          <MoreOptions />
        </div>
      </div>
    </div>
  );
}

function ChatArea() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative w-full z-[2]" data-name="ChatArea">
      <div className="flex flex-col items-center justify-end size-full">
        <div className="content-stretch flex flex-col gap-[16px] items-center justify-end px-[16px] size-full" />
      </div>
    </div>
  );
}

function InputArea() {
  return (
    <div className="input-area-bg flex-[1_0_0] h-[48px] min-h-px min-w-px relative rounded-[8px]" data-name="InputArea">
      <div aria-hidden="true" className="absolute border border-[#030609] border-solid inset-0 pointer-events-none rounded-[8px] shadow-[0px_24px_48px_0px_rgba(0,0,0,0.48)]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center p-[16px] relative size-full">
          <p className="flex-[1_0_0] font-['Inter:Regular',sans-serif] font-normal leading-[normal] min-h-px min-w-px not-italic relative text-[#89949e] text-[12px]">Ask me anything...</p>
        </div>
      </div>
    </div>
  );
}

function Field() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0 w-full" data-name="Field">
      <InputArea />
      <div className="bg-[#076498] content-stretch flex items-center justify-center relative rounded-[12px] shrink-0 size-[48px]" data-name="SendButton">
        <div className="overflow-clip relative shrink-0 size-[24px]" data-name="Icons">
          <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[16px] top-1/2" data-name="Container" />
          <div className="absolute inset-[16.67%]" data-name="icon">
            <div className="absolute inset-[-3.13%]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17.0009 17.0009">
                <path d={svgPaths.p32950080} id="icon" stroke="var(--stroke-0, #F1F3FF)" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Chat() {
  return (
    <div className="relative shrink-0 w-full z-[1]" data-name="Chat">
      <div className="content-stretch flex flex-col gap-[12px] items-start p-[16px] relative w-full">
        <Field />
      </div>
    </div>
  );
}

export default function AiBox() {
  return (
    <div className="bg-[rgba(3,6,9,0.16)] relative rounded-[16px] size-full" data-name="AiBox">
      <div className="content-stretch flex flex-col isolate items-center overflow-clip relative rounded-[inherit] size-full">
        <Header />
        <ChatArea />
        <Chat />
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(87,177,255,0.24)] border-solid inset-0 pointer-events-none rounded-[16px]" />
    </div>
  );
}