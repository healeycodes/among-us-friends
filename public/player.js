const playerTitle = document.querySelector("#player-title");
const playerList = document.querySelector(".player");

fetch("/stats")
  .then(response => response.json())
  .then(json => {
    console.log(json);
    // Remove loading text
    playerList.firstElementChild.remove();

    const URLparts = document.location.href.split("/");
    const name = URLparts.pop() || URLparts.pop(); // handle potential trailing slash
    const player = json.players.filter(p => p.name === name)[0];

    document.querySelector("canvas").id = name;
    window.generatePlayerGraph(player);
    playerTitle.innerHTML += ` - ${name} (<code>${player.elo}</code>)`;

    const gamesList = document.createElement("div");
    //
    //
    player.games.forEach(game => {
      const gameElem = document.createElement("p");
      gameElem.classList.add("game-history");
      gameElem.innerHTML = `${
        game.diff > 0 ? '<b class="green">WIN</b>' : '<b class="red">LOSS</b>'
      }</b> <code>${
        game.diff > 0 ? "+" + game.diff : "" + game.diff
      }</code><br/>👹 ${game.imposters.join(" ")}<br/>😇 ${game.crew.join(
        " "
      )}`;
      gamesList.appendChild(gameElem);
    });
    playerList.appendChild(gamesList);
  });
