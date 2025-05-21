import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Calculator } from "../target/types/calculator";
import { assert } from "chai";
describe("calculator", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.calculator as Program<Calculator>;
  const newAccount = anchor.web3.Keypair.generate();

  it("Is initialized!", async () => {
    const tx = await program.methods
      .init()
      .accounts({
        newAccount: newAccount.publicKey,
        signer: anchor.getProvider().wallet.publicKey,
      })
      .signers([newAccount])
      .rpc();
    const accountInfo = await program.account.accountData.fetch(
      newAccount.publicKey
    );
    assert.equal(accountInfo.num, 0);
  });
  it("Add", async () => {
    const tx = await program.methods
      .add(2)
      .accounts({
        account: newAccount.publicKey,
        signer: anchor.getProvider().wallet.publicKey,
      })
      .rpc();
    const accountInfo = await program.account.accountData.fetch(
      newAccount.publicKey
    );
    assert.equal(accountInfo.num, 2);
  });
  it("Double", async () => {
    let tx = await program.methods
      .double()
      .accounts({
        account: newAccount.publicKey,
        signer: anchor.getProvider().wallet.publicKey,
      })
      .rpc();
    let accountInfo = await program.account.accountData.fetch(
      newAccount.publicKey
    );
    assert.equal(accountInfo.num, 4);
  });
  it("Subtract", async () => {
    let tx = await program.methods
      .sub(2)
      .accounts({
        account: newAccount.publicKey,
        signer: anchor.getProvider().wallet.publicKey,
      })
      .rpc();
    let accountInfo = await program.account.accountData.fetch(
      newAccount.publicKey
    );

    assert.equal(accountInfo.num, 2);
  });
  it("Multiply", async () => {
    await program.methods
      .mul(2)
      .accounts({
        account: newAccount.publicKey,
        signer: anchor.getProvider().wallet.publicKey,
      })
      .rpc();
    let accountInfo = await program.account.accountData.fetch(
      newAccount.publicKey
    );

    assert.equal(accountInfo.num, 4);
  });
  it("Half", async () => {
    await program.methods
      .half()
      .accounts({
        account: newAccount.publicKey,
        signer: anchor.getProvider().wallet.publicKey,
      })
      .rpc();
    let accountInfo = await program.account.accountData.fetch(
      newAccount.publicKey
    );

    assert.equal(accountInfo.num, 2);
  });
});
