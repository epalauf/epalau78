"use client";

const HEX_COLOR = /^#[0-9a-f]{6}$/i;

type ColorPickerProps = {
  swatches: readonly string[];
  value: string;
  onChange: (color: string) => void;
  /** Accessible label for the free color picker button */
  customLabel: string;
};

/** Quick swatches plus a rainbow button that opens the native color picker. */
export default function ColorPicker({
  swatches,
  value,
  onChange,
  customLabel,
}: Readonly<ColorPickerProps>) {
  const isCustom = !swatches.includes(value);

  return (
    <div className="flex flex-wrap gap-1.5">
      {swatches.map((color) => (
        <button
          key={color}
          onClick={() => onChange(color)}
          aria-label={color}
          className={`size-6 rounded-full border-2 transition-transform hover:scale-110 ${
            value === color ? "border-fir" : "border-white/60"
          }`}
          style={{ backgroundColor: color }}
        />
      ))}
      <label
        title={customLabel}
        className={`relative size-6 cursor-pointer rounded-full border-2 transition-transform hover:scale-110 ${
          isCustom ? "border-fir" : "border-white/60"
        }`}
        style={{
          background: isCustom
            ? value
            : "conic-gradient(#e8554d, #e8b54a, #6fa470, #7ab5c4, #8f7ac4, #d98fb0, #e8554d)",
        }}
      >
        <input
          type="color"
          value={HEX_COLOR.test(value) ? value : "#7cb56b"}
          onChange={(e) => onChange(e.target.value)}
          aria-label={customLabel}
          className="absolute inset-0 size-full cursor-pointer opacity-0"
        />
      </label>
    </div>
  );
}
