import React from 'react';
import { Card, CardContent, Typography, Grid} from '@material-ui/core';
import styles from './Cards.module.css';
import CountUp from 'react-countup';
import cn from 'classnames';
import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import infectedIco from '../../assets/images/infected-icon.png'
import recoveredIco from '../../assets/images/recovered-icon.png'
import deathIco from '../../assets/images/death-icon.png'
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    small: {
      width: theme.spacing(3),
      height: theme.spacing(3),
    },
    large: {
      width: theme.spacing(7),
      height: theme.spacing(7),
    },
  }));

const Cards = ({data:{confirmed, recovered, deaths, lastUpdate}}) =>{
    // console.log(confirmed);
    const classes = useStyles();

    if(!confirmed){
        return 'Loading...';
    }
    return(
        <div className={styles.container}>
            <Grid container spacing={3} justify="center">
                <Grid item component={Card} xs={10} md={3} className={cn(styles.card, styles.infected)}>
                    <CardContent>
                        <Box display="flex" flexDirection="row">
                        <Box width="90%">
                            <Typography variant="h5" className={styles.cardHeader} color="textSecondary" gutterBottom> 
                                Infected 
                            </Typography>
                        </Box>
                            <Avatar className={classes.large} alt="Infected Icon" src={infectedIco}/>
                        </Box>
                        <Typography variant="h5">
                        <CountUp start={0} end={confirmed.value} duration={2.5} seperator=","/>
                        </Typography>
                        <Typography color="textSecondary">{new Date(lastUpdate).toDateString()}</Typography>
                        <Typography variant="body2">Number of active cases of COVID-19</Typography>
                    </CardContent>
                </Grid>

                <Grid item component={Card} xs={10} md={3} className={cn(styles.card, styles.recovered)}>
                    <CardContent>
                    <Box display="flex" flexDirection="row">
                        <Box width="90%">
                         <Typography variant="h5" className={styles.cardHeader} color="textSecondary" gutterBottom> Recovered</Typography>
                        </Box>
                            <Avatar  className={classes.large} alt="Infected Icon" src={recoveredIco}/>
                        </Box>
    <Typography variant="h5"> <CountUp start={0} end={recovered.value} duration={2.5} seperator=","/></Typography>
                        <Typography color="textSecondary">{new Date(lastUpdate).toDateString()}</Typography>
                        <Typography variant="body2">Number of recoveries from COVID-19</Typography>
                    </CardContent>
                </Grid>

                <Grid item component={Card} xs={10} md={3} className={cn(styles.card, styles.deaths)}>
                    <CardContent>
                    <Box display="flex" flexDirection="row">
                        <Box width="90%">
                            <Typography variant="h5" className={styles.cardHeader} color="textSecondary" gutterBottom> Deaths </Typography>
                        </Box>
                            <Avatar  className={classes.large} alt="Infected Icon" src={deathIco}/>
                        </Box>
                        <Typography variant="h5"> 
                        <CountUp start={0} end={deaths.value} duration={2.5} seperator=","/></Typography>
                        <Typography color="textSecondary">{new Date(lastUpdate).toDateString()}</Typography>
                        <Typography variant="body2">Number of deaths caused by COVID-19</Typography>
                    </CardContent>
                </Grid>
            </Grid>
        </div>
        )
}
export default Cards;