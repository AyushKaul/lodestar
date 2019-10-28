import {number64} from "@chainsafe/eth2.0-types";
import {IConfigurationModule} from "../util/config";

export interface INetworkOptions {
  maxPeers: number64;
  //path to peerId file or hex encoded peerId
  peerId?: string;
  multiaddrs: string[];
  bootnodes: string[];
  rpcTimeout: number64;
  connectTimeout: number;
  disconnectTimeout: number;
}

export const NetworkOptions: IConfigurationModule = {
  name: "network",
  fields: [
    {
      name: "maxPeers",
      type: "number",
      configurable: true,
      process: (input) => {
        return parseInt(input);
      },
      cli: {
        flag: "maxPeers"
      }
    },
    {
      name: "bootnodes",
      type: [String],
      configurable: true,
      process: (input: string) => {
        return input.split(",").map((input) => input.trim());
      },
      cli: {
        flag: "bootnodes"
      }
    },
    {
      name: "multiaddrs",
      type: [String],
      configurable: true,
      process: (input: string) => {
        return input.split(",").map((input) => input.trim());
      },
      cli: {
        flag: "multiaddrs"
      }
    },
    {
      name: "peerId",
      type: String,
      configurable: true,
      cli: {
        flag: "peerId"
      }
    },
  ]
};

const config: INetworkOptions = {
  maxPeers: 25,
  multiaddrs: ["/ip4/127.0.0.1/tcp/30606"],
  bootnodes: [],
  peerId: null,
  rpcTimeout: 5000,
  connectTimeout: 3000,
  disconnectTimeout: 3000,
};

export default config;
