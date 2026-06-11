export function buildProposalNumber(
  createdAt: string,
  freelancerCode: string,
  version: number
): string {
  const date = createdAt.split('T')[0].replace(/-/g, '')
  return `${date}-${freelancerCode}-v${version}`
}
