export function buildProposalNumber(
  createdAt: string,
  freelancerCode: string,
  version: number,
  proposalId: string
): string {
  const date = createdAt.split('T')[0].replace(/-/g, '')
  const suffix = proposalId.replace(/-/g, '').slice(0, 6).toUpperCase()
  return `${date}-${freelancerCode}-${suffix}-v${version}`
}
