import {config as mainnetConfig} from "@chainsafe/eth2.0-config/lib/presets/mainnet";
import {config as minimalConfig} from "@chainsafe/eth2.0-config/lib/presets/minimal";
import {IConfigurationModule} from "../util/config";


export const validatorClientCliConfiguration: IConfigurationModule = {
  name: "validator",
  fields: [
    {
      name: "db",
      fields: [
        {
          name: "name",
          type: String,
          configurable: true,
          cli: {
            flag: "validatorDb"
          }
        }
      ]
    },
    {
      name: "api",
      type: String,
      configurable: true,
      description: "Url to beacon node rest api",
      cli: {
        flag: "restApi"
      }
    },
    {
      name: "validatorKey",
      type: String,
      description: "Hex encoded private key or path to keystore",
      configurable: true,
      cli: {
        flag: "validatorKey"
      }
    },
    {
      name: "config",
      type: Object,
      description: "Either 'mainnet' or 'minimal'",
      process: (presetName: string) => {
        if(presetName === "minimal") {
          return minimalConfig;
        }
        return mainnetConfig;
      },
      configurable: true,
      cli: {
        flag: "chainConfig"
      }
    },
    {
      name: "logLevel",
      type: String,
      description: "One of available log levels",
      configurable: true,
      cli: {
        flag: "logLevel"
      }
    }
  ]
};
