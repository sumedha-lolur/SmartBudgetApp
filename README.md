## Project Structure Overview

### Frontend (React Application)
- **Technologies**: React 18, React Router DOM 6
- **Authentication**: Uses a custom AuthContext to manage user authentication state
- **Components Structure**:
  - `components/`: Reusable UI components (ProtectedRoute, Navbar, etc.)
  - `contexts/`: Context providers (AuthContext)
  - `pages/`: Application pages/views (Dashboard, Login, SignUp, etc.)
- **Routing**: Uses React Router with protected routes for authenticated content

### Backend (Express.js API)
- **Technologies**: Node.js, Express.js, MongoDB (with Mongoose)
- **API Structure**: RESTful API with organized controllers, models, routes, and middleware
- **Authentication**: JWT token-based authentication with protected routes
- **Database Models**:
  - User: Account credentials and personal information
  - Account: Financial accounts (Checking, Savings, etc.)
  - Budget: Budget categories, amounts, and timeframes
  - Transaction: Financial transactions with types, categories, amounts

### Key Features
1. **User Authentication**: Registration, login, and profile management
2. **Dashboard**: Overview of accounts, budgets, and transactions
3. **Account Management**: Create and manage different account types
4. **Budget Planning**: Set up budgets for different spending categories
5. **Transaction Tracking**: Record and categorize income and expenses
6. **Protected Content**: Secure routes that require authentication

### Data Flow
- Frontend stores JWT token in localStorage upon login
- Protected routes check authentication status before rendering
- API requests include the token in Authorization headers
- Backend validates tokens before allowing access to protected resources

This is a comprehensive budget management application with a clean separation between frontend and backend, proper authentication flow, and structured data models for financial management.