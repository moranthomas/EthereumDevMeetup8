/*jshint esversion: 6 */
const Web3 = require('web3');
const fs = require('fs');

export default function getWeb3Local() {
    const ganacheUrl = "http://localhost:8545";
    const web3Provider = new Web3.providers.HttpProvider(ganacheUrl);
    let web3local = new Web3(web3Provider);
    return web3local;
}
