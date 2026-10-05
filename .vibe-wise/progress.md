# Learning Progress

## Google sign-in: ID token vs access token (auth)
- Requirement (from learner): Google login via ID tokens; initialize once; no FedCM cooldown errors. Also asked for Helmet + rate limiting (not started).
- Explained (Concepts): ID token (JWT signed by Google, authentication) vs access token (opaque, authorization); app's own 15m access JWT + 7d rotating refresh cookie (sliding expiry confirmed in code); `sub` as stable key; fake token vs real-token-from-another-app (audience check).
- Demonstrated reasoning: learner restated that ID token = like a JWT for identity, access token = authorization; that an ID token carries identity claims. Corrected: ID token is a proof/receipt, not the user record (the DB row is); "fake token" attack is rejected in both flows, the real difference is the wrong-app (audience) check which `verifyIdToken` does automatically.
- Design decision: learner chose to implement ID tokens for login and sign-up ("implement id token for login and sign up"). The trigger mechanism (custom button -> prompt() with use_fedcm_for_prompt:false) was chosen by the AI, not the learner; flagged as a risk.
- Implemented: backend `googleLogin` ID-token-only (accepts `idToken` or `credential`); frontend hook initializes Google once at module level; `AuthContext.googleLogin` always sends `{ idToken, mode }`.
- Not yet done: Helmet, express-rate-limit (and `trust proxy` behind nginx), end-to-end sign-up/login test.
- Pending: learner has not decided about the sign-in/sign-up semantics vs "upsert" (current code keeps them separate: sign-up 409 if exists, login 404 if not).
