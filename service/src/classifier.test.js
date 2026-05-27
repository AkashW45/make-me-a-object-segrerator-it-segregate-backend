const classify = require('./classifier');

describe('classify', () => {
  describe('happy path', () => {
    test('classify circle when sides is 0 or null', () => {
      expect(classify({ sides: 0 })).toBe('circle');
      expect(classify({ sides: null })).toBe('circle');
    });

    test('classify triangle, pentagon, hexagon based on sides', () => {
      expect(classify({ sides: 3 })).toBe('triangle');
      expect(classify({ sides: 5 })).toBe('pentagon');
      expect(classify({ sides: 6 })).toBe('hexagon');
    });

    test('classify polygon for sides greater than 6', () => {
      expect(classify({ sides: 7 })).toBe('polygon');
      expect(classify({ sides: 100 })).toBe('polygon');
    });
  });

  describe('edge case: square vs rectangle', () => {
    test('should return square when symmetry_axes >= 4 and convex_hull_ratio > 0.9', () => {
      const squareDescriptor = { sides: 4, symmetry_axes: 4, convex_hull_ratio: 1 };
      expect(classify(squareDescriptor)).toBe('square');
    });

    test('should return rectangle otherwise', () => {
      // symmetry_axes less than 4
      expect(classify({ sides: 4, symmetry_axes: 3, convex_hull_ratio: 1 })).toBe('rectangle');
      // convex_hull_ratio exactly 0.9 (not > 0.9)
      expect(classify({ sides: 4, symmetry_axes: 4, convex_hull_ratio: 0.9 })).toBe('rectangle');
      // convex_hull_ratio below 0.9
      expect(classify({ sides: 4, symmetry_axes: 4, convex_hull_ratio: 0.5 })).toBe('rectangle');
    });
  });

  describe('edge case: unknown category', () => {
    test('should return unknown for unexpected input', () => {
      expect(classify({ sides: -1 })).toBe('unknown');
      expect(classify({ sides: undefined })).toBe('unknown');
      expect(classify({})).toBe('unknown'); // sides missing
    });
  });

  describe('error path', () => {
    test('should throw TypeError when descriptors is null or not an object', () => {
      expect(() => classify(null)).toThrow(TypeError);
      expect(() => classify(undefined)).toThrow(TypeError);
      expect(() => classify(42)).toThrow(TypeError);
      expect(() => classify('string')).toThrow(TypeError);
    });
  });
});