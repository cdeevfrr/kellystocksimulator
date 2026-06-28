export function equalWeights(assetIds: string[]): Record<string, number> {
  const w = assetIds.length > 0 ? 1 / assetIds.length : 0;
  return Object.fromEntries(assetIds.map((id) => [id, w]));
}