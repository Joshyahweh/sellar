export function GrowthLabel({ value }: { value: number | null }) {
  if (value === null) {
    return <span className="text-[13px] font-semibold text-[#04588f]">New</span>;
  }

  const rounded = Math.round(value * 10) / 10;
  const tone = rounded > 0 ? "text-[#0b5c32]" : rounded < 0 ? "text-[#c4004c]" : "text-[#3d4650]";
  const sign = rounded > 0 ? "+" : "";
  return (
    <span className={`text-[13px] font-semibold ${tone}`}>
      {sign}
      {rounded.toFixed(1)}%
    </span>
  );
}
