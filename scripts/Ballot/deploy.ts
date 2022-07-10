// imports -> ethers lib, dotenv, and contract data compiled to json
import { ethers } from "ethers";
import "dotenv/config";
import * as ballotJSON from "../../artifacts/contracts/Ballot.sol/Ballot.json";

const EXPOSED_KEY =
  "8da4ef21b864d2cc526dbdb2a120bd2874c36c9d0a1fb7f8c63d7f7a8b41de8f";

// helper function to deploy contract with string inputs from user in the CLI
function convertStringArrayToBytes32(array: string[]) {
  const bytes32Array = [];
  for (let index = 0; index < array.length; index++) {
    bytes32Array.push(ethers.utils.formatBytes32String(array[index]));
  }
  return bytes32Array;
}

async function main() {
  // we can attach the wallet to our private key, knowing we have it in the dotenv.
  // the exposed key is added to keep typescript happy (always returns a value)
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY || EXPOSED_KEY);
  console.log(`Using address ${wallet.address}`);

  const provider = ethers.providers.getDefaultProvider("ropsten");
  const signer = wallet.connect(provider);

  //.getBalance() returns of type BigNumber, we must parse this correctly to integrate w our scripts
  const balanceBigNumber = await signer.getBalance();
  const balance = Number(ethers.utils.formatEther(balanceBigNumber));

  console.log(`Wallet balance at ${wallet.address} is ${balance}`);

  // confirm wallet has enough ether to operate
  if (balance < 0.01) {
    throw new Error("The wallet provided does not have enough ether!");
  }

  console.log("Deploying Ballot Contract");

  // get proposals from node CLI arguments
  console.log("Proposals: ");
  const proposals = process.argv.slice(2);

  if (proposals.length < 2) {
    throw new Error("not enough proposals provided");
  }

  // display proposals
  proposals.forEach((proposal, index) => {
    console.log(`Proposal No. ${index + 1}: ${proposal}`);
  });

  // create contract factory with ethers, passing compiled json info as args
  const ballotFactory = new ethers.ContractFactory(
    ballotJSON.abi,
    ballotJSON.bytecode,
    signer
  );

  // use convertStringArray helper to deploy with args as Bytes32
  const ballotContract = await ballotFactory.deploy(
    convertStringArrayToBytes32(proposals)
  );

  console.log("Awaiting deployment confirmation...");

  await ballotContract.deployed();

  console.log("Completed");
  console.log(`Contract deployed at ${ballotContract.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
