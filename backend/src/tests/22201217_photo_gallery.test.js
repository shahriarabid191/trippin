import 'dotenv/config';
import request from 'supertest';
import app from '../src/app.js';
import pool from '../src/config/db.js';
import fs from 'fs';

describe('Feature: Photo Gallery (ID: 22201217)', () => {
    const studentId = '22201217';
    const testUserEmail = `qa_student_${studentId}@trippin-test.com`;
    const testPassword = 'Password123!';

    let authToken = '';
    let testUserId = null;
    let createdPhotoId = null;

    // Small 1x1 valid PNG buffer for testing image uploads
    const samplePngBuffer = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        'base64'
    );

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
            // User may already exist; continue
        }

        // 2. Dynamic Authentication: Log in to obtain fresh JWT token (NO static hardcoded tokens)
        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({ email: testUserEmail, password: testPassword });

        expect(loginRes.status).toBe(200);
        authToken = loginRes.body.token;
        testUserId = loginRes.body.user.id;
        expect(authToken).toBeDefined();
    });

    afterAll(async () => {
        // Clean up created test photos, disk files, and the test user
        try {
            const files = await pool.query(
                'SELECT file_path FROM gallery_photos WHERE user_id = $1',
                [testUserId]
            );
            for (const row of files.rows) {
                if (row.file_path && fs.existsSync(row.file_path)) {
                    try {
                        fs.unlinkSync(row.file_path);
                    } catch {
                        // Ignore file unlink error
                    }
                }
            }

            await pool.query('DELETE FROM gallery_photos WHERE user_id = $1', [testUserId]);
            await pool.query('DELETE FROM users WHERE id = $1', [testUserId]);
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
        // Test 1: Create Resource
        it('should successfully upload a new photo with status 201 (POST /api/gallery)', async () => {
            const response = await request(app)
                .post('/api/gallery')
                .set('Authorization', `Bearer ${authToken}`)
                .field('caption', 'Sunset over the Bay of Bengal')
                .field('isPublic', 'true')
                .attach('image', samplePngBuffer, { filename: 'sunset.png', contentType: 'image/png' });

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('message', 'Photo uploaded');
            expect(response.body).toHaveProperty('photo');
            expect(response.body.photo).toHaveProperty('id');
            expect(response.body.photo.caption).toBe('Sunset over the Bay of Bengal');
            expect(response.body.photo.isPublic).toBe(true);

            createdPhotoId = response.body.photo.id;
        });

        // Test 2: Retrieve Resource
        it("should retrieve the signed-in user's gallery photos with status 200 (GET /api/gallery/mine)", async () => {
            const response = await request(app)
                .get('/api/gallery/mine')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);

            const foundPhoto = response.body.find((p) => p.id === createdPhotoId);
            expect(foundPhoto).toBeDefined();
            expect(foundPhoto.caption).toBe('Sunset over the Bay of Bengal');
        });
    });

    // =========================================================================
    // Case B: Negative Flow (Validation & Errors)
    // =========================================================================
    describe('Case B: Negative Flow (Validation & Errors)', () => {
        // Test 3: Validation Error
        it('should return 400 Bad Request when required image file is missing (POST /api/gallery)', async () => {
            const response = await request(app)
                .post('/api/gallery')
                .set('Authorization', `Bearer ${authToken}`)
                .field('caption', 'Photo without file');

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message');
            expect(response.body.message).toMatch(/image is required/i);
        });

        // Test 4: Resource Not Found
        it('should return 404 Not Found when attempting to delete a non-existent photo (DELETE /api/gallery/:id)', async () => {
            const nonExistentPhotoId = 999999;

            const response = await request(app)
                .delete(`/api/gallery/${nonExistentPhotoId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('message');
            expect(response.body.message).toMatch(/Photo not found/i);
        });
    });

    // =========================================================================
    // Case C: Security & Boundary
    // =========================================================================
    describe('Case C: Security & Boundary', () => {
        // Test 5: Unauthorized Access
        it('should return 401 Unauthorized when uploading photo without Authorization header (POST /api/gallery)', async () => {
            const response = await request(app)
                .post('/api/gallery')
                .field('caption', 'Unauthorized photo upload')
                .attach('image', samplePngBuffer, { filename: 'unauth.png', contentType: 'image/png' });

            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('message');
            expect(response.body.message).toMatch(/Authentication required/i);
        });
    });

    // =========================================================================
    // Case D: Update & Full CRUD Lifecycle
    // =========================================================================
    describe('Case D: Update & Full CRUD Lifecycle', () => {
        // Test 6: Update Resource
        it('should successfully update photo visibility with status 200 (PATCH /api/gallery/:id/visibility)', async () => {
            expect(createdPhotoId).toBeDefined();

            const response = await request(app)
                .patch(`/api/gallery/${createdPhotoId}/visibility`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ isPublic: false });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', 'Visibility updated');
            expect(response.body.isPublic).toBe(false);
        });

        // Test 7: Delete Resource
        it('should successfully delete the created photo by ID with status 200 (DELETE /api/gallery/:id)', async () => {
            expect(createdPhotoId).toBeDefined();

            const response = await request(app)
                .delete(`/api/gallery/${createdPhotoId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message');
            expect(response.body.message).toMatch(/Deleted successfully/i);
        });
    });
});
