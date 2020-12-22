const fetch = require("node-fetch")
const express = require("express")
const app = express()
const router = express.Router()

const seasons = require(`../public/seasons.json`)
const { buildStats } = require("../stats")
const { SHEETS_API_KEY, SHEETS_ID } = require("./env.json")

router.get("/ping", (_, response) => {
    response.send("OK")
})

router.get("/player/:player", (_, response) => {
    response.sendFile(__dirname + "../public/player.html")
})

router.get("/stats/:season", async (request, response) => {
    const season = request.params.season
    let data
    if (season === "current") {
        data = await sheetData()
    } else {
        data = seasons[parseInt(season)]
    }
    const stats = buildStats(data)
    response.json(stats)
})

router.get("/raw-stats", async (request, response) => {
    // Make the league's raw data open for all!
    const data = await sheetData()
    response.json(data)
})

// Our data-source is a series of rows
async function sheetData() {
    return fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${SHEETS_ID}/values/C4:Q1000?key=${SHEETS_API_KEY}`
    )
        .then(res => res.json())
        .catch(err => err)
}

app.use("/.netlify/functions/app", router)

const serverless = require("serverless-http")
module.exports = app
module.exports.handler = serverless(app)