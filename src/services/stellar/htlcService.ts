import * as StellarSdk from "stellar-sdk";
import { getStellarServer, getNetworkPassphrase } from "../../config/stellar";

export interface HtlcLockParams {
  senderAddress: string;
  receiverAddress: string;
  tokenAddress: string;
  amount: string;
  hashlock: string;
  timelock: number;
  contractId: string;
}

export interface HtlcClaimParams {
  claimerAddress: string;
  preimage: string;
  contractId: string;
}

export class HtlcService {
  private server: StellarSdk.Horizon.Server;

  constructor() {
    this.server = getStellarServer();
  }

  async buildLockTx(params: HtlcLockParams): Promise<StellarSdk.Transaction> {
    const senderAccount = await this.server.loadAccount(params.senderAddress);

    const contract = new StellarSdk.Contract(params.contractId);
    const tx = new StellarSdk.TransactionBuilder(senderAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: getNetworkPassphrase(),
    })
      .addOperation(
        contract.call(
          "initialize",
          StellarSdk.nativeToScVal(params.senderAddress, { type: "address" }),
          StellarSdk.nativeToScVal(params.receiverAddress, { type: "address" }),
          StellarSdk.nativeToScVal(params.tokenAddress, { type: "address" }),
          StellarSdk.nativeToScVal(BigInt(params.amount), { type: "u64" }),
          StellarSdk.nativeToScVal(Buffer.from(params.hashlock, "hex"), { type: "bytesN" }),
          StellarSdk.nativeToScVal(params.timelock, { type: "u32" })
        )
      )
      .setTimeout(30)
      .build();

    return tx;
  }

  async buildClaimTx(params: HtlcClaimParams): Promise<StellarSdk.Transaction> {
    const claimerAccount = await this.server.loadAccount(params.claimerAddress);

    const contract = new StellarSdk.Contract(params.contractId);
    const tx = new StellarSdk.TransactionBuilder(claimerAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: getNetworkPassphrase(),
    })
      .addOperation(
        contract.call(
          "claim",
          StellarSdk.nativeToScVal(Buffer.from(params.preimage, "hex"), { type: "bytesN" })
        )
      )
      .setTimeout(30)
      .build();

    return tx;
  }
}