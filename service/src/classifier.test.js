const classify = require('./classifier');

describe('classify', () => {
    test('should classify circle when sides is 0', () => {
        const descriptors = { sides: 0, symmetry_axes: 0, convex_hull_ratio: 0 };
        expect(classify(descriptors)).toEqual({ category: 'circle', color: 'red' });
    });

    test('should classify circle when sides is null', () => {
        const descriptors = { sides: null, symmetry_axes: 0, convex_hull_ratio: 0 };
        expect(classify(descriptors)).toEqual({ category: 'circle', color: 'red' });
    });

    test('should classify triangle with correct color', () => {
        const descriptors = { sides: 3, symmetry_axes: 2, convex_hull_ratio: 0.8 };
        expect(classify(descriptors)).toEqual({ category: 'triangle', color: 'green' });
    });

    test('should classify square using high symmetry and convex hull ratio', () => {
        const descriptors = { sides: 4, symmetry_axes: 4, convex_hull_ratio: 0.95 };
        expect(classify(descriptors)).toEqual({ category: 'square', color: 'blue' });
    });

    test('should classify rectangle when 4-sided but not square', () => {
        const descriptors = { sides: 4, symmetry_axes: 2, convex_hull_ratio: 0.8 };
        expect(classify(descriptors)).toEqual({ category: 'rectangle', color: 'yellow' });
    });

    test('should classify pentagon', () => {
        const descriptors = { sides: 5, symmetry_axes: 1, convex_hull_ratio: 0.7 };
        expect(classify(descriptors)).toEqual({ category: 'pentagon', color: 'orange' });
    });

    test('should classify hexagon', () => {
        const descriptors = { sides: 6, symmetry_axes: 1, convex_hull_ratio: 0.7 };
        expect(classify(descriptors)).toEqual({ category: 'hexagon', color: 'purple' });
    });

    test('should classify polygon for sides > 6', () => {
        const descriptors = { sides: 7, symmetry_axes: 1, convex_hull_ratio: 0.7 };
        expect(classify(descriptors)).toEqual({ category: 'polygon', color: 'pink' });
    });

    test('should classify unknown when sides is negative number', () => {
        const descriptors = { sides: -2, symmetry_axes: 1, convex_hull_ratio: 0.5 };
        expect(classify(descriptors)).toEqual({ category: 'unknown', color: 'gray' });
    });

    test('should classify unknown when sides property is missing', () => {
        const descriptors = { symmetry_axes: 2, convex_hull_ratio: 0.8 };
        expect(classify(descriptors)).toEqual({ category: 'unknown', color: 'gray' });
    });

    test('should throw TypeError when descriptors is null', () => {
        expect(() => classify(null)).toThrow(TypeError);
    });
});