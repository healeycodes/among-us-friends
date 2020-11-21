function generatePlayerGraph(player, sample = 0) {
  const ctx = document.getElementById(player.name).getContext("2d");

  const eloHistory =
    sample && sample < player.elo.history.length
      ? player.elo.history.slice(-sample)
      : player.elo.history;

  let datasets = {
    ELO: {
      label: "ELO",
      data: eloHistory.map((e) => e),
      fill: false,
      borderColor: "rgb(75, 192, 192)",
      lineTension: 0.1,
      hidden: false,
    },
    CREW_ELO: {
      label: "CREW_ELO",
      data: player.crewElo.history.map((e) => e),
      fill: false,
      borderColor: "rgb(75, 255, 100)",
      lineTension: 0.1,
      hidden: false,
    },
    IMPOSTER_ELO: {
      label: "IMPOSTER_ELO",
      data: player.imposterElo.history.map((e) => e),
      fill: false,
      borderColor: "rgb(255, 170, 80)",
      lineTension: 0.1,
      hidden: false,
    }
  }

  // const crewChecked = document.getElementById("crew-switch").checked || false
  // const imposterChecked = document.getElementById("imposter-switch").checked || false

  // if (sample && document.getElementById("crew-switch").checked) {
  //   datasets.CREW_ELO.hidden = false;
  // }

  // if (sample && document.getElementById("imposter-switch").checked) {
  //   datasets.IMPOSTER_ELO.hidden = false;
  // }

  const playerGraph = new window.Chart(ctx, {
    type: "line",
    data: {
      labels: eloHistory.map(() => ""), // required
      datasets: Object.values(datasets)
    },
    options: {
      animation: {
        duration: 0
      },
      legend: {
        display: false,
      },
      elements: {
        point: {
          radius: 1,
        },
      },
    },
  });
}
