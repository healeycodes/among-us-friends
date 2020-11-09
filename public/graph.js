function generatePlayerGraph(player) {
  const ctx = document.getElementById(player.name).getContext("2d");
  const playerGraph = new window.Chart(ctx, {
    type: "line",
    data: {
      labels: player.eloHistory.map(() => ""), // required
      datasets: [
        {
          label: "ELO",
          data: player.eloHistory.map(e => e),
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
