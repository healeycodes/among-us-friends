const path = require("path")
const fetch = require("node-fetch").default
const express = require("express")
const app = express()
const router = express.Router()

const snapshot = require("../public/dev-snapshot.json")
const seasons = require("../public/seasons.json")
const { buildStats } = require("./stats")

router.get("/ping", (_, response) => {
    response.send("OK")
})

router.get("/stats/:season", async (request, response) => {
    const season = request.params.season
    let data
    if (season === "current") {
        try {
            data = await sheetData()
        } catch (error) {
            console.error(error)
        }
    } else {
        data = seasons[parseInt(season)]
    }
    const stats = buildStats(data)
    response.json(stats)
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

async function sheetData() {
    // For local dev set this variable
    if (process.env.snapshot === "true") {
        return new Promise(resolve => resolve(snapshot))
    }
    // Otherwise, we're on prod!
    return fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${process.env.SHEETS_ID}/values/C4:Q1000?key=${process.env.SHEETS_API_KEY}`
    )
        .then(res => res.json())
        .catch(err => err)
}

app.use("/.netlify/functions/app", router)

const serverless = require("serverless-http")
module.exports = app
module.exports.handler = serverless(app)
