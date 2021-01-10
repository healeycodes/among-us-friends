const fetch = require("node-fetch").default
const express = require("express")
const app = express()
const router = express.Router()

const snapshot = require("../public/dev-snapshot.json")
const { buildStats } = require("./stats")

router.get("/stats/:season", async (request, response) => {
    const season = request.params.season
    let query = ""
    if (season !== "current") {
        query = `Season ${parseInt(season)}`
    }

    try {
        const data = await sheetData(query)
        const stats = buildStats(data)
        response.json(stats)
    } catch (error) {
        console.error(error)
    }
})

router.get("/raw-stats", async (request, response) => {
    // Make the league's raw data open for all!
    try {
        const data = await sheetData()
        response.json(data)
    } catch (error) {
        console.error(error)
    }
})

async function sheetData(sheet = "Current") {
    // For local dev set this variable
    if (process.env.snapshot === "true") {
        return new Promise(resolve => resolve(snapshot))
    }
    // Otherwise, we're on prod!
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${process.env.SHEETS_ID}/values/${sheet}!C4:Q1000?key=${process.env.SHEETS_API_KEY}`
    return fetch(url)
        .then(res => res.json())
        .catch(err => err)
}

app.use("/.netlify/functions/app", router)

const serverless = require("serverless-http")
module.exports = app
module.exports.handler = serverless(app)
