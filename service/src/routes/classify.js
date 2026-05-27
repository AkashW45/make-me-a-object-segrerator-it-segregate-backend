const express = require('express');
const router = express.Router();
const classify = require('../classifier');
const db = require('../db');

// POST /classify - classify a shape and store result
router.post('/', (req, res) => {
    const { sides, symmetry_axes, convex_hull_ratio } = req.body;

    // Validate required fields
    if (sides === undefined || symmetry_axes === undefined || convex_hull_ratio === undefined) {
        return res.status(400).json({ error: 'Missing required fields: sides, symmetry_axes, convex_hull_ratio' });
    }

    // Validate types
    if (typeof sides !== 'number' || typeof symmetry_axes !== 'number' || typeof convex_hull_ratio !== 'number') {
        return res.status(400).json({ error: 'All fields must be numbers' });
    }

    try {
        const category = classify({ sides, symmetry_axes, convex_hull_ratio });

        // Store in database
        const stmt = db.prepare('INSERT INTO objects (sides, symmetry_axes, convex_hull_ratio, category) VALUES (?, ?, ?, ?)');
        const info = stmt.run(sides, symmetry_axes, convex_hull_ratio, category);

        // Return result
        res.json({
            id: Number(info.lastInsertRowid),
            category,
            descriptors: { sides, symmetry_axes, convex_hull_ratio }
        });
    } catch (err) {
        console.error('Classification error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /classify/history - retrieve all stored classifications
router.get('/history', (req, res) => {
    try {
        const rows = db.prepare('SELECT * FROM objects ORDER BY created_at DESC').all();
        res.json(rows);
    } catch (err) {
        console.error('History fetch error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;