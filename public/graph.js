function generatePlayerGraph(player, sample = 0) {
  const ctx = document.getElementById(player.name).getContext("2d");

  const eloHistory = (sample && sample < player.eloHistory.length) ? player.eloHistory.slice(-sample) : player.eloHistory

  const playerGraph = new window.Chart(ctx, {
    type: "line",
    data: {
      labels: eloHistory.map(() => ""), // required
      datasets: [
        {
          label: "ELO",
          data: eloHistory.map(e => e),
          fill: false,
          borderColor: "rgb(75, 192, 192)",
          lineTension: 0.1
        }
      ]
    },
    options: {
      legend: {
        display: false
      },
      elements: {
        point: {
          radius: 0
        }
      }
    }
  });
}
