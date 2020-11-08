const fetch = require("node-fetch");
const express = require("express");
const app = express();
app.use(express.static("public"));
const { buildStats } = require("./stats");

app.get("/", (request, response) => {
  console.log(request.headers["x-forwarded-for"]);
  response.sendFile(__dirname + "/views/index.html");
});

app.get("/stats", async (request, response) => {
  // Our datasource is a series of rows
  const data = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${process.env.SHEETS_ID}/values/C4:O1000?key=${process.env.SHEETS_API_KEY}`
  ).then(res => res.json());

  const stats = buildStats(data);
  response.json(stats);
});

module.exports = app;
