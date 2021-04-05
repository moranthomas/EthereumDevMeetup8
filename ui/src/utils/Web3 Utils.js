/*jshint esversion: 6 */
const Web3 = require('web3');
const axios = require('axios');
const fs = require('fs');

export let infuraUrl = "https://mainnet.infura.io/v3/53dbf207e63c42e99cacb63c2d41ec4f";
export let ganacheUrl = "http://localhost:8545";
let web3Provider = new Web3.providers.HttpProvider(ganacheUrl);
let web3 = new Web3(web3Provider);

/* Get Current Average Gas Price */
export function getGasPrice() {
  web3.eth.getGasPrice().then(function(gasPrice) {
    console.log(`Average Gas Price in GWei: ${gasPrice / 1000000000}`);
  });
}

/* Convert ETH To USD */
export function getAddressBalance(address) {
    axios.get('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd')
    .then(response => {
      let ethPriceinUSD = response.data.ethereum.usd;
        web3.eth.getBalance(address).then(result => {
          let balanceinEther = web3.utils.fromWei(result, 'ether');
          console.log(` Balance in Ether: ${balanceinEther}`);
          console.log(` Balance in USD: ${balanceinEther * ethPriceinUSD}`);
      });
    })
    .catch(error => {
      console.log(error);
    }
  );
}

/* Get Contract ABI */
export function getContractABI(JsonFile) {
  const contractJSON = JSON.parse(fs.readFileSync(JsonFile, 'utf8'));
  const abiString = JSON.stringify(contractJSON.abi);
  return contractJSON.abi;
}
