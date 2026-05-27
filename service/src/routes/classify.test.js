const request = require('supertest');
const express = require('express');

// Mock the dependencies before loading the router
jest.mock('../classifier', () => jest.fn());
jest.mock('../db', () => ({
    prepare: jest.fn(() => ({
        run: jest.fn(() => ({ lastInsertRowid: 1 })),
        all: jest.fn(() => [
            { id: 1, sides: 3, symmetry_axes: 3, convex_hull_ratio: 0.8, category: 'Triangle' },
            { id: 2, sides: 4, symmetry_axes: 4, convex_hull_ratio: 0.9, category: 'Square' }
        ])
    }))
}));

const classify = require('../classifier');
const db = require('../db');
const classifyRouter = require('../routes/classify');

describe('Classify Router', () => {
    let app;

    beforeEach(() => {
        // Reset mocks before each test
        jest.clearAllMocks();
        app = express();
        app.use(express.json());
        app.use('/classify', classifyRouter);
    });

    describe('POST /classify', () => {
        const validPayload = { sides: 3, symmetry_axes: 3, convex_hull_ratio: 0.8 };

        it('should classify valid shape and return result with id', async () => {
            classify.mockReturnValue('Triangle');

            const res = await request(app)
                .post('/classify')
                .send(validPayload)
                .expect(200);

            expect(res.body).toEqual({
                id: 1,
                category: 'Triangle',
                descriptors: validPayload
            });
            expect(classify).toHaveBeenCalledWith(validPayload);
            expect(db.prepare).toHaveBeenCalledWith('INSERT INTO objects (sides, symmetry_axes, convex_hull_ratio, category) VALUES (?, ?, ?, ?)');
            // Check that run was called with correct arguments
            const mockRun = db.prepare.mock.results[0].value.run;
            expect(mockRun).toHaveBeenCalledWith(3, 3, 0.8, 'Triangle');
        });

        it('should return 400 if required fields are missing', async () => {
            const res = await request(app)
                .post('/classify')
                .send({ sides: 3 })
                .expect(400);

            expect(res.body.error).toBe('Missing required fields: sides, symmetry_axes, convex_hull_ratio');
        });

        it('should return 400 if fields are not numbers', async () => {
            const res = await request(app)
                .post('/classify')
                .send({ sides: 'three', symmetry_axes: 3, convex_hull_ratio: 0.8 })
                .expect(400);

            expect(res.body.error).toBe('All fields must be numbers');
        });

        it('should return 500 if classifier throws an error', async () => {
            classify.mockImplementation(() => { throw new Error('Classification failed'); });

            const res = await request(app)
                .post('/classify')
                .send(validPayload)
                .expect(500);

            expect(res.body.error).toBe('Internal server error');
        });
    });

    describe('GET /classify/history', () => {
        it('should return all stored classifications', async () => {
            const mockAll = db.prepare.mock.results[0].value.all;
            mockAll.mockReturnValue([
                { id: 1, sides: 3, symmetry_axes: 3, convex_hull_ratio: 0.8, category: 'Triangle' },
                { id: 2, sides: 4, symmetry_axes: 4, convex_hull_ratio: 0.9, category: 'Square' }
            ]);

            const res = await request(app)
                .get('/classify/history')
                .expect(200);

            expect(res.body).toHaveLength(2);
            expect(res.body[0].id).toBe(1);
            expect(db.prepare).toHaveBeenCalledWith('SELECT * FROM objects ORDER BY created_at DESC');
        });

        it('should return 500 if database fails', async () => {
            db.prepare.mockImplementation(() => {
                throw new Error('DB error');
            });

            const res = await request(app)
                .get('/classify/history')
                .expect(500);

            expect(res.body.error).toBe('Internal server error');
        });
    });
});