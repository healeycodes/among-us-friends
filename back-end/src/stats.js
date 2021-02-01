const { hidePlayers } = require("../../config.json")
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

function getImpostorDuoTeamName(game) {
    return game.slice(10, 12).sort().join(" & ")
}

// Given a raw list of matches in the form of a row of:
// ten slots for players, two slots for impostors, one slot for winner
// e.g. ['playerA', 'playerB', 'playerC', 'playerD', 'playerE',
//       'playerF', 'playerG', 'playerH', 'playerI', '', <-- allow for nine or ten players
//       'playerA', 'playerB', 'crew'] <-- two impostors, and the winner 'crew' or 'impostor'
function buildStats(data) {
    if (data.values === undefined) {
        // Perhaps the season has just started and there have been no games
        return null
    }

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
                    missStreak: 0,
                    winStreaks: {
                        current: 0,
                        max: 0,
                    },
                }
            })
    )

    // Overall season stats
    const season = {
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
        // Nine or ten player names
        let playersInGame = new Set(game.slice(0, 10).filter(isEmpty))
        if (playersInGame.size < 9) {
            console.error("Bad number of players", playersInGame.size)
            return
        }

        let allPlayers = new Set(Object.keys(players))
        // Two player names
        let impostors = new Set(game.slice(10, 12))
        if (impostors.size < 2) {
            console.error("Bad number of impostors", impostors)
            return
        }

        let crew = new Set(
            [...playersInGame].filter(name => !impostors.has(name))
        )

        // 'crew' or 'impostor'
        let winner = game[12]
        if (winner !== "crew" && winner !== "impostor") {
            console.error("Bad value of winner", winner)
            return
        }

        const map = game[13] // Map short name

        // Handle overall season stats
        if (map) {
            if (winner === "crew") {
                season.mapData[map].crewWin++
            } else {
                season.mapData[map].crewLoss++
            }
        }

        // Setup data to work out the Deadly Duos
        if (winner === "impostor") {
            season.duos[getImpostorDuoTeamName(game)].win++
        } else {
            season.duos[getImpostorDuoTeamName(game)].loss++
        }

        // Players are measured against the average of the other team
        const avgElo = (list, role) =>
            list.reduce((a, b) => a + players[b][role], 0) / list.length

        let crewAvgElo = avgElo([...crew], "crewElo")
        let impostorAvgElo = avgElo([...impostors], "impostorElo")

        // Handle elo changes
        playersInGame.forEach(name => {
            const player = players[name]
            player.missStreak = 0
            const isCrew = crew.has(name)
            const wonGame =
                (isCrew && winner === "crew") ||
                (!isCrew && winner === "impostor")
            if (wonGame) {
                player.winStreaks.current += 1
                player.winStreaks.max = Math.max(
                    player.winStreaks.current,
                    player.winStreaks.max
                )
            } else {
                player.winStreaks.current = 0
            }
            const eloChange = EloChange(player.eloHistory.length)
            let winDiff, lossDiff

            if (isCrew) {
                ;[winDiff, lossDiff] = eloChange(player.crewElo, impostorAvgElo)
                if (wonGame) {
                    player.crewWin += 1
                    player.crewElo += winDiff
                } else {
                    player.crewLoss += 1
                    player.crewElo += lossDiff
                }
            } else {
                ;[winDiff, lossDiff] = eloChange(player.impostorElo, crewAvgElo)
                if (wonGame) {
                    player.impostorWin += 1
                    player.impostorElo += winDiff
                } else {
                    player.impostorLoss += 1
                    player.impostorElo += lossDiff
                }
            }

            // Inflate elo of in-game players to reward playing
            isCrew ? (player.crewElo += 0.5) : (player.impostorElo += 0.5)
            player.elo = Math.round((player.crewElo + player.impostorElo) / 2)
            const diff =
                player.elo - player.eloHistory[player.eloHistory.length - 1]
            player.eloHistory.push(player.elo)
            player.games.unshift({
                role: isCrew ? "crew" : "impostor",
                crew: [...crew],
                impostors: [...impostors],
                winner,
                diff,
                map,
            })
        })

        // Handle elo changes for players missing games
        playersNotInGame = [...allPlayers].filter(
            player => !playersInGame.has(player)
        )
        playersNotInGame.forEach(name => {
            const player = players[name]
            player.missStreak++
            if (
                player.missStreak >= 40 &&
                player.missStreak % 5 === 0 &&
                player.elo > 1200
            ) {
                // If too many missed games decrement elo
                player.crewElo -= 1
                player.impostorElo -= 1
                player.elo = Math.round(
                    (player.crewElo + player.impostorElo) / 2
                )
                player.eloHistory.push(player.elo)
            }
        })
    })

    // Hide players who have requested to not be ranked
    let displayPlayers = Object.values(players).filter(
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

    // Trophies
    const trophies = {
        // Everyone who played at least one game this season
        veterans: displayPlayers.map(player => player.name),
        // Highest crew Elo
        bestCrew: null,
        // Highest impostor Elo
        bestImpostor: null,
        // Most games played
        mostGames: null,
        // Players with 100+ games played
        oneHundredGames: [],
        // 1300+ players
        thirteenHundreders: [],
        // Winstreaks
        winStreaks: {
            5: [],
            10: [],
            15: [],
        },
    }
    let highestCrewRating = -1
    let highestImpostorRating = -1
    let highestMostGames = -1
    displayPlayers.forEach(player => {
        if (player.crewElo > highestCrewRating) {
            highestCrewRating = player.crewElo
            trophies.bestCrew = player.name
        }
        if (player.impostorElo > highestImpostorRating) {
            highestImpostorRating = player.impostorElo
            trophies.bestImpostor = player.name
        }
        if (player.games.length > highestMostGames) {
            highestMostGames = player.games.length
            trophies.mostGames = player.name
        }
        if (player.games.length >= 100) {
            trophies.oneHundredGames.push(player.name)
        }
        if (player.elo >= 1300) {
            trophies.thirteenHundreders.push(player.name)
        }
        if (player.winStreaks.max >= 5) {
            trophies.winStreaks["5"].push(player.name)
        }
        if (player.winStreaks.max >= 10) {
            trophies.winStreaks["10"].push(player.name)
        }
        if (player.winStreaks.max >= 15) {
            trophies.winStreaks["15"].push(player.name)
        }
    })
    // 1st, 2nd, 3rd, etc.
    trophies.podium = displayPlayers.slice(0, 3).map(player => player.name)

    return {
        players: displayPlayers,
        trophies,
        season,
        deadlyDuos,
    }
}

module.exports = { buildStats, EloChange }
