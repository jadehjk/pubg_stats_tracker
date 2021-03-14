import './SearchBar.css';
import { useState } from 'react';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import ClearIcon from '@material-ui/icons/Clear';
import InputAdornment from '@material-ui/core/InputAdornment';
import { FormControl, Input } from '@material-ui/core';


function SearchBar(props) {
    const [names, setNames] = useState('');

    function handleSearch() {
        console.log(names)
        props.onPlayersSearch(names);
    }

    function handleInput(event) {
        event.stopPropagation();
        setNames(event.target.value)
    }

    function handleClearInput() {
        setNames('');
    }
    
    return (
      <div className="SearchBar">
        <div className="SearchBarText">
            <FormControl>
                <Input
                    value={names}
                    onChange={handleInput}
                    endAdornment={
                        <InputAdornment position="end">
                            <IconButton aria-label="clear" onClick={handleClearInput}>
                                <ClearIcon />
                            </IconButton>
                        </InputAdornment>
                    }
                    placeholder="Player1, Player2, etc."
                >

                </Input>
            </FormControl>
        </div>
       
        
        <Button
            className="SearchBarButton"
            variant="contained"
            color="primary"
            onClick={handleSearch}
        > Search
        </Button>
        
      </div>
    );
}

export default SearchBar;