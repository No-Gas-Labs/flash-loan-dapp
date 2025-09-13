# Flash Loan dApp - Detailed Project Overview

## Architecture Overview

The Flash Loan dApp is a comprehensive decentralized application that supports three different blockchains: EOS, TON, and SUI. The project follows a modern architecture with separate components for smart contracts, backend API, and frontend mobile application.

### System Components

1. **Smart Contracts**: Blockchain-specific implementations for EOS (C++), TON (FunC), and SUI (Move)
2. **Backend API**: Node.js/Express server with SQLite database
3. **Frontend**: React Native mobile application
4. **Testing Suite**: Comprehensive tests for all components
5. **Deployment Scripts**: Automated deployment to respective testnets

## Smart Contracts

### EOS Contract (C++)

The EOS contract (`flashloan.cpp`) implements a flash loan protocol using C++ and the EOSIO SDK. Key features include:

- **Liquidity Pool Management**: Stores token balances with associated metadata
- **Fee Structure**: Configurable fee rates in basis points
- **Loan Ratio Enforcement**: Maximum loan-to-pool ratio to prevent excessive borrowing
- **Security Measures**: Proper validation and error handling

The contract uses EOSIO tables for persistent storage and implements actions for depositing, borrowing, and repaying loans.

### TON Contract (FunC)

The TON contract (`flashloan.fc`) uses FunC to implement flash loans on the TON blockchain. Key features include:

- **Message-Based Architecture**: Uses TON's message passing for contract interactions
- **Operation Codes**: Defines specific op codes for different operations
- **Gas Optimization**: Efficient code to minimize gas costs
- **Duration-Based Loans**: Supports time-limited loans with expiration

The contract handles internal and external messages for deposit, borrow, and repay operations.

### SUI Contract (Move)

The SUI contract (`flashloan.move`) leverages Move's resource-oriented programming model. Key features include:

- **Object-Based Storage**: Uses SUI's object model for liquidity pools
- **Balance Management**: Leverages SUI's built-in balance types
- **Event Emission**: Publishes events for important operations
- **Error Handling**: Comprehensive error codes and validation

The contract defines custom types for liquidity pools and loans with appropriate access controls.

## Backend API

The backend server (`server.js`) provides a RESTful API for interacting with the flash loan contracts. Key features include:

- **Express Framework**: Modern Node.js/Express setup
- **SQLite Database**: Lightweight database for storing transaction history
- **Security Middleware**: Helmet for HTTP security headers
- **CORS Support**: Cross-origin resource sharing configuration
- **API Endpoints**: Well-defined endpoints for wallet connection, flash loan execution, and transaction history

The server initializes database tables for transactions, liquidity pools, and wallet connections.

## Frontend Mobile App

The React Native application (`App.tsx` and related files) provides a mobile interface for users. Key features include:

- **Navigation**: Stack-based navigation between screens
- **Context Providers**: Wallet and API context for state management
- **Multiple Screens**: WalletConnect, Dashboard, FlashLoan, and History screens
- **Material Design**: Uses React Native Paper for UI components
- **Responsive Layout**: Mobile-first design approach

The app connects to the backend API and blockchain wallets to enable flash loan operations.

## Testing Suite

The project includes comprehensive tests for all components:

- **Smart Contract Tests**: Unit tests for EOS, TON, and SUI contracts
- **Backend Tests**: API endpoint testing with supertest
- **Integration Tests**: End-to-end tests for complete flash loan cycles

Tests use appropriate frameworks for each platform (Chai for JavaScript, native testing for blockchain-specific code).

## Deployment Scripts

Automated deployment scripts for each blockchain:

- **EOS Deployment**: Uses cleos commands to deploy to EOS testnet
- **TON Deployment**: Configures and deploys using TON tools
- **SUI Deployment**: Uses SUI client for deployment

Each script handles compilation, account creation, and contract initialization.

## Project Structure

```
flash-loan-dapp/
├── contracts/
│   ├── eos/              # EOS smart contracts (C++)
│   │   ├── flashloan.cpp
│   │   └── sample_borrower.cpp
│   ├── ton/              # TON smart contracts (FunC)
│   │   ├── flashloan.fc
│   │   ├── sample_borrower.fc
│   │   └── blueprint.config.ts
│   └── sui/              # SUI smart contracts (Move)
│       ├── sources/
│       │   ├── flashloan.move
│       │   └── sample_borrower.move
│       └── Move.toml
├── backend/              # Node.js/Express API server
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── frontend/             # React Native mobile app
│   ├── App.tsx
│   ├── package.json
│   └── src/
│       ├── context/
│       │   ├── APIContext.tsx
│       │   └── WalletContext.tsx
│       └── screens/
│           ├── DashboardScreen.tsx
│           ├── FlashLoanScreen.tsx
│           ├── HistoryScreen.tsx
│           └── WalletConnectScreen.tsx
├── tests/                # Comprehensive test suite
│   ├── eos/
│   │   └── flashloan.test.js
│   ├── ton/
│   │   └── flashloan.test.ts
│   ├── sui/
│   │   └── flashloan.test.ts
│   ├── backend/
│   │   └── server.test.js
│   └── package.json
└── scripts/              # Deployment scripts
    ├── deploy-eos.sh
    ├── deploy-ton.sh
    └── deploy-sui.sh
```

## Technical Highlights

1. **Multi-Blockchain Support**: Unified application supporting three different blockchain architectures
2. **Secure Flash Loan Implementation**: Proper validation, fee calculation, and repayment enforcement
3. **Mobile-First Design**: React Native for cross-platform mobile support
4. **Comprehensive Testing**: Unit and integration tests for all components
5. **Automated Deployment**: Scripts for easy testnet deployment

## Next Steps

1. **GitHub Repository Setup**: Follow the GitHub Setup Guide to upload the project
2. **Testnet Deployment**: Use the provided scripts to deploy to respective testnets
3. **Mobile App Testing**: Test the React Native app on iOS and Android devices
4. **Integration Testing**: Verify all components work together correctly
5. **Documentation Updates**: Add any additional documentation as needed