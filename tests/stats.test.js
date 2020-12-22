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
        expect(firstPlayer.elo).toStrictEqual(1220)
        expect(typeof firstPlayer.eloHistory.length).toStrictEqual("number")
        expect(firstPlayer.games.length).toStrictEqual(2)
        expect(firstPlayer.imposterLoss).toStrictEqual(0)
        expect(firstPlayer.imposterWin).toStrictEqual(1)
        expect(firstPlayer.name).toStrictEqual("nads")

        const firstGame = firstPlayer.games[0]
        expect(firstGame.diff).toStrictEqual(20) // Crew ELO diff
        expect(stats.players[9].games[1].diff).toStrictEqual(-20) // Imposter ELO diff
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

        // Everyone has a starting ELO
        // and two games have been played in the test data
        expect(eloHistory.length).toBe(3)
        eloHistory.forEach(elo => expect(typeof elo).toBe("number"))
        done()
    })

    test("It should have sensible deadlyDuos", done => {
        const stats = buildStats(mockSheetsData)
        expect(stats).toHaveProperty("deadlyDuos")

        const deadlyDuos = stats.deadlyDuos
        expect(deadlyDuos.length).toBe(1)
        expect(deadlyDuos[0]).toBe("gem ✕ nads")
        done()
    })
})
