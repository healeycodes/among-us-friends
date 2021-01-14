export default function About() {
    return (
        <div>
            <p>
                <b>How does the Elo work?</b>
                <br />
                Players have a hidden crew Elo and a hidden impostor Elo.
                Players are measured against the average of the other team. For
                the first 30 games, players lose and gain more Elo (à la{" "}
                <a href="https://ratings.fide.com/calculator_rtd.phtml">FIDE</a>
                ). After missing 40 games in a row, Elo will slowly decay.
            </p>

            <p>
                <b>Is the code open source?</b>
                <br />
                Yep! The code for this project is open source (
                <a href="https://github.com/healeycodes/among-us-friends">
                    healeycodes/among-us-friends
                </a>
                ). Thanks to ally, roma, and maxoys for their contributions so
                far!
            </p>
        </div>
    )
}
