import imgInputArea from "figma:asset/1c91905cf1040f1f9ab28c91e0b812f347608093.png";

export default function InputArea() {
  return (
    <div className="content-stretch flex items-center p-[16px] relative rounded-[12px] size-full" data-name="InputArea">
      <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[12px] size-full" src={imgInputArea} />
      <div aria-hidden="true" className="absolute border border-[rgba(87,177,255,0.16)] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <p className="flex-[1_0_0] font-['Inter:Regular',sans-serif] font-normal leading-[normal] min-h-px min-w-px not-italic relative text-[#89949e] text-[12px]">Ask me anything...</p>
    </div>
  );
}