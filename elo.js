const EloRank = require("elo-rank");
const elo = new EloRank();

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

module.exports = { eloCalc };
