import Web3 from 'Web3';

/* Get Current Average Gas Price */
export function getGasPrice() {
  Web3.eth.getGasPrice().then(function(gasPrice) {
    console.log(`Average Gas Price in GWei: ${gasPrice / 1000000000}`);
  });
}

/* Convert ETH To USD */
export function getAddressBalance(address) {
    axios.get('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd')
    .then(response => {
      let ethPriceinUSD = response.data.ethereum.usd;
        Web3.eth.getBalance(address).then(result => {
          let balanceinEther = Web3.utils.fromWei(result, 'ether');
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