const playerElo = document.querySelector("#player-elo")
const playerList = document.querySelector(".player")
const loadingIndicator = document.querySelector(".loading-indicator")

function load(json) {
    // Remove loading text and any old data
    loadingIndicator.innerHTML = ""
    document.querySelectorAll(".games-list").forEach(elem => elem.remove())

    if (json === null) {
        loadingIndicator.innerHTML = "It's a new season. Go play some games!"
    }

    const urlParams = new URLSearchParams(window.location.search)
    const name = urlParams.get("name")

    const player = json.players.filter(p => p.name === name)[0]
    const elo = player.elo
    let imposterGames = 0

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
        }<br/>👹 ${game.imposters.join(" ")}<br/>😇 ${game.crew.join(" ")}`
        gamesList.appendChild(gameElem)
        if (game.imposters.includes(name)) {
            imposterGames++
        }
    })
    playerList.appendChild(gamesList)

    const seasonStats = document.querySelector("#season-stats")
    seasonStats.innerHTML = `${name} gets imposter ${parseFloat(
        (imposterGames / player.games.length) * 100
    ).toFixed(2)}% of the time this season.`
}

getStats().then(json => load(json))
