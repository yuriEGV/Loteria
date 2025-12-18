/**
 * Calculates the fair winner based on:
 * - Join Order (50% weight)
 * - Time on Platform (30% weight)
 * - Months in Group (20% weight)
 * 
 * @param {Array} participants - List of participants in the group
 * @returns {Object} - The winner object
 */
function calculateFairWinner(participants) {
    if (!participants || participants.length === 0) return null;

    // Calculate scores
    const scoredParticipants = participants.map(p => {
        // Ensure values exist to avoid NaN
        const joinOrder = p.joinOrder || 0;
        const monthsInGroup = p.monthsInGroup || 0;
        // Assuming 'user' is populated and has 'totalMonths'
        const totalMonths = p.user ? (p.user.totalMonths || 0) : 0;

        const score = (joinOrder * 0.5) +
            (monthsInGroup * 0.3) +
            (totalMonths * 0.2);

        return { ...p, score };
    });

    // Find the one with the highest score
    // Note: The user's snippet uses reduce to find the max score.
    // Logic check: If joinOrder 1 is "first", then higher joinOrder is "later".
    // Usually earlier joiners should be favored? 
    // If "Join Order" means "Position in queue" (1st, 2nd, 3rd...), then LOWER is better?
    // User says "Orden de llegada (50% peso)".
    // If the formula is (joinOrder * 0.5), then Higher Join Order = Higher Score.
    // This implies later joiners get higher scores if we maximize score.
    // OR "joinOrder" is a score where higher is better (e.g. inverted rank).
    // I will implement strictly as requested: (p.joinOrder * 0.5) + ... and max score wins.
    // It's possible the user intends for "joinOrder" to be a value derived from "earliness" where earlier = higher value.
    // For now I follow the code snippet provided verbatim.

    return scoredParticipants.reduce((winner, current) =>
        current.score > winner.score ? current : winner
    );
}

/**
 * Calculates the join position for a new member
 * @param {Array} participants 
 * @param {Object} user 
 * @returns {Number} Position
 */
function calculateFairPosition(participants, user) {
    // Placeholder implementation for position calculation
    // Depending on requirements, this might just be length + 1
    return participants.length + 1;
}

module.exports = { calculateFairWinner, calculateFairPosition };
