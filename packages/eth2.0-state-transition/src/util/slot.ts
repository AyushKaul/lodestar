import {IBeaconConfig} from "@chainsafe/eth2.0-config";
import {number64, Slot, Epoch} from "@chainsafe/eth2.0-types";
import {intDiv} from "@chainsafe/eth2.0-utils";
import {computeStartSlotAtEpoch, computeEpochAtSlot} from ".";

export function getCurrentSlot(config: IBeaconConfig, genesisTime: number64): Slot {
  const diffInSeconds = (Date.now() / 1000) - genesisTime;
  return intDiv(diffInSeconds, config.params.SECONDS_PER_SLOT);
}

export function computeSlotsSinceEpochStart(config: IBeaconConfig, slot: Slot, epoch?: Epoch): number {
  const computeEpoch = epoch? epoch : computeEpochAtSlot(config, slot);
  return slot - computeStartSlotAtEpoch(config, computeEpoch);
}