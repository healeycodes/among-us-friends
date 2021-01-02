const { hidePlayers } = require("../config.json")
const EloRating = require("elo-rating")

const PLACEMENT_GAMES = 10

function EloChange(games) {
    // Based on https://ratings.fide.com/calculator_rtd.phtml
    // K = 40 for a player with less than 30 games
    // K = 20 afterwards
    const K = games > 30 ? 20 : 40
    // From playerA's perspective, how much can be wonGame or lost
    return function (playerA, playerB) {
        return [
            EloRating.calculate(playerA, playerB, true, K).playerRating -
            playerA,
            EloRating.calculate(playerA, playerB, false, K).playerRating -
            playerA,
        ]
    }
}

function getImposterDuoTeamName(game) {
    return game.slice(10, 12).sort().join(" ✕ ")
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
                    missStreak: 0,
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
        season.duos[getImposterDuoTeamName(game)] = {
            win: 0,
            loss: 0,
        }
    })

    // Handle each game
    data.values.forEach(game => {
        let playersInGame = new Set(game.slice(0, 10).filter(isEmpty)) // nine or ten player names
        let allPlayers = new Set(Object.keys(players))

        let imposters = new Set(game.slice(10, 12)) // two player names
        let crew = new Set([...playersInGame].filter(name => !imposters.has(name)))

        let winner = game[12] // 'crew' or 'imposter'
        const map = game[13] // map short name

        // Handle overall season stats
        if (map) {
            if (winner === "crew") {
                season.mapData[map].crewWin++
            } else {
                season.mapData[map].crewLoss++
            }
        }

        // Setup data to work out the Deadly Duos
        if (winner === "imposter") {
            season.duos[getImposterDuoTeamName(game)].win++
        } else {
            season.duos[getImposterDuoTeamName(game)].loss++
        }

        // Players are measured against the average of the other team
        const avgElo = (list, role) =>
            list.reduce((a, b) => a + players[b][role], 0) / list.length

        let crewAvgElo = avgElo([...crew], "crewElo")
        let imposterAvgElo = avgElo([...imposters], "imposterElo")

        // Handle elo changes
        playersInGame.forEach(name => {
            const player = players[name]
            player.missStreak = 0
            const isCrew = crew.has(name)
            const wonGame = isCrew && winner === "crew" || !isCrew && winner === "imposter"
            const eloChange = EloChange(player.eloHistory.length)
            let winDiff, lossDiff

            if (isCrew) {
                [winDiff, lossDiff] = eloChange(player.crewElo, imposterAvgElo)
                if (wonGame) {
                    player.crewWin += 1
                    player.crewElo += winDiff
                } else {
                    player.crewLoss += 1
                    player.crewElo += lossDiff
                }
            } else {
                [winDiff, lossDiff] = eloChange(player.imposterElo, crewAvgElo)
                if (wonGame) {
                    player.imposterWin += 1
                    player.imposterElo += winDiff
                } else {
                    player.imposterLoss += 1
                    player.imposterElo += lossDiff
                }
            }

            isCrew ? player.crewElo += 0.5 : player.imposterElo += 0.5 // inflate elo of ingame players to reward playing
            player.elo = Math.round((player.crewElo + player.imposterElo) / 2)
            player.eloHistory.push(player.elo)
            const diff = wonGame ? winDiff : lossDiff
            player.games.unshift({
                crew: [...crew],
                imposters: [...imposters],
                winner,
                diff,
                map,
            })
        })

        // handle elo changes for players missing games
        playersNotInGame = [...allPlayers].filter(player => !playersInGame.has(player))
        playersNotInGame.forEach(name => {
            const player = players[name]
            player.missStreak++
            if (player.missStreak >= 40 && player.missStreak % 5 === 0 && player.elo > 1200) { 
                player.crewElo -= 1 // if too many missed games decrement elo
                player.imposterElo -= 1
                player.elo = Math.round((player.crewElo + player.imposterElo) / 2)
                player.eloHistory.push(player.elo)
            }
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

    // Which duo is the deadliest? Use a minimum number of wins then go by %
    let minGames = 4
    let allDeadlies = []
    Object.keys(season.duos).forEach(name => {
        const duo = season.duos[name]
        if (duo.win + duo.loss >= minGames) {
            allDeadlies.push({
                name: name,
                winPercent: (duo.win / (duo.win + duo.loss)) * 100,
            })
        }
    })
    allDeadlies.sort((a, b) => b.winPercent - a.winPercent)
    const deadlyDuos = allDeadlies.length > 0 ? [allDeadlies.shift().name] : []

    return {
        players: displayPlayers,
        season,
        deadlyDuos,
    }
}

module.exports = { buildStats, EloChange }
