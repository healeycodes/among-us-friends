import { useParams } from "react-router-dom"

import Summary from "../components/Summary"
import { getMap } from "../Api"

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

    return (
        <div>
            {players.map((player, i) => {
                if (player.name !== id) {
                    return <></>
                }
                return <Summary player={player} i={i} history={0} />
            })}
            <div style={{ marginTop: "48px" }}>
                {player.games.map(game => {
                    const map = getMap(game.map)
                    return (
                        <div style={{ marginBottom: "24px" }}>
                            <div>
                                {game.diff > 0 ? "W" : "L"}{" "}
                                {game.diff > 0
                                    ? "+" + game.diff
                                    : "" + game.diff}{" "}
                                ({map})
                            </div>
                            <div>
                                <small>{game.impostors.join(" ")}</small>
                            </div>
                            <div>
                                <small>{game.crew.join(" ")}</small>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
