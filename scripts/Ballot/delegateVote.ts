import { Contract, ethers } from "ethers";
import "dotenv/config";
import * as ballotJSON from "../../artifacts/contracts/Ballot.sol/Ballot.json";

import { Ballot } from "../../typechain";

const EXPOSED_KEY =
  "8da4ef21b864d2cc526dbdb2a120bd2874c36c9d0a1fb7f8c63d7f7a8b41de8f";

async function main() {
  // create wallet from env (chairperson of contract)
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY || EXPOSED_KEY);
  console.log(`Using address ${wallet.address}`);

  const provider = ethers.providers.getDefaultProvider("ropsten");
  const signer = wallet.connect(provider);

  const ballotAddress = ballotJSON.deploymentAddress;

  // get new address to delegate vote to
  if (process.argv.length < 3) throw new Error("Voter address missing");
  const voterAddress = process.argv[2];

  console.log(
    `Attaching ballot contract interface to address given: ${ballotAddress}`
  );

  // create Ballot contract object
  const ballotContract: Ballot = new Contract(
    ballotAddress,
    ballotJSON.abi,
    signer
  ) as Ballot;

  // give new address right to vote
  const chairpersonAddress = await ballotContract.chairperson();
  if (chairpersonAddress !== signer.address)
    throw new Error("Caller is not the chairperson for this contract");
  console.log(`Giving right to vote to ${voterAddress}`);
  const voteTx = await ballotContract.giveRightToVote(voterAddress);
  console.log("Awaiting confirmations");
  await voteTx.wait();
  console.log(`Right to vote given. Hash: ${voteTx.hash}`)

  // delegate vote from signer to new address
  console.log(`Delegating to ${voterAddress}`);
  const delTx = await ballotContract.delegate(voterAddress);
  console.log("Awaiting confirmations");
  await delTx.wait();
  console.log(`Vote delegated. Hash: ${delTx.hash}`)
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

