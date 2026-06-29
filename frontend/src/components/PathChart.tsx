import type { PathPoint } from "../engine/Asset/AssetRegistry";

const COLORS: Array<{ base: string, light: string }> = [
    { base: "#2563eb", light: "" },
    { base: "#dc2626", light: "" },
    { base: "#16a34a", light: "" },
]

const WIDTH = 700;
const HEIGHT = 400;
const PAD = 40;

export function PathChart({
    paths,
    years,
}: {
    paths: Array<Array<PathPoint>>
    years: number,
}) {

    const allPrices = paths.flat().flatMap(p => [p.price, p.fairPrice || p.price]);
    const minP = Math.min(...allPrices);
    const maxP = Math.max(...allPrices);
    
    function toXY(t: number, price: number): [number, number] {
        const x = PAD + (t / years) * (WIDTH - 2 * PAD);
        const y = HEIGHT - PAD - ((price - minP) / (maxP - minP || 1)) * (HEIGHT - 2 * PAD);
        return [x, y];
    }

    return <svg width={WIDTH} height={HEIGHT} style={{ border: "1px solid #ccc" }}>
                {paths.map((path, i) => (
                    <polyline
                        key={i}
                        fill="none"
                        stroke={COLORS[i % COLORS.length].base}
                        strokeWidth={1.5}
                        points={path.map(p => toXY(p.t, p.price).join(",")).join(" ")}
                    />
                ))}
                {/* fair price reference, dashed */}
                {paths.map((path, i) => (
                    <polyline
                        fill="none"
                        stroke={COLORS[i % COLORS.length].base}
                        strokeDasharray="4 4"
                        strokeWidth={1}
                        points={path
                            .filter(p => p.fairPrice) // Remove any points with no fair price. 
                            .map(p => toXY(p.t, p.fairPrice as number).join(",")).join(" ")}
                    />
                ))}

            </svg>
}