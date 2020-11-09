const fs = require("fs");
const fetch = require("node-fetch");
const express = require("express");
const app = express();
app.use(express.static("public"));
const { buildStats, buildPlayer } = require("./stats");

const LOG_FILE = "log.txt";

app.get("/", (request, response) => {
  log(request);
  response.sendFile(__dirname + "/views/index.html");
});

app.get("/player/:player", (request, response) => {
  const { player } = request.params;
  response.sendFile(__dirname + "/views/player.html");
});

app.get("/stats", async (request, response) => {
  const data = await sheetData();
  const stats = buildStats(data);
  response.json(stats);
});

app.get("/raw-stats", async (request, response) => {
  // Make the league's raw data open for all!
  const data = await sheetData();
  response.json(data);
});

// Our datasource is a series of rows
async function sheetData() {
  return fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${process.env.SHEETS_ID}/values/C4:O1000?key=${process.env.SHEETS_API_KEY}`
  ).then(res => res.json());
}

function log(request) {
  const msg = `${new Date().toLocaleString()} ${
    request.headers["x-forwarded-for"]
  }\n`;
  fs.appendFile(LOG_FILE, msg, function(err) {
    if (err) throw err;
  });
}

module.exports = app;
