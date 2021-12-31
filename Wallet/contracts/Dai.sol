pragma solidity  >=0.6.0 <0.9.0;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract Dai is ERC20 {
   constructor() public ERC20('Dai Stablecoin', 'DAI') {}

   function faucet(address recipient, uint amount) external {
      _mint(recipient, amount);
   }
}