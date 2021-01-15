require("dotenv").config()
const fetch = require("node-fetch").default
const express = require("express")
const app = express()
const router = express.Router()

const { seasons } = require("../../config.json")
const snapshot = require("../dev-snapshot.json")
const { buildStats } = require("./stats")

router.get("/seasons", async (request, response) => {
    response.json(seasons)
})

router.get("/stats", async (request, response) => {
    // For local dev set this variable
    if (process.env.snapshot === "true") {
        return response.json(buildSeasons(snapshot))
    }

    try {
        const data = await sheetData()
        response.json(buildSeasons(data))
    } catch (error) {
        console.error(error)
    }
})

function buildSeasons(data) {
    const allStats = data.map(season => buildStats(season))
    const allSeasons = {}
    seasons.forEach((season, i) => {
        allSeasons[season] = allStats[i]
    })
    return allSeasons
}

async function sheetData() {
    const seasonNames = seasons.map(number => `Season ${number}`)
    return await Promise.all(
        seasonNames.map(name =>
            fetch(
                `https://sheets.googleapis.com/v4/spreadsheets/${process.env.SHEETS_ID}/values/${name}!C4:Q1000?key=${process.env.SHEETS_API_KEY}`
            )
        )
    )
        .then(responses => {
            return Promise.all(responses.map(response => response.json()))
        })
        .catch(error => console.log(error))
}

app.use("/.netlify/functions/app", router)

const serverless = require("serverless-http")
module.exports = app
module.exports.handler = serverless(app)
