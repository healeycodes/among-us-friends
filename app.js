const fetch = require("node-fetch");
const express = require("express");
const app = express();
app.use(express.static("public"));
const { buildStats } = require("./stats");

app.get("/", (request, response) => {
  console.log(request.headers["x-forwarded-for"]);
  response.sendFile(__dirname + "/views/index.html");
});

// Our datasource is a series of rows
const sheetData = () => fetch(
  `https://sheets.googleapis.com/v4/spreadsheets/${process.env.SHEETS_ID}/values/C4:O1000?key=${process.env.SHEETS_API_KEY}`
).then(res => res.json());

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

module.exports = app;
