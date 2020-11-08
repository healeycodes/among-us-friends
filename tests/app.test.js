jest.mock("node-fetch");
const fetch = require("node-fetch");
const { Response } = jest.requireActual("node-fetch");
const mockSheetsData = require("./mock-sheets-data.json");

const request = require("supertest");
const app = require("../app");

describe("Test the root path", async () => {
  fetch.mockReturnValue(Promise.resolve(new Response(mockSheetsData)));
  test("It should response the GET method", done => {
    request(app)
      .get("/")
      .then(response => {
        expect(response.statusCode).toBe(200);
        done();
      });
  });
});
