// File: testing/BloomLog.test.js
const request = require('supertest');
const app = require('../server.js');

describe('Register Backend Tests', () => {
    test('POST /register - should create a new user', async () => {
        const res = await request(app).post('/register').send({
            username: 'TestUser1',
            email: 'testuser1@example.com',
            password: 'pass123'
        });
    
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            username: 'TestUser1',
            email: 'testuser1@example.com',
            journals: expect.any(Array),
            todos: []
        });
        expect(res.body.journals[0]).toMatchObject({
            name: 'Diary',
            pages: [],
            locked: true
        });
    });
    
    test('POST /register - should fail for duplicate email', async () => {
        await request(app).post('/register').send({
            username: 'TestUser2',
            email: 'TestUser2@example.com',
            password: 'pass456'
        });
    
        const res = await request(app).post('/register').send({
            username: 'TestUser2',
            email: 'TestUser2@example.com',
            password: 'pass456'
        });
    
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toMatch("User already exists");
    });

    test('should fail if any required field is missing', async () => {
        const res = await request(app).post('/register').send({
            email: 'MissingUnsername@example.com',
            password: 'pass789'
        });
    
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toMatch("All fields are required");
    });
 
})

describe('Login Backend Tests', () => {
    test('POST /login - should succeed with valid credentials', async () => {
        await request(app).post('/register').send({
            username: 'TestUser3',
            email: 'testuser3@example.com',
            password: 'password987'
        });
    
        const res = await request(app).post('/login').send({
            email: 'testuser3@example.com',
            password: 'password987'
        });
    
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            username: 'TestUser3',
            email: 'testuser3@example.com',
            journals: expect.any(Array),
            todos: []
        });
        expect(res.body.journals[0]).toMatchObject({
            name: 'Diary',
            pages: [],
            locked: true
        })
    });

    test('POST /login - should fail with wrong credentials', async () => {
        const res = await request(app).post('/login').send({
            email: 'nonexistent@example.com',
            password: 'wrongpass'
        });
    
        expect(res.statusCode).toBe(401);
        expect(res.body.message).toMatch("Invalid credentials");
    });
})

describe('Add Journals Backend Tests', () => {
    test('POST /addJournal - should add a new journal for an existing user', async () => {
        await request(app).post('/register').send({
            username: 'TestUser4',
            email: 'TestUser4@example.com',
            password: 'password654'
        });
      
        const res = await request(app).post('/addJournal').send({
            email: 'TestUser4@example.com',
            journalName: 'My Test Journal'
        });
      
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Journal added');
        expect(Array.isArray(res.body.journals)).toBe(true);
        expect(res.body.journals).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    name: 'My Test Journal',
                    pages: ["Start typing here..."]
                })
            ])
        );
    });

    test('POST /addJournal - should return 404 for unknown user', async () => {
        const res = await request(app).post('/addJournal').send({
          email: 'notarealuser@example.com',
          journalName: 'Ghost Journal'
        });
      
        expect(res.statusCode).toBe(404);
        expect(res.body.message).toMatch("User not found");
      });

})

