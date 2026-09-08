import 'dotenv/config';
import request from 'supertest';
import app from '../src/app.js';
import pool from '../src/config/db.js';

describe('Feature: Hotel Reviews (ID: 22201230)', () => {
    const studentId = '22201230';
    const testUserEmail = `qa_student_${studentId}@trippin-test.com`;
    const testPassword = 'Password123!';
    let authToken = '';
    let testHotelId = null;
    let createdReviewId = null;

    beforeAll(async () => {
        // 1. Ensure test user exists; register if not already present
        try {
            await request(app)
                .post('/api/auth/register')
                .send({
                    email: testUserEmail,
                    password: testPassword
                });
        } catch {
            // User might already exist from a previous run; proceed to login
        }

        // 2. Dynamic Authentication: Log in to obtain fresh JWT token (NO hardcoded static tokens)
        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({
                email: testUserEmail,
                password: testPassword
            });

        expect(loginRes.status).toBe(200);
        authToken = loginRes.body.token;
        expect(authToken).toBeDefined();

        // 3. Obtain a valid hotel_id from the database to test reviews against
        const hotelResult = await pool.query('SELECT id FROM hotels ORDER BY id ASC LIMIT 1');
        if (hotelResult.rows.length > 0) {
            testHotelId = hotelResult.rows[0].id;
        } else {
            // Fallback: create a mock hotel if database has none
            const newHotel = await pool.query(
                `INSERT INTO hotels (name, location, price_per_night, rating, total_rooms)
                 VALUES ($1, $2, $3, $4, $5) RETURNING id`,
                ['Test Grand Hotel', 'Test City', 150, 4.5, 20]
            );
            testHotelId = newHotel.rows[0].id;
        }
    });

    afterAll(async () => {
        // Clean up any test reviews and the test user created during the test run
        try {
            await pool.query('DELETE FROM reviews WHERE user_email = $1', [testUserEmail]);
            await pool.query('DELETE FROM users WHERE email = $1', [testUserEmail]);
        } catch (cleanupErr) {
            console.error('Cleanup warning:', cleanupErr.message);
        } finally {
            // Close pool to allow test runner to exit cleanly
            await pool.end();
        }
    });

    // =========================================================================
    // Case A: Positive Flow (Happy Path)
    // =========================================================================
    describe('Case A: Positive Flow (Happy Path)', () => {
        it('should successfully create a new hotel review with status 201 (POST /api/reviews)', async () => {
            const reviewPayload = {
                hotel_id: testHotelId,
                user_email: testUserEmail,
                rating: 5,
                comment: 'Outstanding hospitality, spotless rooms, and breathtaking views!'
            };

            const response = await request(app)
                .post('/api/reviews')
                .set('Authorization', `Bearer ${authToken}`)
                .send(reviewPayload);

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id');
            expect(response.body.hotel_id).toBe(testHotelId);
            expect(response.body.user_email).toBe(testUserEmail);
            expect(response.body.rating).toBe(5);
            expect(response.body.comment).toBe(reviewPayload.comment);

            createdReviewId = response.body.id;
        });

        it('should retrieve all reviews for the hotel with status 200 (GET /api/reviews/:hotelId)', async () => {
            const response = await request(app)
                .get(`/api/reviews/${testHotelId}`);

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);

            const foundCreated = response.body.find((r) => r.id === createdReviewId);
            expect(foundCreated).toBeDefined();
            expect(foundCreated.user_email).toBe(testUserEmail);
            expect(foundCreated.rating).toBe(5);
        });

        it('should retrieve the specific created review by ID with status 200 (GET /api/reviews/single/:id)', async () => {
            const response = await request(app)
                .get(`/api/reviews/single/${createdReviewId}`);

            expect(response.status).toBe(200);
            expect(response.body.id).toBe(createdReviewId);
            expect(response.body.hotel_id).toBe(testHotelId);
            expect(response.body.user_email).toBe(testUserEmail);
            expect(response.body.rating).toBe(5);
        });
    });

    // =========================================================================
    // Case B: Negative Flow (Validation & Errors)
    // =========================================================================
    describe('Case B: Negative Flow (Validation & Errors)', () => {
        it('should return 400 Bad Request when required fields are missing (POST /api/reviews)', async () => {
            const invalidPayload = {
                hotel_id: testHotelId
                // user_email and rating are missing
            };

            const response = await request(app)
                .post('/api/reviews')
                .set('Authorization', `Bearer ${authToken}`)
                .send(invalidPayload);

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toMatch(/required/i);
        });

        it('should return 400 Bad Request when rating is out of allowed range 1-5 (POST /api/reviews)', async () => {
            const invalidRatingPayload = {
                hotel_id: testHotelId,
                user_email: testUserEmail,
                rating: 7, // Invalid rating (> 5)
                comment: 'Invalid rating test'
            };

            const response = await request(app)
                .post('/api/reviews')
                .set('Authorization', `Bearer ${authToken}`)
                .send(invalidRatingPayload);

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toMatch(/between 1 and 5/i);
        });

        it('should return 404 Not Found when requesting reviews for non-existent hotel (GET /api/reviews/:hotelId)', async () => {
            const nonExistentHotelId = 999999;

            const response = await request(app)
                .get(`/api/reviews/${nonExistentHotelId}`);

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toMatch(/Hotel not found/i);
        });

        it('should return 404 Not Found when retrieving a non-existent single review (GET /api/reviews/single/:id)', async () => {
            const nonExistentReviewId = 999999;

            const response = await request(app)
                .get(`/api/reviews/single/${nonExistentReviewId}`);

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toMatch(/Review not found/i);
        });
    });

    // =========================================================================
    // Case C: Security & Boundary
    // =========================================================================
    describe('Case C: Security & Boundary', () => {
        it('should return 401 Unauthorized when Authorization header is omitted (POST /api/reviews)', async () => {
            const reviewPayload = {
                hotel_id: testHotelId,
                user_email: testUserEmail,
                rating: 4,
                comment: 'Attempting review creation without auth header'
            };

            const response = await request(app)
                .post('/api/reviews')
                .send(reviewPayload);

            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('message');
            expect(response.body.message).toMatch(/Authentication required/i);
        });

        it('should return 401 Unauthorized when an invalid or malformed bearer token is provided (POST /api/reviews)', async () => {
            const reviewPayload = {
                hotel_id: testHotelId,
                user_email: testUserEmail,
                rating: 4,
                comment: 'Attempting review creation with bogus token'
            };

            const response = await request(app)
                .post('/api/reviews')
                .set('Authorization', 'Bearer invalid.bogus.token')
                .send(reviewPayload);

            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('message');
            expect(response.body.message).toMatch(/Invalid or expired token/i);
        });
    });

    // =========================================================================
    // Case D: Deletion & Full CRUD Lifecycle
    // =========================================================================
    describe('Case D: Deletion & CRUD Cleanup', () => {
        it('should successfully delete the created review by ID with status 200 (DELETE /api/reviews/:id)', async () => {
            expect(createdReviewId).toBeDefined();

            const response = await request(app)
                .delete(`/api/reviews/${createdReviewId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message');
            expect(response.body.message).toMatch(/deleted successfully/i);
        });

        it('should return 404 Not Found when trying to delete a non-existent review (DELETE /api/reviews/:id)', async () => {
            const nonExistentReviewId = 999999;

            const response = await request(app)
                .delete(`/api/reviews/${nonExistentReviewId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toMatch(/Review not found/i);
        });
    });
});
