const EloRating = require("elo-rating")

const PLACEMENT_GAMES = 10

function EloChange(games) {
    // Based on https://ratings.fide.com/calculator_rtd.phtml
    // K = 40 for a player with less than 30 games
    // K = 20 afterwards
    const K = games > 30 ? 20 : 40
    // From playerA's perspective, how much can be won or lost
    return function (playerA, playerB) {
        return [
            EloRating.calculate(playerA, playerB, true, K).playerRating -
                playerA,
            EloRating.calculate(playerA, playerB, false, K).playerRating -
                playerA,
        ]
    }
}

// Given a raw list of matches in the form of a row of:
// ten slots for players, two slots for imposters, one slot for winner
// e.g. ['playerA', 'playerB', 'playerC', 'playerD', 'playerE',
//       'playerF', 'playerG', 'playerH', 'playerI', '', <-- allow for nine or ten players
//       'playerA', 'playerB', 'crew'] <-- two imposters, and the winner 'crew' or 'imposter'
function buildStats(data) {
    // We use this to filter out empty slots in a row (e.g. when there are nine players)
    const isEmpty = name => name !== ""

    // Create empty players
    let players = {}
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
                    crewElo: 1200,
                    imposterElo: 1200,
                    elo: 1200,
                    eloHistory: [1200],
                    games: [],
                }
            })
    )

    // Handle each game
    data.values.forEach(game => {
        let crew = new Set(game.slice(0, 10).filter(isEmpty)) // nine or ten player names
        let imposters = game.slice(10, 12) // two player names
        crew.delete(imposters[0])
        crew.delete(imposters[1])
        let winner = game[12] // 'crew' or 'imposter'

        // Players are measured against the average of the other team

        const avgElo = (list, role) =>
            list.reduce((a, b) => a + players[b][role], 0) / list.length

        let crewAvgElo = avgElo([...crew], "crewElo")
        let imposterAvgElo = avgElo(imposters, "imposterElo")

        // Handle crew
        crew.forEach(crewmate => {
            const player = players[crewmate]
            const eloChange = EloChange(player.eloHistory.length)
            let diff
            if (winner === "crew") {
                diff = eloChange(player.crewElo, imposterAvgElo)[0]
                player.crewWin += 1
                player.crewElo += diff
            } else {
                diff = eloChange(player.crewElo, imposterAvgElo)[1]
                player.crewLoss += 1
                player.crewElo += diff
            }
            player.elo = (player.crewElo + player.imposterElo) / 2
            player.eloHistory.push(player.elo)
            player.games.unshift({ crew: [...crew], imposters, winner, diff })
        })

        // Handle imposters
        imposters.forEach(imposter => {
            const player = players[imposter]
            const eloChange = EloChange(player.eloHistory.length)
            let diff
            if (winner === "imposter") {
                diff = eloChange(player.imposterElo, crewAvgElo)[0]
                player.imposterWin += 1
                player.imposterElo += diff
            } else {
                diff = eloChange(player.imposterElo, crewAvgElo)[1]
                player.imposterLoss += 1
                player.imposterElo += diff
            }
            player.elo = (player.crewElo + player.imposterElo) / 2
            player.eloHistory.push(player.elo)
            player.games.unshift({ crew: [...crew], imposters, winner, diff })
        })
    })

    // Sort best to worst
    let playersSortedByElo = Object.values(players).sort((a, b) => {
        return b.elo - a.elo
    })

    // Segment those in their placements, move to end of the list
    let placements = playersSortedByElo.filter(
        p => p.eloHistory.length <= PLACEMENT_GAMES
    )
    playersSortedByElo = playersSortedByElo
        .filter(p => p.eloHistory.length > PLACEMENT_GAMES)
        .concat(placements)

    return { players: playersSortedByElo }
}

module.exports = { buildStats, EloChange }
