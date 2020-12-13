const playerElo = document.querySelector("#player-elo")
const playerList = document.querySelector(".player")

const maps = {
    skeld: "🏟️ The Skeld",
    polus: "🌋 Polus",
    mira: "🛰️ Mira HQ",
    airship: "✈️ The Airship",
}

function load(json) {
    // Remove loading text and any old data
    document.querySelector(".loading-indicator").innerHTML = ""
    document.querySelectorAll(".games-list").forEach(elem => elem.remove())

    const URLparts = document.location.href.split("/")
    const name = URLparts.pop() || URLparts.pop() // handle potential trailing slash

    const player = json.players.filter(p => p.name === name)[0]
    const elo = player.elo

    playerElo.innerHTML = ` - ${name} (<code>${elo}</code>)`

    document.querySelector("canvas").id = name
    window.generatePlayerGraph(player)

    const gamesList = document.createElement("div")
    gamesList.classList.add("games-list")
    player.games.forEach(game => {
        let map = maps[game.map]

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
    })
    playerList.appendChild(gamesList)
}

getStats().then(json => load(json))
