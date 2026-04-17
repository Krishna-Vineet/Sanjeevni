/**
 * Scoring engine logic for matching hospitals to transfer requests.
 */

function computeMatchScore(hospital, request, distanceKm) {
    /**
     * score = 0.4 * specialization_match
     *       + 0.3 * proximity_score (inverse distance, capped)
     *       + 0.2 * normalized_rating
     *       + 0.1 * resource_availability
     */
    
    const requiredResources = (request.required_resources || []).map(r => r.toLowerCase());
    const hospitalResources = [];
    
    if (hospital.icu_beds > 0) hospitalResources.push("icu");
    if (hospital.ventilators > 0) hospitalResources.push("ventilator");
    if (hospital.oxygen_units > 0) hospitalResources.push("oxygen");
    if (hospital.general_beds > 0) hospitalResources.push("general");

    const matchCount = requiredResources.filter(r => hospitalResources.includes(r)).length;
    const specScore = requiredResources.length > 0 ? matchCount / requiredResources.length : 1.0;

    // Proximity score (closer = better, max at 1km, min at 50km+)
    const proximityScore = Math.max(0, 1 - (distanceKm / 50));

    // Rating score (normalized 0-1, assuming max 5.0)
    const ratingScore = ratingCheck((hospital.rating || 4.0) / 5.0);

    // Elite Trust Score (normalized 0-1, assuming max 100)
    const trustScore = (hospital.trust_score || 60.0) / 100.0;

    // Resource availability
    const availScore = specScore;

    const score = (0.35 * specScore + 
                   0.25 * proximityScore + 
                   0.15 * ratingScore + 
                   0.15 * trustScore + 
                   0.10 * availScore);

    return parseFloat(score.toFixed(2));
}

function ratingCheck(rating) {
    return isNaN(rating) ? 0.8 : rating;
}

module.exports = { computeMatchScore };
