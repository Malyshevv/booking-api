import express from 'express';
import { staticRouter } from "../routes/allRoutes";
import request from 'supertest';

const app = express();
app.use('/', staticRouter);

describe("GET / - a simple api endpoint", () => {
    it("Simple test index page", async () => {
        const result = await request(app).get("/");
        expect(result.header['content-type']).toBe('text/html; charset=utf-8');
        expect(result.statusCode).toBe(200);
        expect(result.text).toContain('API Header');
    });
});
