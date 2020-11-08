const EloRank = require("elo-rank");

const PLACEMENT_GAMES = 10;
const elo = new EloRank();

// Calculate the ELO rating change of two players
function eloCalc(playerA, playerB, winner) {
  const expectedScoreA = elo.getExpected(playerA, playerB);
  const expectedScoreB = elo.getExpected(playerB, playerA);
  if (winner === "a") {
    return [
      elo.updateRating(expectedScoreA, 1, playerA) - playerA,
      elo.updateRating(expectedScoreB, 0, playerB) - playerB
    ];
  } else {
    return [
      elo.updateRating(expectedScoreA, 0, playerA) - playerA,
      elo.updateRating(expectedScoreB, 1, playerB) - playerB
    ];
  }
}

// Given a raw list of matches in the form of a row of:
// ten slots for players, two slots for imposters, one slot for winner
// e.g. ['playerA', 'playerB', 'playerC', 'playerD', 'playerE',
//       'playerF', 'playerG', 'playerH', 'playerI', '', <-- allow for nine or ten players
//       'playerA', 'playerB', 'crew'] <-- two imposters, and the winner 'crew' or 'imposter'
function buildStats(data) {
  // We use this to filter out empty slots in a row (e.g. when there are nine players)
  const isEmpty = name => name !== "";

  // Create empty players
  let players = {};
  let games = data.values.length;
  // Search all games for unique players
  data.values.forEach(game =>
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
  data.values.forEach(game => {
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
  return { players: playersSortedByElo, games };
}

module.exports = { buildStats };
