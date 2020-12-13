function getStats(select) {
    // We get called on page load or season change via dropdown
    let season
    if (select) {
        season = select.selectedOptions[0].value
    } else {
        season = "current"
    }

    // Add loading indicator
    document.querySelector(".loading-indicator").innerHTML =
        '<em class="loading">loading</em>'

    return fetch(`/stats/${season}`).then(response => response.json())
}

function getMap(map) {
    const maps = {
        skeld: "🏟️ The Skeld",
        polus: "🌋 Polus",
        mira: "🛰️ Mira HQ",
        airship: "✈️ The Airship",
    }

    if (map in maps) {
        return maps[map]
    }

    return "❓ Unknown map"
}
