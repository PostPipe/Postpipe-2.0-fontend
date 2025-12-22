# PostPipe Auth (MongoDB)

This folder contains your production-ready authentication system.

## Setup

1.  **Dependencies**: Installed automatically by the CLI.
2.  **Environment Variables**: Ensure `.env` has:
    ```env
    DATABASE_URI=...
    JWT_SECRET=...
    RESEND_API_KEY=...
    NEXT_PUBLIC_APP_URL=...
    ```

## Files

*   `actions.ts`: Server Actions (Signup, Login, etc.).
*   `User.ts`: Mongoose Model.
*   `email.ts`: Email sending utility.
*   `schemas.ts`: Validation schemas.
*   `frontend/`: Ready-to-use pages. Move these to your `app` directory.

## Usage

Import actions into your components:

```tsx
import { signup, login } from '@/lib/auth/actions';
```

## Security
*   BCrypt hashing (10 rounds)
*   HTTP-Only JWT Cookies
*   Zod Validation
