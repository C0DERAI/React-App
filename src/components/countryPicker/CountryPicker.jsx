import React,{useState, useEffect} from 'react';
import { NativeSelect, FormControl} from '@material-ui/core';
import styles from './CountryPicker.module.css';
import {fetchCountries} from'../../api';
import Typography from '@material-ui/core/Typography';



const CountryPicker = ({ handleCountryChange }) =>{
    const [fetchedCountries, setFetchedCountries] = useState([]);

    useEffect(()=>{
        const fetchApi = async () => {
           setFetchedCountries(await fetchCountries()); 
        }

        fetchApi();
    }, [setFetchedCountries]);

    return(
        <div className={styles.container}>
            <Typography className={styles.header} variant="h2" component="h2" gutterBottom>
        Threat: COVID-19
      </Typography>
            <FormControl className={styles.formControl}>
            <NativeSelect defaultValue='' onChange={(e) => handleCountryChange(e.target.value)}>
                <option value="">Global</option>
                {fetchedCountries.map((country, i) => <option key={ i } value={country}> {country} </option>)}
            </NativeSelect>
            </FormControl>
        </div>
        )
}
export default CountryPicker;