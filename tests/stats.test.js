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
    expect(firstPlayer).toHaveProperty('crewLoss');
    expect(firstPlayer).toHaveProperty('crewWin');
    expect(firstPlayer).toHaveProperty('elo');
    expect(firstPlayer).toHaveProperty('eloHistory');
    expect(firstPlayer).toHaveProperty('imposterLoss');
    expect(firstPlayer).toHaveProperty('imposterWin');
    expect(firstPlayer).toHaveProperty('name');
    done();
  });

  test("It should have sensible eloHistory", done => {
    const stats = buildStats(mockSheetsData);
    expect(stats).toHaveProperty('players');
    expect(stats).toHaveProperty('games');

    const firstPlayer = stats.players[0];
    const eloHistory = firstPlayer.eloHistory;

    expect(eloHistory.length).toBe(3);
    eloHistory.forEach(elo => expect(typeof elo).toBe('number'));

    done();
  });
});