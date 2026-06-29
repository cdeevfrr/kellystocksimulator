export function SliderField({
    label,
    value,
    onChange,
    min,
    max,
    step,
  }: {
    label: string, 
    value: number,
    onChange: (v: any) => void,
    min: number,
    max: number,
    step: number | 'any',
}) {
    return (
        <label style={{ display: "block", marginBottom: 10, fontSize: 13 }}>
            {label}: {value.toFixed(2)}
            <input
                type="range"
                min={min} max={max} step={step}
                value={value}
                onChange={e => onChange(parseFloat(e.target.value))}
                style={{ display: "block", width: "100%" }}
            />
        </label>
    );
}