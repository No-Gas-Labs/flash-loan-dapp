module flashloan::flashloan {
    use sui::coin::{Self, Coin};
    use sui::balance::{Self, Balance};
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::clock::{Self, Clock};
    use sui::event;

    const E_INSUFFICIENT_LIQUIDITY: u64 = 0;
    const E_LOAN_TOO_LARGE: u64 = 1;
    const E_LOAN_NOT_FOUND: u64 = 2;
    const E_LOAN_EXPIRED: u64 = 3;
    const E_LOAN_NOT_EXPIRED: u64 = 4;
    const E_INVALID_REPAYMENT: u64 = 5;

    struct LiquidityPool<phantom T> has key {
        id: UID,
        balance: Balance<T>,
        fee_rate: u64, // basis points
        max_loan_ratio: u64, // basis points
    }

    struct LoanRecord has key {
        id: UID,
        borrower: address,
        amount: u64,
        fee: u64,
        expiry: u64,
        repaid: bool,
    }

    struct LoanCreated has copy, drop {
        loan_id: address,
        borrower: address,
        amount: u64,
        fee: u64,
        expiry: u64,
    }

    struct LoanRepaid has copy, drop {
        loan_id: address,
        borrower: address,
        repayment_amount: u64,
    }

    public fun create_pool<T>(
        initial_balance: Balance<T>,
        fee_rate: u64,
        max_loan_ratio: u64,
        ctx: &mut TxContext,
    ): LiquidityPool<T> {
        LiquidityPool {
            id: object::new(ctx),
            balance: initial_balance,
            fee_rate,
            max_loan_ratio,
        }
    }

    public fun deposit<T>(
        pool: &mut LiquidityPool<T>,
        coin: Coin<T>,
    ) {
        let coin_value = coin::value(&coin);
        balance::join(&mut pool.balance, coin::into_balance(coin));
    }

    public fun borrow<T>(
        pool: &mut LiquidityPool<T>,
        amount: u64,
        duration: u64,
        clock: &Clock,
        ctx: &mut TxContext,
    ): (Coin<T>, LoanRecord) {
        assert!(
            amount <= balance::value(&pool.balance),
            E_INSUFFICIENT_LIQUIDITY
        );

        let max_allowed = (balance::value(&pool.balance) * pool.max_loan_ratio) / 10000;
        assert!(amount <= max_allowed, E_LOAN_TOO_LARGE);

        let fee = (amount * pool.fee_rate) / 10000;
        let expiry = clock::timestamp_ms(clock) + (duration * 1000);

        let loan = LoanRecord {
            id: object::new(ctx),
            borrower: tx_context::sender(ctx),
            amount,
            fee,
            expiry,
            repaid: false,
        };

        let loan_amount = balance::split(&mut pool.balance, amount);
        
        event::emit(LoanCreated {
            loan_id: object::id(&loan),
            borrower: tx_context::sender(ctx),
            amount,
            fee,
            expiry,
        });

        (coin::from_balance(loan_amount, ctx), loan)
    }

    public fun repay<T>(
        pool: &mut LiquidityPool<T>,
        loan: &mut LoanRecord,
        repayment: Coin<T>,
        clock: &Clock,
        ctx: &mut TxContext,
    ) {
        assert!(loan.repaid == false, E_INVALID_REPAYMENT);
        assert!(clock::timestamp_ms(clock) < loan.expiry, E_LOAN_EXPIRED);
        assert!(loan.borrower == tx_context::sender(ctx), E_INVALID_REPAYMENT);

        let expected_repayment = loan.amount + loan.fee;
        assert!(coin::value(&repayment) == expected_repayment, E_INVALID_REPAYMENT);

        balance::join(&mut pool.balance, coin::into_balance(repayment));
        loan.repaid = true;

        event::emit(LoanRepaid {
            loan_id: object::id(loan),
            borrower: loan.borrower,
            repayment_amount: expected_repayment,
        });
    }

    public entry fun liquidate_loan<T>(
        pool: &mut LiquidityPool<T>,
        loan: &mut LoanRecord,
        clock: &Clock,
        ctx: &mut TxContext,
    ) {
        assert!(loan.repaid == false, E_INVALID_REPAYMENT);
        assert!(clock::timestamp_ms(clock) >= loan.expiry, E_LOAN_NOT_EXPIRED);

        // Liquidation logic - the liquidator gets the collateral
        // In this simplified version, the pool keeps the borrowed amount
        loan.repaid = true;
    }

    public fun get_pool_balance<T>(pool: &LiquidityPool<T>): u64 {
        balance::value(&pool.balance)
    }

    public fun get_loan_details(loan: &LoanRecord): (address, u64, u64, u64, bool) {
        (loan.borrower, loan.amount, loan.fee, loan.expiry, loan.repaid)
    }
}