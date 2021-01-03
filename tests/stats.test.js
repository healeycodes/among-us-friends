const { EloChange, buildStats } = require("../src/stats")
const mockSheetsData = require("./mock-sheets-data.json")

describe("Test EloChange", () => {
    test("It should produce sensible calculations", done => {
        // For new players
        let eloChange = EloChange(0)
        expect(eloChange(1200, 1400)[0]).toStrictEqual(30)
        expect(eloChange(1200, 1400)[1]).toStrictEqual(-9)
        // For everyone else
        eloChange = EloChange(31)
        expect(eloChange(1400, 1200)[0]).toStrictEqual(4)
        expect(eloChange(1400, 1200)[1]).toStrictEqual(-15)
        done()
    })
})

describe("Test buildStats", () => {
    test("It should have the correct properties", done => {
        const stats = buildStats(mockSheetsData)
        expect(stats).toHaveProperty("players")

        const firstPlayer = stats.players[0]
        expect(firstPlayer.crewLoss).toStrictEqual(0)
        expect(firstPlayer.crewWin).toStrictEqual(1)
        expect(firstPlayer.elo).toStrictEqual(1335)
        expect(typeof firstPlayer.eloHistory.length).toStrictEqual("number")
        expect(firstPlayer.games.length).toStrictEqual(43)
        expect(firstPlayer.imposterLoss).toStrictEqual(0)
        expect(firstPlayer.imposterWin).toStrictEqual(42)
        expect(firstPlayer.name).toStrictEqual("nads")

        const firstGame = firstPlayer.games[0]

        // TODO: why are these broken?
        // expect(firstGame.diff).toStrictEqual(1)
        // expect(stats.players[9].games[1].diff).toStrictEqual(-1)

        expect(firstGame.crew.length).toStrictEqual(8)
        expect(firstGame.crew[0]).toStrictEqual("andy")
        expect(firstGame.imposters.length).toStrictEqual(2)
        expect(firstGame.imposters[0]).toStrictEqual("gem")
        done()
    })

    test("It should have sensible eloHistory", done => {
        const stats = buildStats(mockSheetsData)
        expect(stats).toHaveProperty("players")

        const firstPlayer = stats.players[0]
        const eloHistory = firstPlayer.eloHistory

        expect(eloHistory.length).toBe(44)
        eloHistory.forEach(elo => expect(typeof elo).toBe("number"))
        done()
    })

    test("It should decay elo for inactive players", done => {
        const stats = buildStats(mockSheetsData)

        // There are 43 games in the mock data
        // `neil` won the first game and then didn't play again
        const inactivePlayer = stats.players.find(p => p.name === "neil")
        const eloHistory = inactivePlayer.eloHistory

        console.log(eloHistory) // TODO: remove
        // Their Elo should decay twice
        expect(eloHistory.length).toBe(4)
        expect(eloHistory[1] < eloHistory[2]).toBe(true)
        expect(eloHistory[2] < eloHistory[3]).toBe(true)
        done()
    })
})
