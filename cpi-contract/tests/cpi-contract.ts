import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { CpiContract } from "../target/types/cpi_contract";
import { assert } from "chai";
describe("cpi-contract", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const signer = anchor.getProvider();
  const to = anchor.web3.Keypair.generate();
  const program = anchor.workspace.cpiContract as Program<CpiContract>;

  it("Is initialized!", async () => {
    const sig = await provider.connection.requestAirdrop(
      signer.wallet.publicKey,
      anchor.web3.LAMPORTS_PER_SOL * 2
    );
    await provider.connection.confirmTransaction(sig);
    const tx = await program.methods
      .solTransfer(new anchor.BN(anchor.web3.LAMPORTS_PER_SOL))
      .accounts({
        to: to.publicKey,
        payer: signer.wallet.publicKey,
      })
      .rpc();
    await provider.connection.confirmTransaction(tx);
    const toAccount = await provider.connection.getAccountInfo(to.publicKey);
    assert.ok(toAccount.lamports === anchor.web3.LAMPORTS_PER_SOL);
  });
});
