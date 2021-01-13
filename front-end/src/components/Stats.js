import { getMap } from '../Api'

export default function Maps(props) {
    const { season, deadlyDuos } = props

    return (
        <div className="App">
            <p>{season.totalGames} games played.</p>
            {deadlyDuos && <p>Deadliest impostor duo is <i>{deadlyDuos}</i>.</p>}
            <p><b>Maps</b><br />{Object.keys(season.mapData).map(name => {
                const crewWin = season.mapData[name].crewWin
                const crewLoss = season.mapData[name].crewLoss
                const percent = parseFloat(
                    (crewWin / (crewWin + crewLoss)) * 100
                ).toFixed(2)

                return <>Crew win {percent}% of the time on {getMap(name)}.<br /></>
            })}</p>
        </div>
    );
}