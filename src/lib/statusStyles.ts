/* =========================================================================
 * THE STATUS → STYLE MAPPING
 *
 * One module owns the question "what colour is this status?". It previously
 * lived as four separate copies of a function called getStatusBadge, which
 * had already drifted: they disagreed about which statuses were green.
 *
 * There are two genuinely different vocabularies here and they are kept
 * apart deliberately. Conflating them is what let a case-progress value
 * ("Completed") pick up an evidence verdict's colour.
 *
 *   Evidence status  — what the forensics found. Carries a verdict, so its
 *                      colours mean something and NOT_ASSESSED must be
 *                      visually distinct from every one of them.
 *   Case progress    — how far through the wizard a case is. Carries no
 *                      verdict at all and must never render as one.
 * ========================================================================= */

import { NOT_ASSESSED, StandardEvidenceStatus } from '../types';

/**
 * Colour for a forensic verdict.
 *
 * The NOT_ASSESSED branch is the load-bearing one: a gap is grey and dashed,
 * never a colour that reads as a finding. It is checked first so that no
 * substring coincidence can route a gap into a verdict colour.
 */
export function getStatusBadge(status: StandardEvidenceStatus | string): string {
  const value = String(status);

  // A gap is not a low score and not a caution. It is the absence of a claim.
  if (value.includes('NOT ASSESSED') || value.includes(NOT_ASSESSED)) {
    return 'bg-zinc-900/80 border-dashed border-zinc-700 text-zinc-500';
  }
  if (value.includes('Inconsistent') || value.includes('INCONSISTENT') || value.includes('🔴')) {
    return 'bg-rose-950/80 border-rose-700 text-rose-300';
  }
  if (
    value.includes('Needs') ||
    value.includes('NEEDS') ||
    value.includes('Tampered') ||
    value.includes('🟠')
  ) {
    return 'bg-amber-950/80 border-amber-700 text-amber-300';
  }
  if (
    value.includes('Consistent') ||
    value.includes('CONSISTENT') ||
    value.includes('Verified') ||
    value.includes('Untampered') ||
    value.includes('🟢')
  ) {
    return 'bg-emerald-950/80 border-emerald-700 text-emerald-300';
  }
  // Estimated, or anything unrecognised: neutral blue, no verdict weight.
  return 'bg-blue-950/80 border-blue-700 text-blue-300';
}

/**
 * Colour for a case's position in the workflow.
 *
 * "Completed" here means the investigator finished the five steps — it says
 * nothing about what they found, so it deliberately does not borrow the
 * evidence palette's green.
 */
export function getCaseProgressBadge(status: string): string {
  if (status.includes('Completed') || status.includes('Ready')) {
    return 'bg-emerald-950/80 border-emerald-700 text-emerald-300';
  }
  return 'bg-purple-950/80 border-purple-700 text-purple-300';
}
