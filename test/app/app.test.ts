import app from "../../src/app/app";
import request from "supertest";
import { Server } from "http";

let server: Server;

beforeEach((done: jest.DoneCallback) => {
    // Start your server and store the server instance
    server = app.listen(3000, () => {
        console.log("Server started");
        done();
    });
});

afterEach((done) => {
    // Close the server connection after each test
    server.close(() => {
        console.log("Server closed");
        done();
    });
});

describe("GET /", () => {
    it("Should return success message", (done) => {
        request(app)
            .get("/")
            .expect(200)
            .then(() => {
                done();
            })
            .catch((err?: string) => {
                done.fail(err);
            });
    });
});