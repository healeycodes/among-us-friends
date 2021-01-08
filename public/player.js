const playerElo = document.querySelector("#player-elo")
const playerList = document.querySelector(".player")

function load(json) {
    // Remove loading text and any old data
    document.querySelector(".loading-indicator").innerHTML = ""
    document.querySelectorAll(".games-list").forEach(elem => elem.remove())

    const URLparts = document.location.href.split("/")
    const name = URLparts.pop() || URLparts.pop() // handle potential trailing slash

    const player = json.players.filter(p => p.name === name)[0]
    const elo = player.elo
    let impostorGames = 0

    playerElo.innerHTML = ` - ${name} (<code>${elo}</code>)`

    document.querySelector("canvas").id = name
    window.generatePlayerGraph(player)

    const gamesList = document.createElement("div")
    gamesList.classList.add("games-list")
    player.games.forEach(game => {
        let map = getMap(game.map)

        const gameElem = document.createElement("p")
        gameElem.classList.add("game-history")
        gameElem.innerHTML = `${
            game.diff > 0
                ? '<b class="green">WIN</b>'
                : '<b class="red">LOSS</b>'
        }</b> <code>${game.diff > 0 ? "+" + game.diff : "" + game.diff}</code>${
            map ? `<br/>${map}` : ""
        }<br/>👹 ${game.impostors.join(" ")}<br/>😇 ${game.crew.join(" ")}`
        gamesList.appendChild(gameElem)
        if (game.impostors.includes(name)) {
            impostorGames++
        }
    })
    playerList.appendChild(gamesList)

    const seasonStats = document.querySelector("#season-stats")
    seasonStats.innerHTML = `${name} gets impostor ${parseFloat(
        (impostorGames / player.games.length) * 100
    ).toFixed(2)}% of the time this season.`
}

getStats().then(json => load(json))
