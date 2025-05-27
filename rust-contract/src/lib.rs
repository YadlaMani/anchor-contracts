use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    entrypoint,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
    rent::Rent,
    sysvar::Sysvar,
    system_instruction,
    program::invoke,
};

entrypoint!(process_instruction);

#[derive(BorshDeserialize, BorshSerialize)]
struct CounterState {
    count: u32,
}

#[derive(BorshSerialize, BorshDeserialize)]
enum Instruction {
    Init,
    Double,
    Half,
}

fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let instruction = Instruction::try_from_slice(instruction_data)
        .map_err(|_| ProgramError::InvalidInstructionData)?;

    match instruction {
        Instruction::Init => {
            msg!("Initializing counter");

            let mut iter = accounts.iter();
            let data_account = next_account_info(&mut iter)?;
            let payer = next_account_info(&mut iter)?;
            let system_program = next_account_info(&mut iter)?;

            if !payer.is_signer {
                return Err(ProgramError::MissingRequiredSignature);
            }

            
            if data_account.lamports() > 0 {
                msg!("Error: Data account already initialized");
                return Err(ProgramError::AccountAlreadyInitialized);
            }

            let space = std::mem::size_of::<CounterState>();
            let rent = Rent::get()?;
            let lamports = rent.minimum_balance(space);

            let create_account_ix = system_instruction::create_account(
                payer.key,
                data_account.key,
                lamports,
                space as u64,
                program_id,
            );

            invoke(
                &create_account_ix,
                &[payer.clone(), data_account.clone(), system_program.clone()],
            )?;

            let counter_state = CounterState { count: 1 };
            counter_state.serialize(&mut *data_account.data.borrow_mut())?;

            msg!("Counter initialized with value: {}", counter_state.count);
        }
        Instruction::Double => {
            msg!("Doubling counter value");

            let mut iter = accounts.iter();
            let data_account = next_account_info(&mut iter)?;

            if !data_account.is_writable {
                return Err(ProgramError::InvalidAccountData);
            }

            if data_account.owner != program_id {
                msg!("Data account is not owned by this program");
                return Err(ProgramError::IncorrectProgramId);
            }

            if data_account.data_len() < std::mem::size_of::<CounterState>() {
                msg!("Data account size too small");
                return Err(ProgramError::InvalidAccountData);
            }

            let mut counter_state = CounterState::try_from_slice(&data_account.data.borrow())?;
            counter_state.count = counter_state
                .count
                .checked_mul(2)
                .ok_or(ProgramError::InvalidInstructionData)?;
            counter_state.serialize(&mut *data_account.data.borrow_mut())?;
        }
        Instruction::Half => {
            msg!("Halving counter value");

            let mut iter = accounts.iter();
            let data_account = next_account_info(&mut iter)?;

            if !data_account.is_writable {
                return Err(ProgramError::InvalidAccountData);
            }

            if data_account.owner != program_id {
                msg!("Data account is not owned by this program");
                return Err(ProgramError::IncorrectProgramId);
            }

            if data_account.data_len() < std::mem::size_of::<CounterState>() {
                msg!("Data account size too small");
                return Err(ProgramError::InvalidAccountData);
            }

            let mut counter_state = CounterState::try_from_slice(&data_account.data.borrow())?;

           
            if counter_state.count == 0 {
                msg!("Counter is zero, cannot halve further");
                return Err(ProgramError::InvalidInstructionData);
            }

            counter_state.count /= 2;
            counter_state.serialize(&mut *data_account.data.borrow_mut())?;
        }
    }

    Ok(())
}
