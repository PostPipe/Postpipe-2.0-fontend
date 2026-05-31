/**
 * PostPipe Stateless RBAC Service
 *
 * This service runs as part of the PostPipe infrastructure.
 * It is completely stateless regarding end-user data.
 * All RBAC operations are translated into signed requests and
 * routed to the developer's connector.
 */

import dotenv from 'dotenv';
import app from './app';

dotenv.config();

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`🚀 PostPipe Stateless RBAC Gateway listening on port ${PORT}`);
  console.log('🔒 Architecture: 100% Stateless (Bouncer & Router model)');
});

// Note: Mongoose has been intentionally removed from this service.
// PostPipe does NOT store developer's end-users, passwords, sessions,
// roles, or permissions. All state lives in the developer's DB.
