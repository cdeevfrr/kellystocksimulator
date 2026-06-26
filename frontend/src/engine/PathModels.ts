

export function gbmIncrement(mu: number, sigma: number, dt: number, gaussian: number){
    const drift = (mu - 0.5 * sigma**2) * dt; // 
    const diffusion = sigma * Math.sqrt(dt) * gaussian;
    return drift + diffusion
}