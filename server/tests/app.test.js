const request = require('supertest');
const app = require('../app'); // Adjust the path as necessary

describe('App Tests', () => {
    test('hello world!', async () => {
        const response = await request(app).get('/');
        expect(response.statusCode).toBe(200);
        expect(response.text).toBe('Hello World');
    });
});