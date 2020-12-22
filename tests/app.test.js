jest.mock("node-fetch")
const fetch = require("node-fetch")
const { Response } = jest.requireActual("node-fetch")
const mockSheetsData = require("./mock-sheets-data.json")
const mockResponse = new Response(JSON.stringify(mockSheetsData))

const request = require("supertest")
const app = require("../src/app")

describe("Test the stats path", () => {
    fetch.mockReturnValue(Promise.resolve(mockResponse))
    test("It should response to the GET method", done => {
        request(app)
            .get("/.netlify/functions/app/stats/current")
            .then(response => {
                expect(response.type).toEqual("application/json")
                expect(response.body).toHaveProperty("players")
                expect(response.statusCode).toBe(200)
                done()
            })
    })
})

describe("Test the player path", () => {
    fetch.mockReturnValue(Promise.resolve(mockResponse))
    test("It should response to the GET method", done => {
        request(app)
            .get("/.netlify/functions/app/player/alice")
            .then(response => {
                expect(response.statusCode).toBe(200)
                done()
            })
    })
})
