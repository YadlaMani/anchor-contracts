import { describe, it, expect, beforeAll, test } from "vitest";
import { LiteSVM } from "litesvm";
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
describe("Counter Program Test", () => {
  let svm: LiteSVM;
  let programId: PublicKey;
  let dataAccount: Keypair;
  let signer: Keypair;
  beforeAll(async () => {
    svm = new LiteSVM();
    programId = PublicKey.unique();
    dataAccount = Keypair.generate();
    signer = Keypair.generate();
    svm.addProgramFromFile(programId, "./rust_program.so");
    svm.airdrop(signer.publicKey, BigInt(LAMPORTS_PER_SOL * 2));
    let ix = SystemProgram.createAccount({
      fromPubkey: signer.publicKey,
      newAccountPubkey: dataAccount.publicKey,
      lamports: Number(svm.minimumBalanceForRentExemption(BigInt(4))),
      space: 4,
      programId,
    });
    let tx = new Transaction().add(ix);
    tx.recentBlockhash = await svm.latestBlockhash();
    tx.sign(signer, dataAccount);
    svm.sendTransaction(tx);
    svm.expireBlockhash();
  });
  test("init", () => {
    const instruction = new TransactionInstruction({
      keys: [
        {
          pubkey: dataAccount.publicKey,
          isSigner: true,
          isWritable: true,
        },
      ],
      programId,
      data: Buffer.from([0]),
    });
    const tx = new Transaction().add(instruction);
    tx.recentBlockhash = svm.latestBlockhash();
    tx.feePayer = signer.publicKey;
    tx.sign(signer, dataAccount);
    let signature = svm.sendTransaction(tx);
    const updatedDataAccount = svm.getAccount(dataAccount.publicKey);
    if (!updatedDataAccount) {
      throw new Error("Failed to get updated data account");
    }

    expect([...updatedDataAccount.data.slice(0, 4)]).toEqual([1, 0, 0, 0]);
  });
  test("double", () => {
    doubleInstruction();
    doubleInstruction();
    doubleInstruction();
    const updatedDataAccount = svm.getAccount(dataAccount.publicKey);
    if (!updatedDataAccount) {
      throw new Error("Failed to get updated data account");
    }

    expect([...updatedDataAccount.data.slice(0, 4)]).toEqual([8, 0, 0, 0]);
  });
  test("half", () => {
    halfInstruction();
    const updatedDataAccount = svm.getAccount(dataAccount.publicKey);
    if (!updatedDataAccount) {
      throw new Error("Failed to get updated data account");
    }

    expect([...updatedDataAccount.data.slice(0, 4)]).toEqual([4, 0, 0, 0]);
  });
  function doubleInstruction() {
    const instruction = new TransactionInstruction({
      keys: [
        {
          pubkey: dataAccount.publicKey,
          isSigner: true,
          isWritable: true,
        },
      ],
      programId,
      data: Buffer.from([1]),
    });
    const tx = new Transaction().add(instruction);
    tx.recentBlockhash = svm.latestBlockhash();
    tx.feePayer = signer.publicKey;
    tx.sign(signer, dataAccount);
    let signature = svm.sendTransaction(tx);
    svm.expireBlockhash();
  }
  function halfInstruction() {
    const ix = new TransactionInstruction({
      keys: [
        {
          pubkey: dataAccount.publicKey,
          isSigner: true,
          isWritable: true,
        },
      ],
      programId,
      data: Buffer.from([2]),
    });
    const tx = new Transaction().add(ix);
    tx.recentBlockhash = svm.latestBlockhash();
    tx.feePayer = signer.publicKey;
    tx.sign(signer, dataAccount);
    let signature = svm.sendTransaction(tx);
    svm.expireBlockhash();
  }
});
