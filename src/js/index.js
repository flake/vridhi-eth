import React from 'react'
import ReactDOM from 'react-dom'
import Web3 from 'web3'
import { MuiThemeProvider, createMuiTheme } from 'material-ui/styles'
import Grid from 'material-ui/Grid'
import TextField from 'material-ui/TextField'
import Button from 'material-ui/Button'
import Select from 'material-ui/Select'
import { FormControl } from 'material-ui/Form'
import Input, { InputLabel } from 'material-ui/Input'
import {MenuItem} from 'material-ui/Menu'
import blue from 'material-ui/colors/blue'

import './../css/index.css'

const muiTheme = createMuiTheme({
  palette: {
    primary: { ...blue, 500: '#176D86' }, // #117930 #176D86
  },
  overrides: {
    MuiButton: {
      // Name of the styleSheet
      root: {
        // Name of the rule
        padding: '2px 8px',
        minHeight: '32px',
        minWidth: 'inherit',
        fontSize: '12px',
      },
      label: {
        fontSize: '12px',
        fontWeight: 'bold',
      },
    },
    MuiIconButton: {
      icon: {
        width: '20px',
        height: '20px',
      },
      root: {
        width: '32px',
        height: '32px',
      },
    },
    MuiListItem: {
      default: {
        paddingTop: '6px',
        paddingBottom: '6px',
      },
      gutters: {
        paddingLeft: '8px',
        paddingRight: '8px',
      },
    },
  },
});

class App extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      farmerName: '',
      farmerVillage: '',
      netizenId: '',
      netizenType: '',
      netizenVillage: '',
      cropName: '',
      sellTo: '',
      quantity: 0,
      sendStatus: '',
    }

    if (typeof web3 != undefined) {
      console.log("Using web3 detected from external source like Metamask");
      this.web3 = new Web3(web3.currentProvider);
    } else {
      this.web3 = new Web3(new Web3.providers.HttpProvider("http://vridhifkpau5.southeastasia.cloudapp.azure.com:8545"));
    }

    const MyContract = web3.eth.contract([
	{
		"constant": false,
		"inputs": [
			{
				"name": "id",
				"type": "bytes32"
			},
			{
				"name": "netizenType",
				"type": "bytes32"
			},
			{
				"name": "village",
				"type": "bytes32"
			}
		],
		"name": "addNetizen",
		"outputs": [
			{
				"name": "success",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "getPath",
		"outputs": [
			{
				"name": "",
				"type": "address[]"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "name",
				"type": "bytes32"
			},
			{
				"name": "village",
				"type": "bytes32"
			}
		],
		"name": "addFarmer",
		"outputs": [
			{
				"name": "success",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "crop",
				"type": "string"
			},
			{
				"name": "to",
				"type": "address"
			}
		],
		"name": "sendCrop",
		"outputs": [
			{
				"name": "success",
				"type": "bool"
			}
		],
		"payable": true,
		"stateMutability": "payable",
		"type": "function"
	}
])
    this.state.contractInstance = MyContract.at("0x67f843b50abbb792a44d2ca543f6ce72a9f2a6fe");
  }

  componentDidMount() {
    window.sessionStorage.removeItem('farmers');
    window.sessionStorage.removeItem('netizens');
  }

  addFarmer() {
    const { farmerName, farmerVillage } = this.state;
    if (farmerName && farmerVillage) {
      this.state.contractInstance.addFarmer(farmerName, farmerVillage, (err, result) => {
        let farmers = JSON.parse(window.sessionStorage.getItem('farmers'));
        if (!farmers) farmers = {};
        farmers[result] = farmerName;
        window.sessionStorage.setItem('farmers', JSON.stringify(farmers));
        this.setState({farmerName: '', farmerVillage: ''});
        console.log("farmer added ", result);
      });
    }
  }

  addNetizen() {
    const { netizenId, netizenType, netizenVillage } = this.state;
    if (netizenId && netizenType && netizenVillage) {
      this.state.contractInstance.addNetizen(netizenId, netizenType, netizenVillage, (err, result) => {
        let netizens = JSON.parse(window.sessionStorage.getItem('netizens'));
        if (!netizens) netizens = {};
        netizens[result] = netizenId;
        window.sessionStorage.setItem('netizens', JSON.stringify(netizens));
        this.setState({netizenId: '', netizenType: '', netizenVillage: ''});
        console.log("Netizen added ", result);
      });
    }
  }

  tradeCrop(type) {
    const { cropName, sellTo, quantity } = this.state;
    if (type === 'sell') {
      if (cropName && sellTo) {
        this.state.contractInstance.sendCrop(cropName, sellTo, {
          from: web3.eth.accounts[0],
          value: web3.toWei(quantity/1000)
        }, (err, result) => {
          console.log("sendCrop result ", result);
          this.setState({sendStatus: result});
          this.state.contractInstance.getPath((err, result) => {
            console.log("path ", result);
          });
        })
      }
    }
  }

  render () {
    const netizens = JSON.parse(window.sessionStorage.getItem('netizens'));
    // console.log("netizens render ", netizens);

    return (
      <MuiThemeProvider theme={muiTheme}>
        <div className="main-container">
        <h3 className='app-title'>Vridhi Blockchain</h3>
          <div className="add-farmer">
            <h4>Add Farmer</h4>
            <Grid container spacing={8}>
              <Grid item lg={5} md={5} xs={12}>
                <TextField
                  label="Name"
                  name="farmerName"
                  fullWidth={true}
                  value={this.state.farmerName}
                  onChange={(e) => this.setState({farmerName: e.target.value})}
                />
              </Grid>
              <Grid item lg={5} md={5} xs={12}>
                <TextField
                  label="Village"
                  name="farmerVillage"
                  fullWidth={true}
                  value={this.state.farmerVillage}
                  onChange={(e) => this.setState({farmerVillage: e.target.value})}
                />
              </Grid>
              <Grid item lg={2} md={2} xs={12}>
                <Button
                  raised
                  color="primary"
                  onClick={() => this.addFarmer()}
                >Add Farmer</Button>
              </Grid>
            </Grid>
          </div>
          <div className="add-netizen">
            <h4>Add Netizen</h4>
            <Grid container spacing={8}>
              <Grid item lg={2} md={2} xs={12}>
                <TextField
                  label="ID"
                  name="netizenId"
                  fullWidth={true}
                  value={this.state.netizenId}
                  onChange={(e) => this.setState({netizenId: e.target.value})}
                />
              </Grid>
              <Grid item lg={4} md={4} xs={12}>
                <TextField
                  label="Type"
                  name="netizenType"
                  fullWidth={true}
                  value={this.state.netizenType}
                  onChange={(e) => this.setState({netizenType: e.target.value})}
                />
              </Grid>
              <Grid item lg={4} md={4} xs={12}>
                <TextField
                  label="Village"
                  name="netizenVillage"
                  fullWidth={true}
                  value={this.state.netizenVillage}
                  onChange={(e) => this.setState({netizenVillage: e.target.value})}
                />
              </Grid>
              <Grid item lg={2} md={2} xs={12}>
                <Button
                  raised
                  color="primary"
                  onClick={() => this.addNetizen()}
                >Add Netizen</Button>
              </Grid>
            </Grid>
          </div>
          <div className="send-crop">
            <h4>Trade Crop</h4>
            <Grid container spacing={8}>
              <Grid item lg={4} md={4} xs={12}>
                <TextField
                  label="Crop"
                  name="cropName"
                  fullWidth={true}
                  onChange={(e) => this.setState({cropName: e.target.value})}
                />
              </Grid>
              <Grid item lg={4} md={4} xs={12}>
                <FormControl style={{ width: '100%' }}>
                  <InputLabel htmlFor="select-input">
                    <span>Select Netizen</span>
                  </InputLabel>
                  <Select
                    value={this.state.sellTo}
                    onChange={event => this.setState({sellTo: event.target.value})}
                  >
                    {
                      netizens && Object.keys(netizens).map(address => (
                        <MenuItem
                          key={address}
                          value={address}
                        >
                          {netizens[address]}
                        </MenuItem>
                      ))
                    }
                  </Select>
                </FormControl>
              </Grid>
              <Grid item lg={2} md={2} xs={6}>
                <TextField
                  label="Quantity"
                  name="quantity"
                  fullWidth={true}
                  onChange={(e) => this.setState({quantity: e.target.value})}
                />
              </Grid>
              <Grid item lg={2} md={2} xs={6}>
                <Button
                  raised
                  color="primary"
                  onClick={() => this.tradeCrop('sell')}
                >Sell Crop</Button>
              </Grid>
            </Grid>
            <div>Transaction Address: {this.state.sendStatus}</div>
          </div>
        </div>
      </MuiThemeProvider>
    )
  }
}

ReactDOM.render(
 <App />,
 document.querySelector('#root')
)


// <Select
//   value={this.state.sellTo}
//   onChange={event => this.setState({sellTo: event.target.value})}
// >
//   {
//     netizens && Object.keys(netizens).map(address => (
//       <MenuItem
//         key={address}
//         value={address}
//       >
//         {netizens[address]}
//       </MenuItem>
//     ))
//   }
// </Select>
