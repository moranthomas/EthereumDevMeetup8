/*jshint esversion: 8 */
import React, { Component } from 'react';
import Web3 from 'web3';
//import { contractJSON } from '../../Wallet/build/contracts/Wallet.json';
import { contractAbi, contractAddress } from './config';


export class Form extends Component {


    componentWillMount() {
        this.addressIndex = 1;
        this.ganacheUrl = "http://localhost:7545";
        this.loadBlockchainData();
        //this.getContractABI('../../Wallet/build/contracts/Wallet.json');
        this.getContractAbiFromConfig();
        this.getWalletAddressFromConfig();
        this.createContract();
    }

    constructor(props) {
        super(props);
        this.state = {value: ''};

        this.handleChangeDepositDAI = this.handleChangeDepositDAI.bind(this);
        this.handleSubmitDepositDAI = this.handleSubmitDepositDAI.bind(this);

        this.state = {
            account: '',
            contractABI: '',
            contractAddress: '',
            contractInstance: '',
            accountBalance: '',
            amount: '',
        };
    }


    async transferFunds(event)    {

        event.preventDefault();
        console.log('transferring!');

        let web3Provider = new Web3.providers.HttpProvider(this.ganacheUrl);
        const web3 = new Web3(web3Provider);

        console.log(web3);
        console.log(web3.eth);

        const _from = "0x7b1982A914452a38163714ab9C3671928C863a1D";
        const _to = "0x8Ad3Ea4FE47557784BD1003864876FbC7d3ec879";
        const _amount = "10";
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

        web3.eth.sendTransaction(txnObject, function(error, result) {console.log('done'); });

        // web3.eth.sendTransaction(txnObject, function(error, result){
        //     if(error){
        //         console.log( "Transaction error" ,error);
        //         this.resultRef.value = "Transaction Failed";
        //     }
        //     else{
        //         //Get transaction hash
        //         this.txHashRef.value = result;
        //         this.resultRef.value = "Transaction Succeeded!";
        //     }
        // });
    }



    async loadBlockchainData() {
        let web3Provider = new Web3.providers.HttpProvider(this.ganacheUrl);
        const web3 = new Web3(web3Provider);
        const accounts = await web3.eth.getAccounts();
        const balance = await web3.eth.getBalance(accounts[this.addressIndex]);
        const balanceInEth = web3.utils.fromWei(balance, 'ether');

        this.setState({ account: accounts[this.addressIndex], accountBalance: balanceInEth});
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


    handleChangeAmount(event) {
        this.setState({ amount: event.target.value });
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
        // console.log(this.web3);
        console.log(this.state.contractInstance.methods);
        let result = this.state.contractInstance.methods.payMe.sendTransaction(this.state.account, this.state.value);
        alert('This amount of DAI was deposited : ' + this.state.value);
    }

    render() {
        const inputStyle = { padding: '5px', marginLeft: '30px', marginRight: '30px' };
        const accountsStyle = { fontSize: 16, marginBottom: '15px' };

        return (
            <div>
                <form onSubmit={this.handleSubmitDepositDAI}>
                    <label > Deposit DAI:
                        <input style={inputStyle} type="text" value={this.state.value} onChange={this.handleChangeDepositDAI} />
                    </label>
                    <input type="submit" value="Submit" />
                    <p style = {accountsStyle} >Your account: {this.state.account.substring(0,13)}</p>
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
                        <label htmlFor="text">Add Amount </label>
                        <input style={inputStyle} type="text" value={this.state.amount}
                        onChange={this.handleChangeAmount.bind(this)}
                        placeholder="Enter Amount ...">
                        </input>
                        <input type="submit" value="Submit" />
                    </div>
                </form>

                <form>
                    <div class="row">
                        <div class="col-md-6">
                            <label for="name" class="col-lg-2 control-label"><h4>Transfer</h4></label>
                        </div>
                    </div>
                    <div style = {accountsStyle} class="row">
                        <div class="col-md-12">
                            From: <input style={inputStyle} ref="fromRef" id="From" type="text" />
                            To:<input style={inputStyle} id="To" ref="toRef" type="text" />
                        </div>
                    </div>

                    <div style = {accountsStyle} class="row">
                        <div class="col-md-6">
                            Amount:<input style={inputStyle} id="Amount" ref="amountRef" type="text"/>
                            <button id="Transfer" onClick={this.transferFunds}>Transfer</button>
                        </div>
                    </div>
                    <div style = {accountsStyle} class="row">
                        <div class="col-md-4">
                            <p>Transaction Hash :  <input style={inputStyle} id="Tx" ref="txHashRef" type="text" />
                            </p>
                        </div>
                    </div>
                    <div style = {accountsStyle} class="row">
                        <div class="col-md-4">
                            <p>Result : <input style={inputStyle} disabled ref="resultRef" id="Result" type="text" />
                            </p>
                        </div>
                    </div>
                </form>

            </div>
        )
    }
}

export default Form
