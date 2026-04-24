### Add SEP-1 TOML File Configuration

**Summary:**
This PR adds support for SEP-1 anchor discovery by providing a compliant `stellar.toml` file, including CURRENCIES, accounts, and anchor metadata. The file is served at `/.well-known/stellar.toml` as required by the Stellar protocol.

**Changes:**
- Added `stellar.toml` with CURRENCIES, distribution/issuance accounts, and anchor metadata.
- File is placed in `public/.well-known/stellar.toml` and served via Express static middleware.
- Updated Express app to serve the file at `/.well-known/stellar.toml`.

**Benefits:**
- Enables anchor discovery for Stellar clients and wallets.
- Ensures compliance with SEP-1 and validation by Stellar TOML checker.

**Acceptance Criteria:**
- [x] File is served at `/.well-known/stellar.toml`.
- [x] CURRENCIES, accounts, and metadata are present.
- [x] File validates with Stellar TOML checker.

---

Closes #491
