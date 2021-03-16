import './MatchListItem.css';
import { useState } from 'react';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import Collapse from '@material-ui/core/Collapse';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';

function MatchListItem(props) {
    const [expanded, setExpanded] = useState(false);

    function handleExpand() {
        setExpanded(!expanded);
    }

    function getRank(rank, teams) {
        return `${rank}/${teams}`
    }

    return (
      <div key={props.match.id} className="MatchListItem">
        <Grid container spacing={2} className="MatchGroup">
            <Grid item xs={6}>
                {props.match.teams[0].players.map((player) => (
                    <div className="PlayerBox">
                        <span className="PlayerName">{player.name}</span>
                        <span className="PlayerStats">{`Damage: ${player.damage} Kills: ${player.kills}`}</span> 
                    </div>
                ))}
            </Grid>
            <Grid item xs={6} className="RankAndDays">
                {/* {props.match.teams[0].players?.map(player => (
                    <div className="PlayerBox">
                        <div>{player.name}</div>
                        <div>{`Damage: ${player.damage} Kills: ${player.kills}`}</div> 
                    </div>
                ))} */}
                <Grid container spacing={3}>
                    <Grid item xs={2}>
                        <span className="Rank">{getRank(props.match.teams[0].rank, props.match.teams.length)}</span>
                    </Grid>
                    <Grid item xs={6}>
                        <span className="DaysSince">{props.match.date}</span>
                    </Grid>
                    <Grid item xs={2}>
                        <Button onClick={() => handleExpand()}>
                            { expanded ? <ExpandLess /> : <ExpandMore />}
                        </Button>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
        <Collapse in={expanded} unmountOnExit>
            {props.match.teams.map((team, index)=> (
                <div>
                    {index !== 0 ? 
                        <div >
                            <div className={"OtherPlayers" + (index % 2 ? "Grey" : "LightGrey")}>
                                {team.players?.map((player, idx) => (
                                    <div className={"PlayerBox"}>
                                        <div>{player.name}</div>
                                        <div>{`Damage: ${player.damage} Kills: ${player.kills}`}</div> 
                                    </div>
                                ))}
                                <div className="Rank">
                                    <span>{getRank(team.rank, props.match.teams.length)}</span>
                                </div>
                            </div>
                        </div>
                        : null
                    }
                </div>
            ))}
            </Collapse>                                     
      </div>  
    );
}

export default MatchListItem;