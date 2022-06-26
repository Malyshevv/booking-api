import express from 'express';
import {staticRouter, userRouter} from "../routes/allRoutes";
import request from 'supertest';

const app = express();
app.use('/users', userRouter);
app.use('/', staticRouter);


describe("GET / - a simple api endpoint", () => {
    it("Simple test index page", async () => {
        return await request(app).get("/").then(response => {
            expect(response.statusCode).toBe(200);
        });
    });
});

describe("GET /users - all users", () => {
    it("All users", async () => {
        return await request(app).get("/users").then(response => {
            expect(response.statusCode).toBe(200);
        });
    });
});

describe("GET /users/1 - single user", () => {
    it("Single user", async () => {
        return await request(app).get("/users/1").then(response => {
            expect(response.statusCode).toBe(200);
        });
    });
});
