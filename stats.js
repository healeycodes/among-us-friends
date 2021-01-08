const { hidePlayers } = require("./config.json")
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

function getImpostorDuoTeamName(game) {
    return game.slice(10, 12).sort().join(" ✕ ")
}

// Given a raw list of matches in the form of a row of:
// ten slots for players, two slots for impostors, one slot for winner
// e.g. ['playerA', 'playerB', 'playerC', 'playerD', 'playerE',
//       'playerF', 'playerG', 'playerH', 'playerI', '', <-- allow for nine or ten players
//       'playerA', 'playerB', 'crew'] <-- two impostors, and the winner 'crew' or 'impostor'
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
                    impostorWin: 0,
                    impostorLoss: 0,
                    crewElo: 1200,
                    impostorElo: 1200,
                    elo: 1200,
                    eloHistory: [1200],
                    games: [],
                }
            })
    )

    // Overall season stats
    let season = {
        totalGames: data.values.length,
        mapData: {},
        duos: {},
    }
    data.values.forEach(game => {
        const map = game[13]
        if (map !== undefined) {
            season.mapData[map] = { crewWin: 0, crewLoss: 0 }
        }
        season.duos[getImpostorDuoTeamName(game)] = {
            win: 0,
            loss: 0,
        }
    })

    // Handle each game
    data.values.forEach(game => {
        let crew = new Set(game.slice(0, 10).filter(isEmpty)) // nine or ten player names
        let impostors = game.slice(10, 12) // two player names
        crew.delete(impostors[0])
        crew.delete(impostors[1])
        let winner = game[12] // 'crew' or 'impostor'
        const map = game[13] // map short name

        // Handle overall season stats
        if (map) {
            if (winner === "crew") {
                season.mapData[map].crewWin++
            } else {
                season.mapData[map].crewLoss++
            }
        }
        if (winner === "impostor") {
            season.duos[getImpostorDuoTeamName(game)].win++
        } else {
            season.duos[getImpostorDuoTeamName(game)].loss++
        }

        // Players are measured against the average of the other team
        const avgElo = (list, role) =>
            list.reduce((a, b) => a + players[b][role], 0) / list.length

        let crewAvgElo = avgElo([...crew], "crewElo")
        let impostorAvgElo = avgElo(impostors, "impostorElo")

        // Handle crew
        crew.forEach(crewmate => {
            const player = players[crewmate]
            const eloChange = EloChange(player.eloHistory.length)
            let diff
            if (winner === "crew") {
                diff = eloChange(player.crewElo, impostorAvgElo)[0]
                player.crewWin += 1
                player.crewElo += diff
            } else {
                diff = eloChange(player.crewElo, impostorAvgElo)[1]
                player.crewLoss += 1
                player.crewElo += diff
            }
            player.elo = (player.crewElo + player.impostorElo) / 2
            player.eloHistory.push(player.elo)
            player.games.unshift({
                crew: [...crew],
                impostors,
                winner,
                diff,
                map,
            })
        })

        // Handle impostors
        impostors.forEach(impostor => {
            const player = players[impostor]
            const eloChange = EloChange(player.eloHistory.length)
            let diff
            if (winner === "impostor") {
                diff = eloChange(player.impostorElo, crewAvgElo)[0]
                player.impostorWin += 1
                player.impostorElo += diff
            } else {
                diff = eloChange(player.impostorElo, crewAvgElo)[1]
                player.impostorLoss += 1
                player.impostorElo += diff
            }
            player.elo = (player.crewElo + player.impostorElo) / 2
            player.eloHistory.push(player.elo)
            player.games.unshift({
                crew: [...crew],
                impostors,
                winner,
                diff,
                map,
            })
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

    // Hide players who have requested to not be ranked
    let displayPlayers = playersSortedByElo.filter(
        p => hidePlayers.includes(p.name) === false
    )

    // Find out the highest number of duo wins
    // Get all the duos with this number of wins
    let deadlyDuos = []
    let qualifyingWins = 0
    Object.keys(season.duos).forEach(name => {
        const duo = season.duos[name]
        qualifyingWins = Math.max(duo.win, qualifyingWins)
    })
    Object.keys(season.duos).forEach(name => {
        const duo = season.duos[name]
        if (qualifyingWins !== 0 && duo.win === qualifyingWins) {
            deadlyDuos.push(name)
        }
    })

    return {
        players: displayPlayers,
        season,
        deadlyDuos,
    }
}

module.exports = { buildStats, EloChange }
