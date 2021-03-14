import './MatchListItem.css';
import { useState } from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import Collapse from '@material-ui/core/Collapse';


function MatchListItem(props) {
    const [expanded, setExpanded] = useState(false);

    function handleExpand() {
        console.log('hello');
        setExpanded(!expanded);
    }

    return (
      <div className="MatchListItem">
          <div key={props.match.teams[0].id} className="MatchGroup">
            {props.match.teams[0].players?.map(player => (
                <ListItem key={player.name}>
                    <ListItemText primary={player.name} secondary={`Damage: ${player.damage} Kills: ${player.kills}`} />
                </ListItem>
            ))}
            <div className="MatchGroup">
                <span>{props.match.teams[0].rank}</span>
                <span>{`/ ${props.match.teams.length}`}</span>
            </div>
            <ListItem key={props.match.teams[0].id} button onClick={() => handleExpand()}>
                { expanded ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
        </div>
        <Collapse key={props.match.id} in={expanded} unmountOnExit>
            <List key={props.match.id}>
                {props.match.teams.map(team => (
                    <div key={team.id}>
                        {!team.isTarget &&
                            <List key={team.id}>
                                <div className="MatchGroup">
                                    {team.players?.map(player => (
                                        <ListItem key={player.name}>
                                            <ListItemText primary={player.name} secondary={`Damage: ${player.damage} Kills: ${player.kills}`} />
                                        </ListItem>
                                    ))}
                                    <div className="MatchGroup">
                                        <span>{team.rank}</span>
                                        <span>{`/${props.match.teams.length}`}</span>
                                    </div>
                                </div>
                        </List>
                        }   
                    </div>
                ))}
            </List>
        </Collapse>
      </div>  
    );
}

export default MatchListItem;