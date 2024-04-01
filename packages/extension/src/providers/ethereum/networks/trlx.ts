import { NetworkNames } from "@enkryptcom/types";
import { EvmNetwork, EvmNetworkOptions } from "../types/evm-network";
import { EtherscanActivity } from "../libs/activity-handlers";
import wrapActivityHandler from "@/libs/activity-state/wrap-activity-handler";

const rolluxTestOptions: EvmNetworkOptions = {
  name: NetworkNames.RolluxTest,
  name_long: "Syscoin ROLLUX Testnet",
  homePage: "https://www.rollux.com/",
  blockExplorerTX: "https://rollux.tanenbaum.io/tx/[[txHash]]",
  blockExplorerAddr: "https://rollux.tanenbaum.io/address/[[address]]",
  chainID: "0xdea8",
  isTestNetwork: false,
  currencyName: "TSYS",
  currencyNameLong: "Test Syscoin",
  node: "wss://rpc-tanenbaum.rollux.com/wss",
  icon: require("./icons/tsys_rollux.svg"),
  activityHandler: wrapActivityHandler(EtherscanActivity),
};

const rolluxTest = new EvmNetwork(rolluxTestOptions);

export default rolluxTest;
