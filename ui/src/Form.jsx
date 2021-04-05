/*jshint esversion: 8 */
import React, { Component } from 'react';
import Web3 from 'web3';
import WalletContract from "./build/contracts/Wallet.json";
import { contractAbi, contractAddress } from './config';
import getWeb3 from "./getWeb3";

const web3utils = require('./utils/Web3 Utils');
//const infuraUrl = "https://mainnet.infura.io/v3/53dbf207e63c42e99cacb63c2d41ec4f";
const ganacheUrl = "http://localhost:8545";

let web3Provider = new Web3.providers.HttpProvider(ganacheUrl);
var web3 = new Web3(web3Provider);


export class Form extends Component {

    constructor(props) {

        super(props);

        //  redundant: constructor bindings
        //  this.handleChangeDepositDAI = this.handleChangeDepositDAI.bind(this);
        //  this.handleSubmitDepositDAI = this.handleSubmitDepositDAI.bind(this);

        this.state = {
            storageValue: '',
            tempValue: '',
            setValue: '',
            web3: null,
            accounts: null,
            contract: null,

            daiValue: '',
            fromAccount: '',
            toAccount: '',
            contractABI: '',
            contractAddress: '',
            contractInstance: '',
            accountBalance: '',
            amountEth: '1.0',
            ganacheUrl: '',
            txHashRef: '',
            resultRef: ''
        };
    }

    componentDidMount = async () => {
        try {

          console.log(web3utils.ganacheUrl);

          const web3 = await getWeb3();                     // Get network provider and web3 instance.
          const accounts = await web3.eth.getAccounts();    // Use web3 to get the user's accounts.
          const networkId = await web3.eth.net.getId(); // Get the contract instance.
          console.log("networkId: ", networkId);

          const deployedNetwork = WalletContract.networks[networkId];
          const instance = new web3.eth.Contract(WalletContract.abi,
            deployedNetwork && deployedNetwork.address,
          );

          console.log("Accounts:" , accounts);
          // Set web3, accounts, and contract to the state, and then proceed to interact with the contract's methods.
          this.setState({ web3, accounts, contract: instance }, this.runExample);


          /**  **  **  **  **  **  **  **  **  **  **  **  **  **  **  **  **  **  **  ** **/
          this.setState( {contractABI: this.contractAbi});
          this.setState( {contractAddress: this.contractAddress});
          //this.state.contractABI = contractAbi;           // Get the contract abi from the destructured import of config.js
          this.fromAddressIndex = 1;                      // Default to index1
          this.toAddressIndex = 2;                        // Default to index2
          this.loadBlockchainData();
          this.getWalletAddressFromConfig();
          this.createContract();
          this.setState( {ganacheUrl: 'http://localhost:7545'});
          //this.getContractABI('../../Wallet/build/contracts/Wallet.json');

        } catch (error) {
            alert(
                `Failed to load web3, accounts, or contract. Check console for details.`,
            );
            console.error(error);
        }
      };


    async loadBlockchainData() {
        console.log(this.state);
        let web3Provider = new Web3.providers.HttpProvider(this.state.ganacheUrl);
        const web3 = new Web3(web3Provider);
        const accounts = await web3.eth.getAccounts();
        const balance = await web3.eth.getBalance(accounts[this.fromAddressIndex]);
        const balanceInEth = web3.utils.fromWei(balance, 'ether');

        this.setState({ fromAccount: accounts[this.fromAddressIndex], toAccount: accounts[this.toAddressIndex], accountBalance: balanceInEth});
    }


    getWalletAddressFromConfig() {
        this.setState( {contractAddress: this.contractAddress});
    }

    getContractABI(JsonFile) {
        /*  Dynamic loading of the contract ABI from filesystem - not yet implemented */
        // const contractJSON = JSON.parse(fs.readFileSync(JsonFile, 'utf8'));
        //const abiString = JSON.stringify(JsonFile.abi);
        console.log(JsonFile.abi);
        const abi = contractAbi;
        this.setState({ contractABI: abi });
    }

    async createContract() {
        let web3Provider = new Web3.providers.HttpProvider(this.state.ganacheUrl);
        const web3 = new Web3(web3Provider);
        const contractInstance  = new web3.eth.Contract(contractAbi, contractAddress);
        let contractMethods = await contractInstance.methods;
        console.log('Contract Methods: ', contractMethods);
        this.setState( {contractInstance: contractInstance});
    }


    handleChangeAmount(event) {
        this.setState({ amount: event.target.value });
    }

    handleChangeFrom(event) {
        this.setState({ fromAccount: event.target.value });
    }
    handleChangeTo(event) {
        this.setState({ toAccount: event.target.value });
    }


    handleSubmitAmount(event) {
        alert(`Amt submiited: ${this.state.amount}`);
        event.preventDefault();
    }

    handleChangeDepositDAI(event) {
        this.setState({value: event.target.value});
    }

    handleSubmitDepositDAI(event) {
        event.preventDefault();
        //let web3Provider = new Web3.providers.HttpProvider(this.state.ganacheUrl);
        //const web3 = new Web3(web3Provider);

        this.state.contractInstance.methods.payMe(2.0).estimateGas({gas: 5000000}, function(error, gasAmount){
            console.log(gasAmount);

            if(gasAmount === 5000000)
                console.log('Method ran out of gas');
        });


        this.state.contractInstance.methods.payMe(2.0)
            .send({from: '0xc2FC9C109d83c6B521211020525c442e4c2F7f69', gas: 50000},
            function(error, transactionHash) {

                if(error){
                    console.log( "Transaction error" ,error);
                    //self.setState({ resultRef: "Transaction Failed!" });
                }
                else{
                    //Get transaction hash
                    console.log('Transaction Succeeded, Transaction Hash: ' +transactionHash);
                }
            }
        );

        this.state.contractInstance.methods.getBalanceInEth('0x778f2614776fB677965d0E4eb1Ae9803C64bCd56').call()
        .then(function(result) {
            console.log("Balance is : " + JSON.stringify(result));
        });

    }

    getContractBalance(event) {
        event.preventDefault();
        this.state.contractInstance.methods.getContractBalance().call()
        .then(function(result) {
            console.log("Balance is : " + JSON.stringify(result));
        });
    }

    setContractBalance(event) {
        event.preventDefault();
        this.state.contractInstance.methods.setBalance(1).call()
        .then(function(result) {
            console.log("Successfully incremented balance : " + JSON.stringify(result));
        });
    }


    transferFunds(event)    {

        event.preventDefault();
        console.log('transferring!');

        let web3Provider = new Web3.providers.HttpProvider(this.state.ganacheUrl);
        const web3 = new Web3(web3Provider);

        console.log(web3.eth);

        const _from = this.state.fromAccount;
        const _to = this.state.toAccount;
        const _amount = this.state.amountEth;
        let self = this;
        var txnObject = {
            "from":_from,
            "to": _to,
            "value": Web3.utils.toWei(_amount,'ether'),
            "gas": 21000,          //(optional == gasLimit)
            // "gasPrice": 4500000,  (optional)
            // "data": 'For testing' (optional)
            // "nonce": 10           (optional)
        };

        web3.eth.sendTransaction(txnObject, function(error, result){
            if(error){
                console.log( "Transaction error" ,error);
                self.setState({ resultRef: "Transaction Failed!" });
            }
            else{
                //Get transaction hash
                console.log('Transaction Succeeded, Transaction Hash: ' +result);
                self.setState({ txHashRef: result });
                self.setState({ resultRef: "Transaction Succeeded!" });
            }
        });
    }



    render() {
        const inputStyle = { padding: '5px', marginLeft: '30px', marginRight: '30px' };
        const accountsStyle = { fontSize: 16, marginBottom: '15px' };

        return (
            <div>
                <form>
                    <label > Deposit DAI:
                        <input style={inputStyle} type="text" value={this.state.value} onChange={this.handleChangeDepositDAI.bind(this)}
                         placeholder="Amount of Dai..."/>
                    </label>
                    <button id="Deposit" onClick={this.handleSubmitDepositDAI.bind(this)}>Deposit</button>
                    <p style = {accountsStyle} >Your account: {this.state.fromAccount.substring(0,13)}</p>
                    <p style = {accountsStyle} >Your account balance: {this.state.accountBalance} Eth </p>

                    <button id="Get Bal" onClick={this.getContractBalance.bind(this)}>Get Bal</button>
                    <button id="Set Bal" onClick={this.setContractBalance.bind(this)}>Increment Bal</button>
                </form>


                {/* <form onSubmit={this.submitAmount}>
                    <div className="form-control">
                        <label htmlFor="text">Add Amount </label>
                        <input style={inputStyle} type="text" value={this.amount}
                            onChange={(e) => this.submitAmount(e.target.value)}
                            placeholder="Enter Amount ...">
                        </input>
                        <input type="submit" value="Submit" />
                    </div>
                </form> */}

                <form onSubmit={this.handleSubmitAmount.bind(this)}>
                    <div className="form-control">
                        <label htmlFor="text">Add Ether: </label>
                        <input style={inputStyle} type="text" value={this.state.amountEth} onChange={this.handleChangeAmount.bind(this)}
                        placeholder="Enter Amount ...">
                        </input>
                        <input type="submit" value="Submit" />
                    </div>
                </form>

                <form>
                    <div className="row">
                        <div className="col-md-6">
                            <label htmlFor="name" className="col-lg-2 control-label"><h4>Transfer</h4></label>
                        </div>
                    </div>
                    <div style = {accountsStyle} className="row">
                        <div className="col-md-12">
                            From: <input style={inputStyle} value={this.state.fromAccount} id="From" onChange={this.handleChangeFrom.bind(this)} type="text" />
                            To: <input style={inputStyle} value={this.state.toAccount} id="To" onChange={this.handleChangeTo.bind(this)} type="text" />
                        </div>
                    </div>

                    <div style = {accountsStyle} className="row">
                        <div className="col-md-6">
                            Amount:<input style={inputStyle} id="Amount" value={this.state.amountEth} onChange={this.handleChangeAmount.bind(this)} type="text"/>
                            <button id="Transfer" onClick={this.transferFunds.bind(this)}>Transfer</button>
                        </div>
                    </div>
                    <div style = {accountsStyle} className="row">
                        <div className="col-md-4">
                            <p style = {accountsStyle} >Transaction Hash: {this.state.txHashRef} </p>
                        </div>
                    </div>
                    <div style = {accountsStyle} className="row">
                        <div className="col-md-4">
                            <p style = {accountsStyle} >Result: {this.state.resultRef} </p>
                        </div>
                    </div>
                </form>

            </div>
        )
    }
}

export default Form
