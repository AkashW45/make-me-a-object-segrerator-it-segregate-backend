/**
 * Rule-based classifier based on ADR-002.
 * Extended to assign a color per ADR-001 (color segregation).
 * @param {Object} descriptors - { sides, symmetry_axes, convex_hull_ratio }
 * @returns {Object} { category: string, color: string }
 */
function classify(descriptors) {
    const { sides, symmetry_axes, convex_hull_ratio } = descriptors;

    let category;

    // Basic rules (extend as needed)
    if (sides === 0 || sides === null) {
        category = 'circle';
    } else if (sides === 3) {
        category = 'triangle';
    } else if (sides === 4) {
        // Differentiate square vs rectangle using symmetry and convex hull ratio
        if (symmetry_axes >= 4 && convex_hull_ratio > 0.9) {
            category = 'square';
        } else {
            category = 'rectangle';
        }
    } else if (sides === 5) {
        category = 'pentagon';
    } else if (sides === 6) {
        category = 'hexagon';
    } else if (sides > 6) {
        category = 'polygon';
    } else {
        category = 'unknown';
    }

    // Color mapping based on category (configurable rules per ADR-001)
    const colorMap = {
        circle: 'red',
        triangle: 'green',
        square: 'blue',
        rectangle: 'yellow',
        pentagon: 'orange',
        hexagon: 'purple',
        polygon: 'pink',
        unknown: 'gray'
    };
    const color = colorMap[category] || 'gray';

    return { category, color };
}

module.exports = classify;