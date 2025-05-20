use anchor_lang::prelude::*;

declare_id!("GTt1KbzZ9Y3977wvUd5XzQEWf5vmm7xoJYwfmXuJxF9G");

#[program]
pub mod calculator {
    use super::*;
    pub fn init(ctx:Context<Initialize>)->Result<()>{
        let account= &mut ctx.accounts.new_account;
        account.num=0;
        Ok(())

    }
    pub fn double(ctx:Context<Double>)->Result<()>{
        let account= &mut ctx.accounts.account;
        account.num *= 2;
        Ok(())
    }
    pub fn half(ctx:Context<Half>)->Result<()>{
        let account=&mut ctx.accounts.account;
        account.num/=2;
        Ok(())
    }
    pub fn add(ctx:Context<Add>,num:u32)->Result<()>{
        let account= &mut ctx.accounts.account;
        account.num += num;
        Ok(())
    }
    pub fn sub(ctx:Context<Subtract>,num:u32)->Result<()>{
        let account= &mut ctx.accounts.account;
        account.num -= num;
        Ok(())
    }
    pub fn mul(ctx:Context<Multiply>,num:u32)->Result<()>{
        let account= &mut ctx.accounts.account;
        account.num *= num;
        Ok(())
    }

    
    
}
#[account]
pub struct AccountData{
    pub num:u32
}
#[derive(Accounts)]
pub struct Initialize<'info>{
    #[account(init,payer=signer,space=8+4)]
    pub new_account:Account<'info,AccountData>,
    #[account(mut)]
    pub signer:Signer<'info>,
    pub system_program:Program<'info, System>,
}
#[derive(Accounts)]
pub struct Double<'info>{
    #[account(mut)]
    pub account:Account<'info,AccountData>,
    pub signer:Signer<'info>,
}
#[derive(Accounts)]
pub struct Half<'info>{
    #[account(mut)]
    pub account:Account<'info,AccountData>,
    pub signer:Signer<'info>
}
#[derive(Accounts)]
pub struct Add<'info>{
    #[account(mut)]
    pub account:Account<'info,AccountData>,
    pub signer:Signer<'info>,
}
#[derive(Accounts)]
pub struct Subtract<'info>{
    #[account(mut)]
    pub account:Account<'info,AccountData>,
    pub signer:Signer<'info>,
}
#[derive(Accounts)]
pub struct Multiply<'info>{
    #[account(mut)]
    pub account:Account<'info,AccountData>,
    pub signer:Signer<'info>,
}