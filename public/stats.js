function getStats(select) {
    // We get called on page load or season change via dropdown
    let season
    if (select) {
        season = select.selectedOptions[0].value
    } else {
        season = "current"
    }

    // Add loading indicator or clear the board if we're changing season
    document.querySelector(".loading-indicator").innerHTML =
        '<em class="loading">loading</em>'

    return fetch(`/stats/${season}`).then(response => response.json())
}
