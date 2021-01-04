function getAllStats() {
    addLoadingIndicator()
    return fetch(`.netlify/functions/app/wrapped`).then(response =>
        response.json()
    )
}

function getStats(select) {
    // We get called on page load or season change via dropdown
    let season
    if (select) {
        season = select.selectedOptions[0].value
    } else {
        season = "current"
    }

    addLoadingIndicator()
    return fetch(`.netlify/functions/app/stats/${season}`).then(response =>
        response.json()
    )
}

function addLoadingIndicator() {
    document.querySelector(".loading-indicator").innerHTML =
        '<em class="loading">loading</em>'
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
