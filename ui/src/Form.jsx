/*jshint esversion: 8 */
import React, { Component } from 'react';
import WalletContract from "./build/contracts/Wallet.json";
import DaiContract from "./build/contracts/Dai.json";
import getweb3Local from "./utils/Web3Utils";
import getweb3 from "./utils/getWeb3";
import MetaMaskOnboarding from '@metamask/onboarding'
const web3utils = require('./utils/Web3Utils');

export class Form extends Component {

    constructor(props) {
        super(props);

        this.state = {
            displayAccount: '',
            networkId: '',
            chainId: '',
            contract: null,
            balanceInEth: '0',
            storageValue: '',
            tempValue: '',
            setValue: '',
            walletContractInstance: '' ,
            web3: null,
            web3Local: null,
            accounts: null,
            walletContract: null,
            walletContractABI: '',
            walletContractAddress: '',
            amountEthStored: '',
            amountEthToDeposit: '',
            amountEthToTransfer: '',
            amountDai: '',
            fromAccount: '',
            toAccount: '',
            accountEthBalance: '',
            ganacheUrl: 'http://localhost:8545',
            txHashRef: '',
            resultRef: ''
        };

    }

    isMetaMaskInstalled = () => MetaMaskOnboarding.isMetaMaskInstalled()

    loadBlockchainData = async () => {

        const web3 = await getweb3();                         // Get network provider and web3 instance from Metamask
        //const web3 = await getweb3Local();                      // Get network provider and web3 instance from Ganache directly

        this.setState({ web3: web3 });

        const userAccounts = await web3.eth.getAccounts();    // Use web3 to get the user's accounts.
        const networkId = await web3.eth.net.getId();         // Get the contract instance.
        const chainId = await web3.eth.getChainId();

        console.log("networkId: ", networkId);
        console.log("chainId: ", chainId);
        console.log("User Accounts:" , userAccounts);

        // getEthBalance
        var balance = await web3.eth.getBalance(userAccounts[0]);
        const balanceInEth = web3.utils.fromWei(balance, 'ether');
        this.setState( { balanceInEth: balanceInEth.substring(0,8)});

        let displayAccount = userAccounts[0].substring(0,8);
        this.setState({ accounts: userAccounts });
        this.setState({ displayAccount: displayAccount });
        this.setState({ networkId: networkId });
        this.setState({ chainId: chainId });
    }

    //TODO - Move to common interface
    loadContractsFromBlockchain = async () => {
        const web3 = await this.state.web3;
        const deployedNetwork = WalletContract.networks[this.state.networkId];
        const WalletContractInstance = new web3.eth.Contract(WalletContract.abi, web3.utils.toChecksumAddress(deployedNetwork.address));
        console.log("WalletContract.abi = " , WalletContract.abi);
        console.log("deployedNetwork.address = " , web3.utils.toChecksumAddress(deployedNetwork.address));
        console.log("WalletContractInstance:" , WalletContractInstance);

        // Set contract to the state, and  proceed to interact with contract methods.
        this.setState({ walletContractInstance: WalletContractInstance});
    }


    componentDidMount = async () => {
        try {
          //const web3 = await getweb3();                     // Get network provider and web3 instance.
          await this.loadBlockchainData();
          let { web3, web3Local } = this.state;

          const accounts = await web3.eth.getAccounts();    // Use web3 to get the user's accounts.
          const networkId = await web3.eth.net.getId();     // Get the contract instance.
          const deployedNetwork = WalletContract.networks[networkId];
          // const walletInstance = new web3.eth.Contract(WalletContract.abi, deployedNetwork && deployedNetwork.address );
          const daiInstance = new web3.eth.Contract(DaiContract.abi, deployedNetwork && deployedNetwork.address )

          // Set web3, accounts, and contract to the state, and  proceed to interact with contract methods.
          this.setState({ accounts, daiContractInstance: daiInstance});
          this.fromAddressIndex = 0;                        // Account From: Default to index1
          this.toAddressIndex = 1;                          // Account To:   Default to index2


          this.setState( {walletContractABI: WalletContract.abi, walletContractAddress: deployedNetwork.address});
          await this.loadContractsFromBlockchain();
          this.getContractBalanceOfEther();

          console.log("Ethereum blockchain address: ", this.state.ganacheUrl);
          console.log("walletContract.networks: ", WalletContract.networks);
          console.log("this from account: ", this.state.accounts[0]);
          console.log("NetworkId: ", networkId);

          this.setState( { fromAccount: this.state.accounts[this.fromAddressIndex]})
          this.setState( { toAccount: this.state.accounts[this.toAddressIndex] ? this.state.accounts[this.toAddressIndex] : 0 })    // Check for case where no second account

          await this.getContractBalanceOfEther();

          /*********************************************************************************/
          // this.state.walletContractABI = contractAbi;   // Get the  abi from config.js
          // this.getWalletAddressFromConfig();      // Get address  from config.js
          // this.getContractABIFromJsonFile('../Wallet/build/contracts/Wallet.json');
          // this.createContract();                // Alternative to  react trufflebox method
          /*********************************************************************************/

        } catch (error) {
            alert(`Failed to load web3, accounts, or contract. Check console for details.`,);
            console.error(error);
        }
      };


    async loadBlockchainData() {
        // alternative to getweb3
        let web3 = this.state.web3;
        const accounts = await web3.eth.getAccounts();
        const balance = await web3.eth.getBalance(accounts[this.fromAddressIndex]);
        const balanceInEth = web3.utils.fromWei(balance, 'ether');
        this.setState({ fromAccount: accounts[this.fromAddressIndex],
                        toAccount: accounts[this.toAddressIndex],
                        accountEthBalance: balanceInEth});
        console.log('this.state', this.state);
    }


    async getContractBalanceOfEther() {
        let web3 = this.state.web3;
        const contractBalanceOfEther = await web3.eth.getBalance(this.state.walletContractAddress);
        const contractBalanceOfEtherFromWei = web3.utils.fromWei(contractBalanceOfEther, "ether");
        console.log('Wallet Contract Balance of Ether : ' + contractBalanceOfEtherFromWei + " ETH" );
        this.setState({ amountEthStored: contractBalanceOfEtherFromWei });
        return contractBalanceOfEtherFromWei;
    }


    /***************************************************************/
    /*                   TRANSFER FUNDS UTILITIES                  */
    /***************************************************************/

    handleChangeTransferAmount(event) {
        this.setState({ amountEthToTransfer: event.target.value });
    }

    transferFunds(event)    {

        event.preventDefault();
        const web3 = this.state.web3;
        const _from = this.state.fromAccount;
        const _to = this.state.toAccount;
        const _amount = this.state.amountEthToTransfer;
        console.log('transferring amount = ' + _amount + ' from account : ' + _from);

        let self = this;
        var txnObject = {
            "from":_from,
            "to": _to,
            "value": web3.utils.toWei(_amount.toString(),'ether'),
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
    /*                         STORAGE UTILITIES                   */
    /***************************************************************/

    handleChangeFrom(event) {
        this.setState({ fromAccount: event.target.value });
    }
    handleChangeTo(event) {
        this.setState({ toAccount: event.target.value });
    }


    // Use ES7 async / await for dealing with Promises in a more elegant way.
    incrementAmount = async(event) => {
        event.preventDefault();
        const { accounts, walletContractInstance } = this.state;

        var increment =  Number(this.state.tempValue);
        var storedValue = Number(this.state.storageValue);
        var value = storedValue+increment;

        await walletContractInstance.methods.setContractStorageBalance(value).send({ from: accounts[0] });
        // Get the value from the contract to prove it worked.
        const response = await walletContractInstance.methods.getContractStorageBalance().call();
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
        const { accounts, walletContractInstance } = this.state;
        var setValue = Number(this.state.setValue);

        // Always use arrow functions to avoid scoping and 'this' issues like having to use 'self'
        await walletContractInstance.methods.setContractStorageBalance(setValue).send({ from: accounts[0] })
        const response = await walletContractInstance.methods.getContractStorageBalance().call();
        // Update state with the result.
        this.setState({ storageValue: response });
    }


    getContractBalance = async(event) => {
        event.preventDefault();
        const { walletContractInstance } = this.state;
        console.log('walletContractInstance.methods = ', walletContractInstance.methods);
        const response = await walletContractInstance.methods.getContractStorageBalance().call();
        console.log('response = ', response);
    }

    incrementContractBalance = async(event) => {
        event.preventDefault();
        const { accounts, walletContractInstance } = this.state;
        await walletContractInstance.methods.setContractStorageBalance(1).send({ from: accounts[0] });

        // Get the value from the contract to prove it worked.
        const response = await walletContractInstance.methods.getContractStorageBalance().call();
        // Update state with the result.
        this.setState({ storageValue: response });
        console.log(' Stored value NOW = ' , response);
    }



    /**********************************************************************/
    /*                         DEPOSIT ETHER UTILITIES                    */
    /**********************************************************************/

    /** ETHER DEPOSIT FUNCTIONS **/
    handleChangeDepositEther(event) {
        event.preventDefault();
        var value = event.target.value;
        this.setState({ amountEthToDeposit: value });
    }

    depositEther = async(event) => {
        event.preventDefault();
        const { fromAccount, walletContractInstance } = this.state;
        const web3 = await this.state.web3;
        var amtEthValue = Number(this.state.amountEthToDeposit);

        console.log('amountEth: ' + await this.state.amountEthToDeposit );
        console.log('depositing to contract from address => ' + fromAccount + ' to address => ' + this.state.walletContractAddress);

        // We use arrow functions to avoid scoping and 'this' issues like having to use 'self' - in general favour .transfer() over .send()
        const depositResponse = await walletContractInstance.methods.deposit().send({ from:fromAccount,  "value": web3.utils.toWei(''+ amtEthValue,'ether') });
        console.log('depositResponse: ' + JSON.stringify(depositResponse) );

        // get updated balance
        await this.getContractBalanceOfEther();

    }



    /****************************************************/
    /*                DEPOSIT DAI UTILITIES             */
    /****************************************************/

    /** DAI Deposiit functions **/
    handleChangeDepositDAI = async(event) => {
        event.preventDefault();
        var value = event.target.value;
        this.setState({ amountDai: value });
    }

    handleSubmitDepositDAI = async (event) => {
        event.preventDefault();

        const { fromAccount, walletContractInstance } = this.state;
        var amtEthValue = Number(this.state.amountEth);

        console.log('amount DAI: ' + await this.state.amountDai );
        console.log('depositing DAI to contract from address => ' + fromAccount + ' to address => ' + this.state.walletContractAddress);

        /* await walletContractInstance.methods.setContractStorageBalance(value).send({ from: accounts[0] });
        // Get the value from the contract to prove it worked.
        const response = await walletContractInstance.methods.getContractStorageBalance().call();
         */

        const depositDAIResponse = await walletContractInstance.methods.save(10).send({ from: fromAccount, gas: 100000 });
        console.log('depositDAIResponse: ' + JSON.stringify(depositDAIResponse) );

       /*  const contractBalanceOfEther = await web3.eth.getBalance(this.state.walletContractAddress);
        const contractBalanceOfEtherFromWei = web3.utils.fromWei(contractBalanceOfEther, "ether");
        console.log('Wallet Contract Balance of Ether : ' + contractBalanceOfEtherFromWei + " ETH" ); */


//         this.state.contractInstance.methods.payMe(2.0).estimateGas({gas: 5000000}, function(error, gasAmount){
//             console.log(gasAmount);
//
//             if(gasAmount === 5000000)
//                 console.log('Method ran out of gas');
//         });
//
//         this.state.contractInstance.methods.payMe(2.0)
//             .send({from: '0xc2FC9C109d83c6B521211020525c442e4c2F7f69', gas: 50000},
//             function(error, transactionHash) {
//
//                 if(error){
//                     console.log( "Transaction error" ,error);
//                     //self.setState({ resultRef: "Transaction Failed!" });
//                 }
//                 else{
//                     //Get transaction hash
//                     console.log('Transaction Succeeded, Transaction Hash: ' +transactionHash);
//                 }
//             }
//         );
//
//         this.state.contractInstance.methods.getBalanceInEth('0x778f2614776fB677965d0E4eb1Ae9803C64bCd56').call()
//         .then(function(result) {
//             console.log("Balance is : " + JSON.stringify(result));
//         });
    }




    /***************************************************************/
    /*                         UI CODE                             */
    /***************************************************************/

    render() {
        const inputStyle = { padding: '5px', marginLeft: '30px', marginRight: '30px', width: '100px' };
        const inputStyleSmall = { padding: '5px', marginLeft: '30px', marginRight: '30px', width: '80px' };
        const accountsStyle = { fontSize: 16, marginBottom: '15px' };
        const depositsStyle = { fontSize: 18, marginBottom: '15px' };

        return (
            <div>
                <form>
                    <div className="row">
                        <div className="col-md-6">
                            <label htmlFor="name" className="col-lg-2 control-label"><h5>Transfer</h5></label>
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
                            Amount:<input style={inputStyleSmall} id="Amount" value={this.state.amountEthToTransfer} onChange={this.handleChangeTransferAmount.bind(this)} type="text"/>
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
                        <input style={inputStyleSmall} type="text" value={this.state.value}  onChange={this.handleChangeAmount.bind(this)}
                        placeholder="Amount ...">
                        </input>
                        <button id="Set Bal" onClick={this.incrementAmount.bind(this)}>Increment Amount</button>
                    </div>

                    <div style = {accountsStyle} className="row">
                        <label htmlFor="text">New Amount stored in Contract: </label>
                        <input style={inputStyleSmall} type="text" value={this.state.setValue}  onChange={this.handleSetAmount.bind(this)}
                        placeholder="Amount ...">
                        </input>
                        <button id="Set Bal" onClick={this.setAmount.bind(this)}>Set Amount</button>
                    </div>
                </form>

                <div style = {accountsStyle} className="row">
                    <div className="col-md-4">
                        <p style = {accountsStyle} > The stored value is now: {this.state.storageValue} </p>
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-6">
                        <label htmlFor="name" className="col-lg-2 control-label"><h5>Deposit</h5></label>
                    </div>
                </div>
                 <form>
                    <div style = {depositsStyle} className="row">
                       <label htmlFor="text">Deposit ETH: </label>
                        <input style={inputStyle} type="text" value={this.state.amountEth}  onChange={this.handleChangeDepositEther.bind(this)}
                        placeholder="Amount ...">
                        </input>
                        <button id="Set Bal" onClick={this.depositEther.bind(this)}>Deposit ETH</button>
                    </div>

                    <div style = {accountsStyle} className="row">
                        <div className="col-md-4">
                            <p style = {accountsStyle} > The stored ETH value is now: {this.state.amountEthStored} </p>
                        </div>
                    </div>
                </form>

                <form>
                    <div style = {depositsStyle} className="row">
                        <label > Deposit DAI:
                            <input style={inputStyle} type="text" value={this.state.value} onChange={this.handleChangeDepositDAI.bind(this)}
                             placeholder="Amount of Dai..."/>
                        </label>
                        <button id="Deposit" onClick={this.handleSubmitDepositDAI.bind(this)}>Deposit</button>
                    </div>
                    <div style = {accountsStyle} className="row">
                        <div className="col-md-4">
                            <p style = {accountsStyle} > The stored DAI value is now: {this.state.amountDai} </p>
                        </div>
                    </div>
                </form>

            </div>
        )
    }

}

export default Form
