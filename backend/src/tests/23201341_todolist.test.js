import "dotenv/config";
import request from "supertest";
import app from "../app.js";

describe("Feature: To-Do List", () => {
    let authToken = "";
    let todoId = "";
    let testEmail = "";

    // ---------------------------------------------------------
    // creating a test user
    // ---------------------------------------------------------
    beforeAll(async () => {
        testEmail = `todo_test_${Date.now()}@example.com`;

        const registerResponse = await request(app)
            .post("/api/auth/register")
            .send({
                email: testEmail,
                password: "TodoTest@123"
            });

        expect(registerResponse.statusCode).toBe(201);
        expect(registerResponse.body).toHaveProperty("token");

        authToken = registerResponse.body.token;
    });

    // =========================================================
    // Case A: Positive Flow (Happy Path)
    // =========================================================
    describe("Case A: Positive Flow (Happy Path)", () => {

        // ---------------------------------------------------------
        // 1. creating a task
        // ---------------------------------------------------------
        it("should create a new task with a valid payload", async () => {
            const response = await request(app)
                .post("/api/todos")
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    title: "Finish unit testing assignment"
                });

            expect(response.statusCode).toBe(201);
            expect(response.body).toHaveProperty("todo");
            expect(response.body.todo).toHaveProperty("id");

            todoId = response.body.todo.id;

            expect(response.body.todo.title)
                .toBe("Finish unit testing assignment");
        });

        // ---------------------------------------------------------
        // 3. Getting all the tasks by a user
        // ---------------------------------------------------------
        it("should return all the tasks for the authenticated user", async () => {
            const response = await request(app)
                .get("/api/todos")
                .set("Authorization", `Bearer ${authToken}`);

            expect(response.statusCode).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);

            const createdTodo = response.body.find(
                (todo) => String(todo.id) === String(todoId)
            );

            expect(createdTodo).toBeDefined();
        });

        // ---------------------------------------------------------
        // 4. Updating a task
        // ---------------------------------------------------------
        it("should update an existing task with a valid payload", async () => {
            const response = await request(app)
                .put(`/api/todos/${todoId}`)
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    title: "Finish unit testing assignment today",
                    completed: true
                });

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty(
                "message",
                "Updated successfully"
            );
        });

        // ---------------------------------------------------------
        // 5. Deleting a task
        // ---------------------------------------------------------
        it("should delete an existing task", async () => {
            const response = await request(app)
                .delete(`/api/todos/${todoId}`)
                .set("Authorization", `Bearer ${authToken}`);

            expect([200, 204]).toContain(response.statusCode);

            if (response.statusCode === 200) {
                expect(response.body).toHaveProperty(
                    "message",
                    "Deleted successfully"
                );
            }
        });
    });

    // =========================================================
    // Case B: Negative Flow (Error Handling)
    // =========================================================
    describe("Case B: Negative Flow (Error Handling)", () => {

        // ---------------------------------------------------------
        // 6. Checking validation error
        // ---------------------------------------------------------
        it("should return 400 when title is missing", async () => {
            const response = await request(app)
                .post("/api/todos")
                .set("Authorization", `Bearer ${authToken}`)
                .send({});

            expect(response.statusCode).toBe(400);
            expect(response.body).toHaveProperty("message");
        });

        // ---------------------------------------------------------
        // 7. Checking invalid data
        // ---------------------------------------------------------
        it("should return 400 for invalid task data", async () => {
            const response = await request(app)
                .post("/api/todos")
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    title: 12345
                });

            expect(response.statusCode).toBe(400);
            expect(response.body).toHaveProperty("message");
        });

        // ---------------------------------------------------------
        // 8. Resource not found
        // ---------------------------------------------------------
        it("should return 404 when updating a nonexistent task", async () => {
            const response = await request(app)
                .put("/api/todos/999999999")
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    title: "This todo does not exist",
                    completed: false
                });

            expect(response.statusCode).toBe(404);
            expect(response.body).toHaveProperty(
                "message",
                "Todo not found"
            );
        });

        it("should return 404 when deleting a nonexistent task", async () => {
            const response = await request(app)
                .delete("/api/todos/999999999")
                .set("Authorization", `Bearer ${authToken}`);

            expect(response.statusCode).toBe(404);
            expect(response.body).toHaveProperty(
                "message",
                "Todo not found"
            );
        });
    });

    // =========================================================
    // Case C: Security & Boundary
    // =========================================================
    describe("Case C: Security & Boundary", () => {

        // ---------------------------------------------------------
        // 9. Unauthorized Access
        // ---------------------------------------------------------
        it("should reject a request without an authentication token", async () => {
            const response = await request(app)
                .get("/api/todos");

            expect([401, 403]).toContain(response.statusCode);

            if (response.statusCode === 401) {
                expect(response.body).toHaveProperty(
                    "message",
                    "Authentication required"
                );
            }
        });

        // ---------------------------------------------------------
        // 10. Invalid Token
        // ---------------------------------------------------------
        it("should reject a request with an invalid token", async () => {
            const response = await request(app)
                .get("/api/todos")
                .set("Authorization", "Bearer this-is-not-a-valid-jwt");

            expect([401, 403]).toContain(response.statusCode);

            if (response.statusCode === 401) {
                expect(response.body).toHaveProperty(
                    "message",
                    "Invalid or expired token"
                );
            }
        });
    });
});