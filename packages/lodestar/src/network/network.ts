/**
 * @module network
 */

import {EventEmitter} from "events";
import {promisify} from "es6-promisify";
import LibP2p from "libp2p";
import PeerInfo from "peer-info";
import {IBeaconConfig} from "@chainsafe/eth2.0-config";

import {ILogger} from "../logger";
import {IBeaconMetrics} from "../metrics";

import {ReqResp} from "./reqResp";
import {Gossip} from "./gossip";
import {INetworkOptions} from "./options";
import {INetwork, NetworkEventEmitter,} from "./interface";

interface ILibp2pModules {
  config: IBeaconConfig;
  libp2p: LibP2p;
  logger: ILogger;
  metrics: IBeaconMetrics;
}


export class Libp2pNetwork extends (EventEmitter as { new(): NetworkEventEmitter }) implements INetwork {
  public peerInfo: PeerInfo;
  public reqResp: ReqResp;
  public gossip: Gossip;
  private opts: INetworkOptions;
  private config: IBeaconConfig;
  private libp2p: LibP2p;
  private inited: Promise<void>;
  private logger: ILogger;
  private metrics: IBeaconMetrics;

  public constructor(opts: INetworkOptions, {config, libp2p, logger, metrics}: ILibp2pModules) {
    super();
    this.opts = opts;
    this.config = config;
    this.logger = logger;
    this.metrics = metrics;
    // `libp2p` can be a promise as well as a libp2p object
    const init = this.init;
    this.inited = new Promise((resolve) => {
      Promise.resolve(libp2p).then((libp2p) => {
        init(libp2p);
        resolve();
      } );
    });
  }

  public async start(): Promise<void> {
    await this.inited;
    await promisify(this.libp2p.start.bind(this.libp2p))();
    await this.reqResp.start();
    await this.gossip.start();
    this.libp2p.on("peer:connect", this.emitPeerConnect);
    this.libp2p.on("peer:disconnect", this.emitPeerDisconnect);
    this.logger.important(`PeerId ${this.libp2p.peerInfo.id.toB58String()}`);
  }
  public async stop(): Promise<void> {
    await this.inited;
    await this.gossip.stop();
    await this.reqResp.stop();
    await promisify(this.libp2p.stop.bind(this.libp2p))();
    this.libp2p.removeListener("peer:connect", this.emitPeerConnect);
    this.libp2p.removeListener("peer:disconnect", this.emitPeerDisconnect);
  }

  public getPeers(): PeerInfo[] {
    return this.libp2p.peerBook.getAllArray().filter((peerInfo) => peerInfo.isConnected());
  }
  public hasPeer(peerInfo: PeerInfo): boolean {
    const peer = this.libp2p.peerBook.get(peerInfo);
    if (!peer) {
      return false;
    }
    return Boolean(peer.isConnected());
  }
  public async connect(peerInfo: PeerInfo): Promise<void> {
    await promisify<void, PeerInfo>(this.libp2p.dial.bind(this.libp2p))(peerInfo);
  }
  public async disconnect(peerInfo: PeerInfo): Promise<void> {
    await promisify<void, PeerInfo>(this.libp2p.hangUp.bind(this.libp2p))(peerInfo);
  }

  private init = (libp2p: LibP2p): void => {
    this.peerInfo = libp2p.peerInfo;
    this.libp2p = libp2p;
    this.reqResp = new ReqResp(this.opts, {config: this.config, libp2p, logger: this.logger});
    this.gossip = new Gossip(this.opts, {config: this.config, libp2p, logger: this.logger});
  };

  private emitPeerConnect = (peerInfo: PeerInfo): void => {
    this.logger.verbose("peer connected " + peerInfo.id.toB58String());
    this.metrics.peers.inc();
    this.emit("peer:connect", peerInfo);
  };

  private emitPeerDisconnect = (peerInfo: PeerInfo): void => {
    this.logger.verbose("peer disconnected " + peerInfo.id.toB58String());
    this.metrics.peers.dec();
    this.emit("peer:disconnect", peerInfo);
  };

}
