/*jshint esversion: 8 */
import React, { Component } from 'react';
import Web3 from 'web3';
import WalletContract from "./build/contracts/Wallet.json";
//import { contractAbi, contractAddress } from './utils/config';
import getWeb3 from "./utils/getWeb3";

const web3utils = require('./utils/Web3 Utils');
const infuraUrl = "https://mainnet.infura.io/v3/53dbf207e63c42e99cacb63c2d41ec4f";
const ganacheUrl = "http://localhost:8545";

let web3Provider = new Web3.providers.HttpProvider(ganacheUrl);
var web3 = new Web3(web3Provider);

export class Form extends Component {

    constructor(props) {
        super(props);

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
            amountEth: '',
            ganacheUrl: '',
            txHashRef: '',
            resultRef: ''
        };

         // Redundant: constructor bindings
        //  this.handleChangeDepositDAI = this.handleChangeDepositDAI.bind(this);
        //  this.handleSubmitDepositDAI = this.handleSubmitDepositDAI.bind(this);

    }

    componentDidMount = async () => {
        try {


          const web3 = await getWeb3();                     // Get network provider and web3 instance.
          const accounts = await web3.eth.getAccounts();    // Use web3 to get the user's accounts.
          const networkId = await web3.eth.net.getId();     // Get the contract instance.
          const deployedNetwork = WalletContract.networks[networkId];
          const instance = new web3.eth.Contract(WalletContract.abi, deployedNetwork && deployedNetwork.address );

          // Set web3, accounts, and contract to the state, and  proceed to interact with contract methods.
          this.setState({ web3, accounts, contract: instance });
          this.fromAddressIndex = 1;                                // Account From: Default to index1
          this.toAddressIndex = 2;                                  // Account To: Default to index2
          console.log("Ethereum blockchain address: ", web3utils.ganacheUrl);
          console.log("NetworkId: ", networkId);

          /*********************************************************************************/
          this.loadBlockchainData();
          this.setState( {contractABI: WalletContract.abi});
          this.setState( {contractAddress: deployedNetwork.address});
          this.setState( {ganacheUrl: web3utils.ganacheUrl});

          // this.state.contractABI = contractAbi;          // Get the  abi from config.js
          // this.getWalletAddressFromConfig();             // Get address  from config.js
          // this.getContractABIFromJsonFile('../Wallet/build/contracts/Wallet.json');
          // this.createContract();                // Alternative to  react trufflebox method
          /*********************************************************************************/

        } catch (error) {
            alert(
                `Failed to load web3, accounts, or contract. Check console for details.`,
            );
            console.error(error);
        }
      };


    async loadBlockchainData() {

        // alternative to getWeb3
        let web3Provider = new Web3.providers.HttpProvider(this.state.ganacheUrl);
        const web3 = new Web3(web3Provider);
        const accounts = await web3.eth.getAccounts();
        const balance = await web3.eth.getBalance(accounts[this.fromAddressIndex]);
        const balanceInEth = web3.utils.fromWei(balance, 'ether');
        this.setState({ fromAccount: accounts[this.fromAddressIndex],
                        toAccount: accounts[this.toAddressIndex],
                        accountBalance: balanceInEth});
        console.log('this.state', this.state);
    }


    /***************************************************************/
    /** My alternative code for using local config and JSON files **/
    /***************************************************************/

    /* getWalletAddressFromConfig() {
        this.setState( {contractAddress: this.contractAddress});
    }

    getContractABIFromJsonFile(file) {
         *//*  Dynamic loading of the contract ABI from filesystem - not yet implemented *//*
         const contractJSON = JSON.parse(fs.readFileSync(file, 'utf8'));
        const abiString = JSON.stringify(file.abi);
        console.log(file.abi);
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
    } */

/***************************************************************/

    /* Storage interaction */
    getContractBalance = async(event) => {
        event.preventDefault();

        const { accounts, contract } = this.state;
        console.log('contract.methods = ', contract.methods);
        const response = await contract.methods.getContractBalance().call();
        console.log('response = ', response);
    }

    incrementContractBalance = async(event) => {
        event.preventDefault();
        const { accounts, contract } = this.state;

        var increment =  Number(this.state.tempValue);
        var storedValue = Number(this.state.storageValue);
        var value = storedValue+increment;

        await contract.methods.setContractBalance(1).send({ from: accounts[0] });

        // Get the value from the contract to prove it worked.
        const response = await contract.methods.getContractBalance().call();
        // Update state with the result.
        this.setState({ storageValue: response });

        console.log(' Stored value NOW = ' , response);
    }



    /***************************************************************/
    /*                         STORAGE UTILITIES                   */
    /***************************************************************/

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

    // Use ES7 async / await for dealing with Promises in a more elegant way.
    incrementAmount = async(event) => {
        event.preventDefault();
        const { accounts, contract } = this.state;

        var increment =  Number(this.state.tempValue);
        var storedValue = Number(this.state.storageValue);
        var value = storedValue+increment;

        await contract.methods.setContractBalance(value).send({ from: accounts[0] });
        // Get the value from the contract to prove it worked.
        const response = await contract.methods.getContractBalance().call();
        // Update state with the result.
        this.setState({ storageValue: response });
    }

    handleChangeAmount = async(event) => {
        event.preventDefault();
        var value = event.target.value;
        this.setState({ tempValue: value });
    }

    handleSetAmount = async(event) => {
        event.preventDefault();
        var value = event.target.value;
        this.setState({ setValue: value });
    }

    setAmount = async(event) => {
        event.preventDefault();
        const { accounts, contract } = this.state;
        var setValue = Number(this.state.setValue);

        // Always use arrow functions to avoid scoping and 'this' issues like having to use 'self'
        await contract.methods.setContractBalance(setValue).send({ from: accounts[0] })
        const response = await contract.methods.getContractBalance().call();
        // Update state with the result.
        this.setState({ storageValue: response });
    }




    /***************************************************************/
    /*                         TRANSFER UTILITIES                  */
    /***************************************************************/

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


    /***************************************************************/
    /*                         DEPOSIT UTILITIES                  */
    /***************************************************************/

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

    /** ETHER DEPOSIT FUNCTIONS **/
    handleDepositEther = async(event) => {
        event.preventDefault();
        var value = event.target.value;
        this.setState({ amountEth: value });
    }

     depositEther = async(event) => {
        event.preventDefault();
        const { accounts, contract } = this.state;
        var amtEthValue = Number(this.state.amountEth);
        console.log('here');

        // Always use arrow functions to avoid scoping and 'this' issues like having to use 'self'
        await contract.methods.deposit().send({ from: accounts[1] })
        const response = await contract.methods.getContractBalance().call();

        // Update state with the result.
        // this.setState({ storageValue: response });
    }





    /***************************************************************/
    /*                         UI CODE                             */
    /***************************************************************/

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
                    <div style = {accountsStyle} className="row">
                        <label htmlFor="text">New Amount ETH stored in Contract: </label>
                        <input style={inputStyle} type="text" value={this.state.amountEth}  onChange={this.handleSetAmount.bind(this)}
                        placeholder="Enter Amount ...">
                        </input>
                        <button id="Set Bal" onClick={this.depositEther.bind(this)}>Set Amount ETH</button>
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

                <form>
                    <div style = {accountsStyle} className="row">
                        <label htmlFor="text">Add Amount to Contract: </label>
                        <input style={inputStyle} type="text" value={this.state.value}  onChange={this.handleChangeAmount.bind(this)}
                        placeholder="Enter Amount ...">
                        </input>
                        <button id="Set Bal" onClick={this.incrementAmount.bind(this)}>Increment Amount</button>
                    </div>

                    <div style = {accountsStyle} className="row">
                        <label htmlFor="text">New Amount stored in Contract: </label>
                        <input style={inputStyle} type="text" value={this.state.setValue}  onChange={this.handleSetAmount.bind(this)}
                        placeholder="Enter Amount ...">
                        </input>
                        <button id="Set Bal" onClick={this.setAmount.bind(this)}>Set Amount</button>
                    </div>
                </form>

                <div style = {accountsStyle} className="row">
                    <div className="col-md-4">
                        <p style = {accountsStyle} > The stored value is now: {this.state.storageValue} </p>
                    </div>
                </div>

            </div>
        )
    }

}

export default Form
