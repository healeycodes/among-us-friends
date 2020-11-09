const { eloCalc, buildStats } = require('./../stats');
const mockSheetsData = require("./mock-sheets-data.json");

describe("Test eloCalc", () => {
  test("It should produce sensible calculations", done => {
    const playerAWins = eloCalc(1200, 1200, 'a');
    const playerBWins = eloCalc(1200, 1200, 'b');
    expect(playerAWins).toStrictEqual([16, -16]);
    expect(playerBWins).toStrictEqual([-16, 16]);
    done();
  });
});

describe("Test buildStats", () => {
  test("It should have the correct properties", done => {
    const stats = buildStats(mockSheetsData);
    expect(stats).toHaveProperty('players');
    expect(stats).toHaveProperty('games');

    const firstPlayer = stats.players[0];
    expect(typeof firstPlayer.crewLoss).toBe('number')
    expect(typeof firstPlayer.crewWin).toBe('number');
    expect(typeof firstPlayer.elo).toBe('number');
    expect(typeof firstPlayer.eloHistory.length).toBe('number');
    expect(typeof firstPlayer.imposterLoss).toBe('number');
    expect(typeof firstPlayer.imposterWin).toBe('number');
    expect(typeof firstPlayer.name).toBe('string');
    done();
  });

  test("It should have sensible eloHistory", done => {
    const stats = buildStats(mockSheetsData);
    expect(stats).toHaveProperty('players');
    expect(stats).toHaveProperty('games');

    const firstPlayer = stats.players[0];
    const eloHistory = firstPlayer.eloHistory;

    // Everyone has a starting ELO
    // and two games have been played in the test data
    expect(eloHistory.length).toBe(3);
    eloHistory.forEach(elo => expect(typeof elo).toBe('number'));
    done();
  });
});