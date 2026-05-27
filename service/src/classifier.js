/**
 * Rule-based classifier based on ADR-002.
 * @param {Object} descriptors - { sides, symmetry_axes, convex_hull_ratio }
 * @returns {string} category name
 */
function classify(descriptors) {
    const { sides, symmetry_axes, convex_hull_ratio } = descriptors;

    // Basic rules (extend as needed)
    if (sides === 0 || sides === null) {
        return 'circle';
    } else if (sides === 3) {
        return 'triangle';
    } else if (sides === 4) {
        // Differentiate square vs rectangle using symmetry and convex hull ratio
        if (symmetry_axes >= 4 && convex_hull_ratio > 0.9) {
            return 'square';
        } else {
            return 'rectangle';
        }
    } else if (sides === 5) {
        return 'pentagon';
    } else if (sides === 6) {
        return 'hexagon';
    } else if (sides > 6) {
        return 'polygon';
    } else {
        return 'unknown';
    }
}

module.exports = classify;