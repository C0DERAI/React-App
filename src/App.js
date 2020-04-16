import React from 'react';
import styles from './App.module.css'

import { Cards, Chart, CountryPicker} from './components/index';

import {fetchData} from './api'

class App extends React.Component {
  state = {
    data : {},
    country:'',
  }

  async componentDidMount(){
    const fetchedData = await fetchData();
    
    this.setState({data : fetchedData});
    // console.log(data);
  }

  handleCountryChange = async (country) =>{
    const fetchedData = await fetchData(country);

    this.setState({data: fetchedData, country: country});
  }

  render(){
    const { data, country } = this.state;
    return (
      <div className={styles.container}>
        <CountryPicker handleCountryChange={this.handleCountryChange}/>
        <Cards data={data}/>
        <Chart  data={data} country={country}/>
      </div>
    );
  }
}

export default App;
