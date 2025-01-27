/**
 * @module network/gossip
 */

import {IGossipMessage, IGossipMessageValidator} from "../interface";
import {SignedBeaconBlock} from "@chainsafe/eth2.0-types";
import {Gossip, GossipHandlerFn} from "../gossip";
import {deserializeGossipMessage, getGossipTopic} from "../utils";
import {GossipEvent} from "../constants";
import {serialize} from "@chainsafe/ssz";

export function getIncomingBlockHandler(validator: IGossipMessageValidator): GossipHandlerFn {
  return async function handleIncomingBlock(this: Gossip, msg: IGossipMessage): Promise<void> {
    try {
      const signedBlock = deserializeGossipMessage<SignedBeaconBlock>(msg, this.config.types.SignedBeaconBlock);
      this.logger.verbose(`Incoming block at slot: ${signedBlock.message.slot}`);
      if (await validator.isValidIncomingBlock(signedBlock)) {
        this.emit(GossipEvent.BLOCK, signedBlock);
      }
    } catch (e) {
      this.logger.warn("Incoming block error", e);
    }
  };
}

export async function publishBlock(this: Gossip, signedBlock: SignedBeaconBlock): Promise<void> {
  await this.pubsub.publish(
    getGossipTopic(GossipEvent.BLOCK), serialize(this.config.types.SignedBeaconBlock, signedBlock)
  );
  this.logger.verbose(`Publishing block at slot: ${signedBlock.message.slot}`);
}
