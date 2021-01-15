import { useParams } from "react-router-dom"

import Summary from "../components/Summary"
import { getMap } from "../Api"

function result(game, i) {
    const map = getMap(game.map)
    return (
        <div key={i} style={{ marginBottom: "24px" }}>
            <div>
                {game.diff > 0 ? <span style={{ color: "green" }}>W</span> : <span style={{ color: "red" }}>L</span>}{" "}
                {game.diff > 0
                    ? "+" + game.diff
                    : "" + game.diff}{" "}
                <small>({map})</small>
            </div>
            <div>
                <small>{game.impostors.sort().join(" ")}</small>
            </div>
            <div>
                <small>{game.crew.sort().join(" ")}</small>
            </div>
        </div>
    )
}

export default function Player(props) {
    const { loading, players } = props
    const { id } = useParams()

    if (loading) {
        return <></>
    }

    const player = players.find(player => player.name === id)
    if (player === undefined) {
        return <p>They didn't play this season.</p>
    }

    const crewGames = player.games.filter(game => game.crew.includes(player.name))
    const impostorGames = player.games.filter(game => game.impostors.includes(player.name))

    return (
        <div>
            {players.map((player, i) => {
                if (player.name !== id) {
                    return <></>
                }
                return <Summary player={player} i={i} history={0} />
            })}
            <div style={{ marginTop: "48px" }}>
                <div style={{ display: 'flex' }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ marginBottom: '48px' }}>as crew</div>
                        {crewGames.map((game, i) => result(game, `crew-${i}`))}
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ marginBottom: '48px' }}>as impostor</div>
                        {impostorGames.map((game, i) => result(game, `impostor-${i}`))}
                    </div>
                    <div></div>
                </div>
            </div>
        </div>
    )
}
