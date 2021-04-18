const Wallet = artifacts.require("../contracts/Wallet.sol");
const utils = require("./testUtils.js");

contract("Wallet", (accounts) => {
    let contractInstance;

    beforeEach( async () => {
        contractInstance = await Wallet.new();
    });
    it("should have a zero balance for new contract", async () => {
        const result = await contractInstance.getContractBalance();
        assert.equal(result, 0);
        //assert.equal(result.logs[0].args.name,zombieNames[0]);
    });
});