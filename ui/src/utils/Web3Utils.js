/*jshint esversion: 6 */
const Web3 = require('web3');
const fs = require('fs');

export default function getWeb3Local() {
    const ganacheUrl = "http://localhost:8545";
    const web3Provider = new Web3.providers.HttpProvider(ganacheUrl);
    let web3local = new Web3(web3Provider);
    return web3local;
}


    /*********************************************************************/
    /**   Alternative code to web3 - using local config and JSON files  **/
    /*********************************************************************/

    /* getWalletAddressFromConfig() {
        this.setState( {walletContractAddress: this.walletContractAddress});
    }

    getContractABIFromJsonFile(file) {
        //  Dynamic loading of the contract ABI from filesystem - not yet implemented
        const contractJSON = JSON.parse(fs.readFileSync(file, 'utf8'));
        const abiString = JSON.stringify(file.abi);
        console.log(file.abi);
        const abi = contractAbi;
        this.setState({ walletContractABI: abi });
    }

    async createContract() {
        let web3Provider = new web3.providers.HttpProvider(this.state.ganacheUrl);
        const web3 = new web3(web3Provider);
        const contractInstance  = new web3.eth.Contract(contractAbi, walletContractAddress);
        let contractMethods = await contractInstance.methods;
        console.log('Contract Methods: ', contractMethods);
        this.setState( {contractInstance: contractInstance});
    } */
