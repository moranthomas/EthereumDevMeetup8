/*jshint esversion: 8 */
import React, { Component } from 'react';
import Web3 from 'web3';
//import { contractJSON } from '../../Wallet/build/contracts/Wallet.json';
import { contractAbi, contractAddress } from './config';


export class Form extends Component {

    componentWillMount() {
        this.addressIndex = 2;
        this.ganacheUrl = "http://localhost:7545";
        this.loadBlockchainData();
        //this.getContractABI('../../Wallet/build/contracts/Wallet.json');
        this.getContractAbiFromConfig();
        this.getWalletAddressFromConfig();

    }

    constructor(props) {
        super(props);
        this.state = {value: ''};

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);

        this.state = {
            account: '',
            contractABI: '',
            contractAddress: '',
            contractInstance: '',
            accountBalance: '',
        };
    }

    handleChange(event) {
        this.setState({value: event.target.value});
    }

    handleSubmit(event) {
        event.preventDefault();
        this.createContract();
        let result = this.state.contractInstance.payMe.sendTransaction(this.state.account, this.state.value);
        alert('This amount of DAI was deposited : ' + this.state.value);

    }

    transferFunds(event)    {

        console.log('transferring!');

        /* Sending ether directly from one address to another
        var txnObject = {
            "from":"0x9b7421fC327E1B5123Ff9aDDD4B21d44557a3a13",
            "to":"0x36c67ACAB3FA24b3Fd100437786F1314FD860921",
            "value": web3.utils.toWei(1, 'ether'),
            "gas":4712388,
            gasPrice: 100000000000
        };
        web3.eth.sendTransaction(txnObject, function(error, result){console.log('transaction sent : ' + result);});
        */

        const _from = "0x7b1982A914452a38163714ab9C3671928C863a1D";
        const _to = "0x8Ad3Ea4FE47557784BD1003864876FbC7d3ec879";
        const _amount = "10";
        let self = this;
        var txnObject = {
            "from":_from,
            "to": _to,
            "value": Web3.utils.toWei(_amount,'ether'),
            "gas": 21000,         //(optional)
            // "gasPrice": 4500000,  (optional)
            // "data": 'For testing' (optional)
            // "nonce": 10           (optional)
        };

        Web3.eth.sendTransaction(txnObject, function(error, result){
            if(error){
                console.log( "Transaction error" ,error);
                self.$refs.resultRef.value = "Transaction Failed";
            }
            else{
                //Get transaction hash
                self.$refs.txHashRef.value = result;
                self.$refs.resultRef.value = "Transaction Succeeded!";
            }
        });
    }



    async loadBlockchainData() {
        console.log(this.addressIndex);
        let web3Provider = new Web3.providers.HttpProvider(this.ganacheUrl);
        const web3 = new Web3(web3Provider);
        const accounts = await web3.eth.getAccounts();
        const balance = await web3.eth.getBalance(accounts[this.addressIndex]);
        const balanceInEth = web3.utils.fromWei(balance, 'ether');
        console.log(accounts);
        console.log(balance);
        this.setState({ account: accounts[4], accountBalance: balanceInEth});
    }

    getContractAbiFromConfig() {
        this.setState( {contractAbi: this.contractABI});
    }

    getWalletAddressFromConfig() {
        this.setState( {contractAddress: this.contractAddress});
    }

    getContractABI(JsonFile) {
        //const contractJSON = JSON.parse(fs.readFileSync(JsonFile, 'utf8'));
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
        console.log(contractMethods);
        this.setState( {contractInstance: contractInstance});
    }


    render() {
        const inputStyle = { padding: '5px', margin: '30px' };
        const accountsStyle = { fontSize: 16 };

        return (
            <div>
            <form onSubmit={this.handleSubmit}>
                <label > Deposit DAI:
                    <input style={inputStyle} type="text" value={this.state.value} onChange={this.handleChange} />
                </label>
                <input type="submit" value="Submit" />
                <p style = {accountsStyle} >Your account: {this.state.account.substring(0,13)}</p>
                <p style = {accountsStyle} >Your account balance: {this.state.accountBalance} Eth </p>
            </form>

            <div>
            <div class="row">
                <div class="col-md-6">
                    <label for="name" class="col-lg-2 control-label"><h4>Transfer</h4></label>
                </div>
                <div class="col-md-6">
                   <p>&nbsp;</p>
                </div>
            </div>
            <div class="row">
                <div class="col-md-12">
                     <p>From: <input ref="fromRef" id="From" type="text" /> </p>
                </div>
            </div>
            <div class="row">
                 <div class="col-md-12">
                    <p>To:<input id="To" ref="toRef" type="text" /> </p>
                </div>
            </div>
              <div class="row">
                 <div class="col-md-6">
                   <p>Amount:<input id="Amount" ref="amountRef" type="text"/></p>
                </div>
                <div class="col-md-6">
                    <button id="Transfer" onClick={this.transferFunds}>Transfer</button>
                </div>
            </div>
            <div class="row">
                <div class="col-md-4">
                    <p>Transaction Hash : </p>
                </div>
                <div class="col-md-8">
                    <input id="Tx" ref="txHashRef" type="text" />
                </div>
            </div>
                        <div class="row">
                <div class="col-md-4">
                    <p>Result : </p>
                </div>
                <div class="col-md-8">
                    <input disabled ref="resultRef" id="Result" type="text" />
                </div>
            </div>

        </div>

            </div>
        )
    }
}

export default Form
