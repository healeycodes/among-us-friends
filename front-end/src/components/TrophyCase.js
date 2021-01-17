import { manualTrophies } from "../localConfig.json"
import Twemoji from "react-twemoji"

export default function TrophyCase(props) {
    const { player, allTrophies } = props
    const podium = ["🥇", "🥈", "🥉"]
    const seasons = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"]

    const seasonTrophies = []
    for (const season of Object.keys(allTrophies)) {
        const currentSeason = []

        if (allTrophies[season].veterans.includes(player.name)) {
            currentSeason.push({
                icon: seasons[parseInt(season) - 1],
                description: `Participant Season ${season}`,
            })
        }
        if (allTrophies[season].bestCrew === player.name) {
            currentSeason.push({
                icon: "👮🏻‍♀️",
                description: `Best Crew Season ${season}`,
            })
        }
        if (allTrophies[season].bestImpostor === player.name) {
            currentSeason.push({
                icon: "🧛🏼‍♀️",
                description: `Best Impostor Season ${season}`,
            })
        }
        if (allTrophies[season].mostGames === player.name) {
            currentSeason.push({
                icon: "🕯",
                description: `Most Games Season ${season}`,
            })
        }
        if (allTrophies[season].oneHundredGames.includes(player.name)) {
            currentSeason.push({
                icon: "💯",
                description: `100+ Games Played ${season}`,
            })
        }
        if (allTrophies[season].thirteenHundreders.includes(player.name)) {
            currentSeason.push({
                icon: "⛳️",
                description: `1300+ Finish Season ${season}`,
            })
        }
        allTrophies[season].podium.forEach((place, index) => {
            if (place === player.name) {
                currentSeason.push({
                    icon: podium[index],
                    description: `Podium Finish Season ${season}`,
                })
            }
        })
        if (allTrophies[season].winStreaks["5"].includes(player.name)) {
            currentSeason.push({
                icon: "🔧",
                description: `5 Wins in a Row Season ${season}`,
            })
        }
        if (allTrophies[season].winStreaks["10"].includes(player.name)) {
            currentSeason.push({
                icon: "🛠",
                description: `10 Wins in a Row Season ${season}`,
            })
        }
        if (allTrophies[season].winStreaks["15"].includes(player.name)) {
            currentSeason.push({
                icon: "🔫",
                description: `15 Wins in a Row Season ${season}`,
            })
        }
        seasonTrophies.push(currentSeason)
    }

    const extraTrophies = []
    for (const trophy of manualTrophies) {
        if (trophy.player === player.name) {
            extraTrophies.push({
                icon: trophy.icon,
                description: trophy.description,
            })
        }
    }

    return (
        <Twemoji options={{ className: "emoji-large" }}>
            <div style={{ marginTop: "15px" }}>
                {extraTrophies.map((trophy, i) => (
                    <span
                        key={i}
                        title={trophy.description}
                        style={{ paddingRight: "10px" }}
                    >
                        {trophy.icon}
                    </span>
                ))}
            </div>
            {seasonTrophies.map((trophies, i) => (
                <div style={{ marginTop: "15px" }} key={i}>
                    {trophies.map((trophy, j) => (
                        <span
                            key={j}
                            title={trophy.description}
                            style={{ paddingRight: "10px" }}
                        >
                            {trophy.icon}
                        </span>
                    ))}
                </div>
            ))}
        </Twemoji>
    )
}
