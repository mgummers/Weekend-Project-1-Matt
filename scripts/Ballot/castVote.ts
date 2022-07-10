import { Contract, ethers } from "ethers";
import "dotenv/config";
import * as ballotJSON from "../../artifacts/contracts/Ballot.sol/Ballot.json";

import { Ballot } from "../../typechain";

const EXPOSED_KEY =
  "8da4ef21b864d2cc526dbdb2a120bd2874c36c9d0a1fb7f8c63d7f7a8b41de8f";

async function main() {
  // copy of wallet setup from deploy.ts
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY || EXPOSED_KEY);
  console.log(`Using address ${wallet.address}`);

  const provider = ethers.providers.getDefaultProvider("ropsten");
  const signer = wallet.connect(provider);

  const ballotAddress = ballotJSON.deploymentAddress;

  console.log(
    `Attaching ballot contract interface to address given: ${ballotAddress}`
  );

  const ballotContract: Ballot = new Contract(
    ballotAddress,
    ballotJSON.abi,
    signer
  ) as Ballot;

  console.log("Voting....");
  //   vote for proposal 1
  await ballotContract.vote(2);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
