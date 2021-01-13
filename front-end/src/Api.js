export function getMap(map) {
    const maps = {
        skeld: "The Skeld",
        polus: "Polus",
        mira: "Mira HQ",
        airship: "The Airship",
    }

    return maps[map] || "Unknown map"
}

async function callStats(query) {
    const response = await fetch(`/.netlify/functions/app/stats/${query}`)
    return await response.json()
}

export async function getStats(seasonName) {
    const stats = await callStats(seasonName)
    const { season, seasons, players, deadlyDuos } = stats

    return {
        players,
        season,
        seasons,
        deadlyDuos,
    }
}
