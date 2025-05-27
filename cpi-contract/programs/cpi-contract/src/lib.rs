use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};
declare_id!("HaAek7wdsNLZb5EdiTHr9DdNoB2VowyZzyFnXQPcdgND");

#[program]
pub mod cpi_contract {
    use super::*;

    pub fn sol_transfer(ctx: Context<SolTransfer>,amount:u64) -> Result<()> {
       let from_pub_key=ctx.accounts.payer.to_account_info();
       let to_pub_key=ctx.accounts.to.to_account_info();
       let program_id=ctx.accounts.system_program.to_account_info();
       let cpi_context=CpiContext::new(
        program_id,
        Transfer{
            from:from_pub_key,
            to:to_pub_key,
        }
       );
       transfer(cpi_context, amount)?;


        Ok(())
    }
}

#[derive(Accounts)]
pub struct SolTransfer<'info>{
    #[account(mut)]
    pub payer:Signer<'info>,
    #[account(mut)]
    pub to:SystemAccount<'info>,
    pub system_program:Program<'info,System>
}
