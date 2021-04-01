/*jshint esversion: 8 */
import React, { Component } from 'react';
import Web3 from 'web3';
//import { contractJSON } from '../../Wallet/build/contracts/Wallet.json';
import { contractAbi, contractAddress } from './config';


export class Form extends Component {

    constructor(props) {

        super(props);
        // redundant
        this.handleChangeDepositDAI = this.handleChangeDepositDAI.bind(this);
        this.handleSubmitDepositDAI = this.handleSubmitDepositDAI.bind(this);

        this.state = {
            daiValue: '',
            fromAccount: '',
            toAccount: '',
            contractABI: '',
            contractAddress: '',
            contractInstance: '',
            accountBalance: '',
            amountEth: '1.0',
            ganacheUrl: 'http://localhost:7545',
            txHashRef: '',
            resultRef: ''
        };
    }

    componentWillMount() {
        this.fromAddressIndex = 1;
        this.toAddressIndex = 2;
        this.ganacheUrl = "http://localhost:7545";
        this.loadBlockchainData();
        //this.getContractABI('../../Wallet/build/contracts/Wallet.json');
        this.getContractAbiFromConfig();
        this.getWalletAddressFromConfig();
        this.createContract();
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



    async loadBlockchainData() {
        let web3Provider = new Web3.providers.HttpProvider(this.ganacheUrl);
        const web3 = new Web3(web3Provider);
        const accounts = await web3.eth.getAccounts();
        const balance = await web3.eth.getBalance(accounts[this.fromAddressIndex]);
        const balanceInEth = web3.utils.fromWei(balance, 'ether');

        this.setState({ fromAccount: accounts[this.fromAddressIndex], toAccount: accounts[this.toAddressIndex], accountBalance: balanceInEth});
    }

    getContractAbiFromConfig() {
        this.setState( {contractABI: contractAbi});     // destructured import from config.js
        console.log(this.state.contractABI);
    }

    getWalletAddressFromConfig() {
        this.setState( {contractAddress: this.contractAddress});
    }

    getContractABI(JsonFile) {
        //const contractJSON = JSON.parse(fs.readFileSync(JsonFile, 'utf8'));

        // console.log(this.contractABI);
        // console.log(this.state.contractABI);


        const abiString = JSON.stringify(JsonFile.abi);
        console.log(JsonFile.abi);
        const abi = contractAbi;
        this.setState({ contractABI: abi });
    }

    async createContract() {
        let web3Provider = new Web3.providers.HttpProvider(this.ganacheUrl);
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

    async handleSubmitDepositDAI(event) {
        event.preventDefault();
        console.log(this.state.contractInstance.methods);
        let result = this.state.contractInstance.methods.payMe.sendTransaction(this.state.toAccount, this.state.value);
        alert('This amount of DAI was deposited : ' + this.state.value);
    }

    render() {
        const inputStyle = { padding: '5px', marginLeft: '30px', marginRight: '30px' };
        const accountsStyle = { fontSize: 16, marginBottom: '15px' };

        return (
            <div>
                <form onSubmit={this.handleSubmitDepositDAI}>
                    <label > Deposit DAI:
                        <input style={inputStyle} type="text" value={this.state.value} onChange={this.handleChangeDepositDAI.bind(this)}
                         placeholder="Amount of Dai..."/>
                    </label>
                    <input type="submit" value="Submit" />
                    <p style = {accountsStyle} >Your account: {this.state.fromAccount.substring(0,13)}</p>
                    <p style = {accountsStyle} >Your account balance: {this.state.accountBalance} Eth </p>
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
