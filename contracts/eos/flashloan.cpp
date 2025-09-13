#include <eosio/eosio.hpp>
#include <eosio/asset.hpp>
#include <eosio/system.hpp>

using namespace eosio;

class [[eosio::contract("flashloan")]] flashloan : public contract {
public:
    using contract::contract;

    struct [[eosio::table]] liquidity_pool {
        uint64_t id;
        name token_contract;
        symbol token_symbol;
        asset balance;
        uint64_t fee_rate; // basis points (1 = 0.01%)
        uint64_t max_loan_ratio; // basis points
        
        uint64_t primary_key() const { return id; }
        uint64_t by_symbol() const { return token_symbol.raw(); }
    };

    struct [[eosio::table]] loan_record {
        uint64_t id;
        name borrower;
        asset amount;
        asset fee;
        time_point_sec expiry;
        bool repaid;
        
        uint64_t primary_key() const { return id; }
        uint64_t by_borrower() const { return borrower.value; }
    };

    typedef multi_index<"liquidity"_n, liquidity_pool,
        indexed_by<"bysymbol"_n, const_mem_fun<liquidity_pool, uint64_t, &liquidity_pool::by_symbol>>
    > liquidity_table;

    typedef multi_index<"loans"_n, loan_record,
        indexed_by<"byborrower"_n, const_mem_fun<loan_record, uint64_t, &loan_record::by_borrower>>
    > loans_table;

    [[eosio::action]]
    void initpool(name token_contract, symbol token_symbol, asset initial_balance, uint64_t fee_rate, uint64_t max_loan_ratio) {
        require_auth(get_self());
        
        liquidity_table pools(get_self(), get_self().value);
        
        pools.emplace(get_self(), [&](auto& p) {
            p.id = pools.available_primary_key();
            p.token_contract = token_contract;
            p.token_symbol = token_symbol;
            p.balance = initial_balance;
            p.fee_rate = fee_rate;
            p.max_loan_ratio = max_loan_ratio;
        });
    }

    [[eosio::action]]
    void deposit(name from, asset quantity) {
        require_auth(from);
        
        liquidity_table pools(get_self(), get_self().value);
        auto sym_idx = pools.get_index<"bysymbol"_n>();
        auto pool_it = sym_idx.find(quantity.symbol.raw());
        
        check(pool_it != sym_idx.end(), "Pool for this token does not exist");
        
        action(
            permission_level{from, "active"_n},
            pool_it->token_contract,
            "transfer"_n,
            std::make_tuple(from, get_self(), quantity, std::string("Deposit to flash loan pool"))
        ).send();
        
        pools.modify(pool_it, get_self(), [&](auto& p) {
            p.balance += quantity;
        });
    }

    [[eosio::action]]
    void borrow(name borrower, asset amount, uint32_t duration_seconds) {
        require_auth(borrower);
        
        liquidity_table pools(get_self(), get_self().value);
        auto sym_idx = pools.get_index<"bysymbol"_n>();
        auto pool_it = sym_idx.find(amount.symbol.raw());
        
        check(pool_it != sym_idx.end(), "Pool for this token does not exist");
        check(amount <= pool_it->balance * pool_it->max_loan_ratio / 10000, "Loan exceeds maximum ratio");
        
        asset fee = amount * pool_it->fee_rate / 10000;
        
        loans_table loans(get_self(), get_self().value);
        loans.emplace(get_self(), [&](auto& l) {
            l.id = loans.available_primary_key();
            l.borrower = borrower;
            l.amount = amount;
            l.fee = fee;
            l.expiry = time_point_sec(current_time_point().sec_since_epoch() + duration_seconds);
            l.repaid = false;
        });
        
        action(
            permission_level{get_self(), "active"_n},
            pool_it->token_contract,
            "transfer"_n,
            std::make_tuple(get_self(), borrower, amount, std::string("Flash loan"))
        ).send();
    }

    [[eosio::action]]
    void repay(name borrower, uint64_t loan_id) {
        require_auth(borrower);
        
        loans_table loans(get_self(), get_self().value);
        auto loan_it = loans.find(loan_id);
        
        check(loan_it != loans.end(), "Loan not found");
        check(loan_it->borrower == borrower, "Not your loan");
        check(!loan_it->repaid, "Already repaid");
        
        liquidity_table pools(get_self(), get_self().value);
        auto sym_idx = pools.get_index<"bysymbol"_n>();
        auto pool_it = sym_idx.find(loan_it->amount.symbol.raw());
        
        asset total_repayment = loan_it->amount + loan_it->fee;
        
        action(
            permission_level{borrower, "active"_n},
            pool_it->token_contract,
            "transfer"_n,
            std::make_tuple(borrower, get_self(), total_repayment, std::string("Loan repayment"))
        ).send();
        
        pools.modify(pool_it, get_self(), [&](auto& p) {
            p.balance += loan_it->fee;
        });
        
        loans.modify(loan_it, get_self(), [&](auto& l) {
            l.repaid = true;
        });
    }

    [[eosio::action]]
    void checkloan(uint64_t loan_id) {
        loans_table loans(get_self(), get_self().value);
        auto loan_it = loans.find(loan_id);
        
        check(loan_it != loans.end(), "Loan not found");
        check(current_time_point() < loan_it->expiry, "Loan expired");
        
        if (current_time_point() >= loan_it->expiry && !loan_it->repaid) {
            // Liquidation logic would go here
            check(false, "Loan expired and not repaid");
        }
    }
};