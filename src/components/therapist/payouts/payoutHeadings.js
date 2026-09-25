/**
 * Maps a derived payout state key to the H1 and subheading shown on /therapist/payouts.
 *
 * @type {Record<string, { h1: string, subheading: string }>}
 */
export const PAYOUT_HEADINGS = {
    notConnected: {
        h1: "Set Up Your Payout Account",
        subheading: "Connect your bank account to receive payments for your sessions.",
    },
    pastDue: {
        h1: "Restore Your Payout Account",
        subheading: "Stripe needs overdue information before your payouts can resume.",
    },
    currentlyDue: {
        h1: "Update Your Payout Information",
        subheading: "Stripe requires updated information to keep your payouts active.",
    },
    upcoming: {
        h1: "Review Upcoming Requirements",
        subheading: "Stripe will require new information soon. Complete it now to avoid interruption.",
    },
    active: {
        h1: "Payout Account",
        subheading: "Your payout account is active.",
    },
};

/**
 * Derives the payout heading state key from a Stripe connect status object.
 *
 * @param {{ connected?: boolean, pastDueCount?: number, currentlyDueCount?: number, hasUpcomingRequirements?: boolean }} stripeStatus
 * @returns {keyof typeof PAYOUT_HEADINGS}
 */
export function getPayoutHeadingKey(stripeStatus) {
    if (!stripeStatus?.connected) return "notConnected";
    if ((stripeStatus.pastDueCount ?? 0) > 0) return "pastDue";
    if ((stripeStatus.currentlyDueCount ?? 0) > 0) return "currentlyDue";
    if (stripeStatus.hasUpcomingRequirements) return "upcoming";
    return "active";
}