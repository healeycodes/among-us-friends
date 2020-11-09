const { eloCalc, buildStats } = require("./../stats");
const mockSheetsData = require("./mock-sheets-data.json");

describe("Test eloCalc", () => {
  test("It should produce sensible calculations", done => {
    const playerAWins = eloCalc(1200, 1200, "a");
    const playerBWins = eloCalc(1200, 1200, "b");
    expect(playerAWins).toStrictEqual([16, -16]);
    expect(playerBWins).toStrictEqual([-16, 16]);
    done();
  });
});

describe("Test buildStats", () => {
  test("It should have the correct properties", done => {
    const stats = buildStats(mockSheetsData);
    expect(stats).toHaveProperty("players");

    const firstPlayer = stats.players[0];
    expect(firstPlayer.crewLoss).toStrictEqual(0);
    expect(firstPlayer.crewWin).toStrictEqual(2);
    expect(firstPlayer.elo).toStrictEqual(1232);
    expect(typeof firstPlayer.eloHistory.length).toStrictEqual("number");
    expect(firstPlayer.games.length).toStrictEqual(2);
    expect(firstPlayer.imposterLoss).toStrictEqual(0);
    expect(firstPlayer.imposterWin).toStrictEqual(0);
    expect(firstPlayer.name).toStrictEqual("andy");

    const firstGame = firstPlayer.games[0];
    expect(firstGame.diff).toStrictEqual(16); // Crew ELO diff
    expect(stats.players[9].games[0].diff).toStrictEqual(-16); // Imposter ELO diff
    expect(firstGame.crew.length).toStrictEqual(8);
    expect(firstGame.crew[0]).toStrictEqual("andy");
    expect(firstGame.imposters.length).toStrictEqual(2);
    expect(firstGame.imposters[0]).toStrictEqual("gem");
    done();
  });

  test("It should have sensible eloHistory", done => {
    const stats = buildStats(mockSheetsData);
    expect(stats).toHaveProperty("players");

    const firstPlayer = stats.players[0];
    const eloHistory = firstPlayer.eloHistory;

    // Everyone has a starting ELO
    // and two games have been played in the test data
    expect(eloHistory.length).toBe(3);
    eloHistory.forEach(elo => expect(typeof elo).toBe("number"));
    done();
  });
});
