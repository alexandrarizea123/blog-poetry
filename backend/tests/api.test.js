
import request from 'supertest';
import { jest } from '@jest/globals';
import { app, pool } from '../index.js';

describe('API Tests', () => {

    beforeAll(async () => {
        // Any setup
    });

    afterAll(async () => {
        // Close pool to let jest exit
    });

    // Mock implementation of valid password
    const validPassword = 'Password123';
    const invalidPassword = 'weak';

    describe('Auth Endpoints', () => {
        it('should reject registration with weak password', async () => {
            const res = await request(app)
                .post('/api/register')
                .send({
                    name: 'TestUser',
                    email: 'test@example.com',
                    password: invalidPassword,
                    role: 'poet'
                });
            expect(res.statusCode).toEqual(400);
            expect(res.body.error).toMatch(/Parola nu respecta/);
        });

        // We'll skip actual DB writes for "success" cases unless we mock query.
        // Let's spy on pool.query.
    });

    describe('Gallery Endpoints', () => {
        it('should allow fetching galleries', async () => {
            // Mock pool.query for this specific call
            const spy = jest.spyOn(pool, 'query').mockResolvedValueOnce({
                rows: [
                    { id: 1, name: 'Nature', author_id: 1, created_at: new Date() }
                ]
            });

            const res = await request(app).get('/api/galleries');
            expect(res.statusCode).toEqual(200);
            expect(res.body.galleries).toHaveLength(1);
            expect(res.body.galleries[0].name).toBe('Nature');

            spy.mockRestore();
        });

        it('should currently allow creating "general" gallery (Backend behavior check)', async () => {
            const spy = jest.spyOn(pool, 'query').mockResolvedValueOnce({
                rows: [
                    { id: 99, name: 'general', author_id: 1, created_at: new Date() }
                ]
            });

            const res = await request(app)
                .post('/api/galleries')
                .send({ name: 'general', authorId: 1 });

            // If backend doesn't block it, it returns 201.
            expect(res.statusCode).toEqual(201);
            expect(res.body.gallery.name).toBe('general');

            spy.mockRestore();
        });
    });
});
