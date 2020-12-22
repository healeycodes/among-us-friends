const statsList = document.getElementById("stats")

function load(json) {
    // Remove loading text and any old data
    document.querySelector(".loading-indicator").innerHTML = ""
    document.querySelectorAll(".player-row").forEach(elem => elem.remove())

    const seasonStats = document.querySelector("#season-stats")
    seasonStats.innerHTML = `There have been ${json.season.totalGames} games played.`
    Object.keys(json.season.mapData).forEach(map => {
        const crewWin = json.season.mapData[map].crewWin
        const crewLoss = json.season.mapData[map].crewLoss
        const percent = parseFloat(
            (crewWin / (crewWin + crewLoss)) * 100
        ).toFixed(2)
        seasonStats.innerHTML += `<br/>Crew win ${percent}% of the time on ${getMap(
            map
        )}.`
    })
    if (json.deadlyDuos.length > 0) {
        seasonStats.innerHTML += `<br/>The deadliest imposter ${
            json.deadlyDuos.length > 1 ? "duos are" : "duo is"
        } ${json.deadlyDuos.join(", ")}.`
    }

    const players = json.players
    for (const [rank, player] of players.entries()) {
        const newListItem = document.createElement("div")
        newListItem.classList.add("player-row")

        const crewWin = player.crewWin
        const crewLoss = player.crewLoss
        let crewWinRate = parseFloat(
            (crewWin / (crewWin + crewLoss)) * 100
        ).toFixed(2)
        const imposterWin = player.imposterWin
        const imposterLoss = player.imposterLoss
        let imposterWinRate = parseFloat(
            (imposterWin / (imposterWin + imposterLoss)) * 100
        ).toFixed(2)

        const crewText =
            crewWin + crewLoss > 0
                ? `<li>😇&nbsp;&nbsp;win ${crewWin}, loss ${crewLoss}, win rate of ${crewWinRate}%</li>`
                : ""
        const imposterText =
            imposterWin + imposterLoss > 0
                ? `<li>👹&nbsp;&nbsp;win ${imposterWin}, loss ${imposterLoss}, win rate of ${imposterWinRate}%</li>`
                : ""

        const elo = player.eloHistory.length <= 10 ? "~" : player.elo
        newListItem.innerHTML = `<div class="player">
<h5><small>#${
            rank + 1
        }</small> <a href=".netlify/functions/app/player.html?name=${
            player.name
        }">${player.name}</a> <small>(<code>${elo}</code>)</small></h5>
<ul style="list-style-type: none; padding-bottom: 1em;">
${crewText}
${imposterText}
</ul>
</div>
<div class="player-graph">
<canvas id="${player.name}" width="300" height="100"></canvas>
</div>`

        statsList.appendChild(newListItem)
        window.generatePlayerGraph(player, 30)
    }
}

getStats().then(json => load(json))
