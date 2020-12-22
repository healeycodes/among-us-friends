const fetch = require("node-fetch")
const express = require("express")
const app = express()
const router = express.Router()

const { buildStats } = require("../stats")
const { seasonFiles } = require("../config.json")
const seasons = seasonFiles.map(file => require(`../public/seasons/${file}`))

router.get("/player/:player", (request, response) => {
    response.sendFile(__dirname + "/views/player.html")
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
        `https://sheets.googleapis.com/v4/spreadsheets/${process.env.SHEETS_ID}/values/C4:Q1000?key=${process.env.SHEETS_API_KEY}`
    ).then(res => res.json())
}

app.use("/.netlify/functions/app", router)

const serverless = require("serverless-http")
module.exports = app
module.exports.handler = serverless(app)
