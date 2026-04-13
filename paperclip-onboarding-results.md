# Paperclip Onboarding Results

**Date:** 2026-04-13
**Status:** ⏳ Pending Board Approval

---

## What Was Done

### Step 1: Onboarding Instructions
- Fetched from `http://127.0.0.1:3100/api/invites/pcp_invite_zw5al2kw/onboarding.txt` ✅
- Invite type: `company_join` for company **Shaw5**

### Step 2: Gateway Config
- Gateway token: `251806b2877d06ae074c75017766dd080ec6309346e7c7c1`
- Gateway URL: `ws://127.0.0.1:18789`
- Gateway status: Running (pid 24932, port 18789, loopback-only)

### Step 3: Reachability
- Paperclip API reachable at `http://127.0.0.1:3100` ✅
- Note: Gateway is loopback-only; Paperclip on same host can reach it

### Step 4: Join Request Submitted ✅
- **Request ID:** `f4dcf6d0-45c3-4a15-a8a2-4cd0d413fdff`
- **Status:** `pending_approval`
- **Agent name:** OpenClaw
- **Adapter type:** `openclaw_gateway`
- **Claim secret:** `pcp_claim_a194027eeee5b1f302f999b050e02c85bc6ee98bec3033c1`
- **Claim secret expires:** 2026-04-20T11:35:11.660Z
- **Device key:** Generated and persisted by Paperclip (pairing approvals will be stable)

### Step 5: Skill Installed ✅
- Paperclip skill fetched and saved to `~/.openclaw/skills/paperclip/SKILL.md`

---

## ⚠️ Action Required: Board Approval Needed

The join request is **pending board approval** in Paperclip (company: Shaw5).

**A board member must approve the join request in Paperclip before the API key can be claimed.**

Once approved, run this to claim the API key:

```bash
curl -s -X POST http://127.0.0.1:3100/api/join-requests/f4dcf6d0-45c3-4a15-a8a2-4cd0d413fdff/claim-api-key \
  -H "Content-Type: application/json" \
  -d '{"claimSecret":"pcp_claim_a194027eeee5b1f302f999b050e02c85bc6ee98bec3033c1"}'
```

Then save the response to `~/.openclaw/workspace/paperclip-claimed-api-key.json` and set env vars `PAPERCLIP_API_KEY` and `PAPERCLIP_API_URL` as instructed.

---

## Remaining Steps After Approval

1. **Claim API key** (one-time, see above)
2. **Save response** to `~/.openclaw/workspace/paperclip-claimed-api-key.json` (chmod 600)
3. **Set env vars** `PAPERCLIP_API_KEY` and `PAPERCLIP_API_URL` in OpenClaw config per [docs](https://docs.openclaw.ai/help/environment)
4. **Skill is already installed** at `~/.openclaw/skills/paperclip/SKILL.md`
