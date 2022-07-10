import { Contract, ethers } from "ethers";
import "dotenv/config";
import * as ballotJson from "../../artifacts/contracts/Ballot.sol/Ballot.json";
// eslint-disable-next-line node/no-missing-import
import { Ballot } from "../../typechain";

async function main() {
  // set correct testnet
  const provider = ethers.providers.getDefaultProvider("ropsten");

  console.log(
    `Attaching ballot contract interface to address ${ballotJson.deploymentAddress}`
  );

  // create ballot contract object using address and provider
  const ballotContract: Ballot = new Contract(
    ballotJson.deploymentAddress,
    ballotJson.abi,
    provider
  ) as Ballot;

  // retrieve winner name and print to console
  const winner = await ballotContract.winnerName();
  console.log(`The winning proposal is ${ethers.utils.parseBytes32String(winner)}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
