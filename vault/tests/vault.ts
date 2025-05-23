import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Vault } from "../target/types/vault";
import { assert } from "chai";

describe("vault", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.vault as Program<Vault>;
  console.log("Program ID: ", program.programId.toString());
  const signer = anchor.web3.Keypair.generate();
  let vaultPda: anchor.web3.PublicKey;
  let vaultBump: number;

  before(async () => {
    [vaultPda, vaultBump] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("vault"), signer.publicKey.toBuffer()],
      program.programId
    );
    const sig = await provider.connection.requestAirdrop(
      signer.publicKey,
      anchor.web3.LAMPORTS_PER_SOL * 2
    );
    await provider.connection.confirmTransaction(sig);
  });
  it("Deposit into the vault", async () => {
    const amount = anchor.web3.LAMPORTS_PER_SOL;
    await program.methods
      .deposit(new anchor.BN(amount))
      .accounts({
        signer: signer.publicKey,
      })
      .signers([signer])
      .rpc();
    const vaultAccount = await provider.connection.getAccountInfo(vaultPda);
    assert.ok(vaultAccount.lamports === amount);
  });
  it("Withdraw from the vault", async () => {
    await program.methods
      .withdraw()
      .accounts({
        signer: signer.publicKey,
      })
      .signers([signer])
      .rpc();
    const vaultAccount = await provider.connection.getAccountInfo(vaultPda);

    assert.ok(vaultAccount === null);
  });
});
