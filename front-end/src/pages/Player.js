import { useParams } from "react-router-dom"
import Twemoji from "react-twemoji"

import Summary from "../components/Summary"
import TrophyCase from "../components/TrophyCase"
import { getMap } from "../Api"

function result(game, i) {
    const map = getMap(game.map)
    return (
        <div key={i} style={{ marginBottom: "24px" }}>
            <div>
                <small>
                    {game.role === "crew" ? (
                        <Twemoji>😇</Twemoji>
                    ) : (
                        <Twemoji>👹</Twemoji>
                    )}
                </small>{" "}
                {game.diff > 0 ? (
                    <span style={{ color: "green" }}>win</span>
                ) : (
                    <span style={{ color: "red" }}>loss</span>
                )}{" "}
                {game.diff > 0 ? "+" + game.diff : "" + game.diff}{" "}
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
    const { loading, players, allTrophies } = props
    const { id } = useParams()

    if (loading) {
        return <></>
    }

    const player = players.find(player => player.name === id)

    return (
        <div>
            <div style={{ marginTop: "48px", marginBottom: "80px" }}>
                <div style={{ flex: 1 }}>
                    <div style={{ marginTop: "96px", marginBottom: "30px" }}>
                        <b>trophies</b>
                    </div>
                    <TrophyCase name={id} allTrophies={allTrophies} />
                </div>
            </div>
            <div style={{ marginTop: "48px", marginBottom: "30px" }}>
                <b>season summary</b>
            </div>
            {player !== undefined ? (
                players.map((player, i) => {
                    if (player.name !== id) {
                        return <></>
                    }
                    return <Summary player={player} i={i} history={0} />
                })
            ) : (
                <p>They didn't play this season.</p>
            )}

            {player !== undefined && (
                <div style={{ marginTop: "48px", marginBottom: "30px" }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ marginBottom: "30px" }}>
                            <b>game history</b>
                        </div>
                        {player.games.map(game => result(game))}
                    </div>
                </div>
            )}
        </div>
    )
}
