const fetch = require("node-fetch");
const express = require("express");
const app = express();
app.use(express.static("public"));
const { eloCalc } = require("./elo");

const PLACEMENT_GAMES = 10;

app.get("/", (request, response) => {
  console.log(request.headers["x-forwarded-for"]);
  response.sendFile(__dirname + "/views/index.html");
});

app.get("/stats", async (request, response) => {
  // Our datasource is a series of rows
  const json = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${process.env.SHEETS_ID}/values/C4:O1000?key=${process.env.SHEETS_API_KEY}`
  ).then(res => res.json());

  // We use this to filter out empty slots in a row (e.g. when there are nine players)
  const isEmpty = name => name !== "";

  // Create empty players
  let players = {};
  let games = json.values.length;
  // Search all games for unique players
  json.values.forEach(game =>
    game
      .slice(0, 12)
      .filter(isEmpty)
      .forEach(player => {
        players[player] = {
          name: player,
          crewWin: 0,
          crewLoss: 0,
          imposterWin: 0,
          imposterLoss: 0,
          elo: 1200,
          eloHistory: [1200]
        };
      })
  );

  // Handle each game
  json.values.forEach(game => {
    let crew = new Set(game.slice(0, 10).filter(isEmpty)); // nine or ten player names
    let imposters = game.slice(10, 12); // two player names
    crew.delete(imposters[0]);
    crew.delete(imposters[1]);
    let winner = game[12]; // 'crew' or 'imposter'

    // Players are measured against the average of the other team
    const avgElo = list =>
      list.reduce((a, b) => a + players[b].elo, 0) / list.length;
    let crewAvgElo = avgElo([...crew]);
    let imposterAvgElo = avgElo(imposters);

    // Handle crew
    crew.forEach(crewmate => {
      const player = players[crewmate];
      if (winner === "crew") {
        player.crewWin += 1;
        player.elo += eloCalc(player.elo, imposterAvgElo, "a")[0];
      } else {
        player.crewLoss += 1;
        player.elo += eloCalc(player.elo, imposterAvgElo, "b")[0];
      }
      player.eloHistory.push(player.elo);
    });

    // Handle imposters
    imposters.forEach(imposter => {
      const player = players[imposter];
      if (winner === "imposter") {
        player.imposterWin += 1;
        player.elo += eloCalc(crewAvgElo, player.elo, "b")[1];
      } else {
        player.imposterLoss += 1;
        player.elo += eloCalc(crewAvgElo, player.elo, "a")[1];
      }
      player.eloHistory.push(player.elo);
    });
  });

  // Sort best to worst
  let playersSortedByElo = Object.values(players).sort((a, b) => {
    return b.elo - a.elo;
  });

  // Segment those in their placements, move to end of the list
  let placements = playersSortedByElo.filter(
    p => p.eloHistory.length <= PLACEMENT_GAMES
  );
  playersSortedByElo = playersSortedByElo
    .filter(p => p.eloHistory.length > PLACEMENT_GAMES)
    .concat(placements);

  response.json({ players: playersSortedByElo, games });
});

const listener = app.listen(process.env.PORT, () => {
  // console.log("Your app is listening on port " + listener.address().port);
});
