export function getMap(map) {
    const maps = {
        skeld: "The Skeld",
        polus: "Polus",
        mira: "Mira HQ",
        airship: "The Airship",
    }

    return maps[map] || "Unknown map"
}

export async function getSeasons() {
    const response = await fetch(`/.netlify/functions/app/seasons`)
    return await response.json()
}

export async function getAllSeasonStats() {
    const response = await fetch(`/.netlify/functions/app/stats`)
    return await response.json()
}
