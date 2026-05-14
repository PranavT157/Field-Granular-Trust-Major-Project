# 🚀 MediSync Shield - 5-Minute Startup Guide

## Prerequisites Check
- [ ] Node.js 18+ installed? → `node --version`
- [ ] npm 9+ installed? → `npm --version`
- [ ] Ports 3001 & 5173 available

## Step 1: Install Dependencies (2 minutes)

**Option A: Windows (Automatic)**
```bash
cd medisync-shield
./setup.bat
# Automatically installs backend + frontend dependencies
```

**Option B: Manual**
```bash
# Backend
cd backend
npm install
cd ..

# Frontend
cd frontend
npm install
cd ..
```

## Step 2: Start Backend (30 seconds)

```bash
cd backend
npm start
```

✅ **Expected Output:**
```
🏥 MediSync Shield Backend running on port 3001
📊 Trust Engine initialized
📋 Schema loaded from ...
🚀 Ready for sync events!
```

## Step 3: Start Frontend (30 seconds)

**In a NEW terminal (keep backend running):**
```bash
cd frontend
npm run dev
```

✅ **Expected Output:**
```
VITE v5.0.0 ready in 500 ms
➜ Local: http://localhost:5173/
```

## Step 4: Open Dashboard

Navigate to: **http://localhost:5173**

✅ You should see:
- Purple gradient header with "MediSync Shield"
- 5 device trust cards (all at 50% initially)
- Scenario selector dropdown
- Run Simulation button

## Step 5: Run Your First Scenario (30 seconds)

### Demo 1: Normal (All Honest)
1. Keep scenario as **"Normal (All Honest)"**
2. Click **"Run Simulation"**
3. Watch the progress bar (Round 0/20 → 20/20)
4. Observe:
   - All 5 device trust scores increase to ~91%
   - Rejection Rate: <1%
   - Sync Feed shows acceptance icons (green ✓)

### Demo 2: Attack (1 Malicious)
1. Select **"Direct Attack (1 Malicious)"** from dropdown
2. Click **"Reset"** (clears previous data)
3. Click **"Run Simulation"**
4. Watch:
   - One device (red badge "✗ Malicious") trust collapses
   - That device's score: 0.5 → near 0% by round 10
   - Other 4 devices remain ~91%
   - Rejection Rate: ~85% (malicious updates blocked!)

### Demo 3: Laundering (Sophisticated Attack)
1. Select **"Reputation Laundering"** from dropdown
2. Click **"Reset"**
3. Click **"Run Simulation"**
4. Watch closely:
   - One device (yellow badge "⚠ Laundering") builds trust slowly
   - By round 10: trust reaches ~98% (very high!)
   - At round 11: Device switches to attack mode
   - CRITICAL: Despite high reputation, attack STILL fails!
   - Rejection Rate: ~75% (field-specific evidence blocks it)
   - **This proves field-granular trust defeats reputation laundering**

## Step 6: Explore the Dashboard

### Trust Evolution Chart (Bottom)
- Shows 3 lines (1 per scenario demo)
- Clinical fields (red dashed lines at 0.90 threshold)
- Admin fields (red dashed lines at 0.50 threshold)
- Notice attacker line crashes down in scenario 2 & 3

### Field Decision Table (Center)
- Field name, Risk Tier (Clinical/Operational/Admin)
- Decision (ACCEPT/REJECT)
- Weight vs. threshold comparison

### Patient Golden Record (Right)
- Current master state of patient data
- Color-coded by risk tier
- Updated as fields are accepted

### Metrics Summary (Top)
- Total Sync Events: 60 (3 scenarios × 20 rounds)
- Rejected Updates: Count of blocked updates
- Rejection Rate: Percentage
- Mean Latency: Average response time

### Comparison Table (Bottom)
- LWW: 0% rejection (vulnerable)
- Uniform WMV: ~97% rejection
- **Field-Granular WMV: >99% critical** ← Your project!

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Backend won't start | Port 3001 in use: `netstat -ano \| findstr :3001` → Kill process or change PORT |
| Frontend won't start | Port 5173 in use: Try `npm run dev -- --port 5174` |
| "Connection error" warning | Backend not running; make sure Step 2 completed |
| npm install fails | Delete `node_modules/` → `npm cache clean --force` → try again |
| Blank dashboard | Check browser console (F12) for errors; restart both servers |

## Quick Commands Reference

```bash
# Start backend
cd backend && npm start

# Start frontend (new terminal)
cd frontend && npm run dev

# Reset state (via API)
curl -X POST http://localhost:3001/reset

# Get current trust snapshot
curl http://localhost:3001/trust | jq '.'

# Export audit log
curl 'http://localhost:3001/audit?limit=1000' > audit.json

# Stop servers
# Backend: Ctrl+C
# Frontend: Ctrl+C
```

## Keyboard Shortcuts in Dashboard

- **Ctrl+R** or **Cmd+R** → Refresh page
- **F12** → Open Developer Console (for debugging)
- Scroll charts left/right → Pan across time

## Success Checklist

- [ ] Backend starts without errors
- [ ] Frontend loads at http://localhost:5173
- [ ] Scenario: Normal shows <1% rejection
- [ ] Scenario: Attack shows >85% rejection  
- [ ] Scenario: Laundering shows attack still fails
- [ ] Trust Evolution chart displays 3 lines
- [ ] Field Decision table shows per-field outcomes
- [ ] Patient record updates after each scenario

## 📊 Expected Results Summary

```
Normal Scenario:
  ✓ All devices honest
  ✓ Trust converges to ~0.91
  ✓ Rejection rate: <1%
  ✓ Conclusion: System works correctly

Attack Scenario:
  ✓ 1 attacker, 4 honest
  ✓ Attacker trust → 0.001
  ✓ Rejection rate: ~85%
  ✓ Conclusion: Attack detected and blocked

Laundering Scenario:
  ✓ 1 launderer builds reputation first
  ✓ Launderer global trust → 0.98 by round 10
  ✓ Attack on clinical fields STILL blocked
  ✓ Rejection rate: ~75%
  ✓ Conclusion: Field-granular trust > document-level!
```

## 🎓 For Your Professor

### 2-Minute Overview
"MediSync Shield is a field-granular trust system for healthcare IoT. Unlike document-level consensus, each field has its own trust threshold. This means an attacker with high global reputation can't attack critical fields—it's proven by the laundering scenario where 98% reputation still fails on medication_dosage."

### Key Talking Point
"The math: When λ_f=0.05 (clinical prior), global trust doesn't transfer to field trust. The formula includes per-field alpha/beta counters, so an attacker has zero history on medication_dosage. Even with 15 honest votes globally, the field-specific evidence requirement blocks the attack. That's the innovation."

### Live Demo Highlight
"Watch round 10 in the laundering scenario—the device has nearly perfect reputation. But here's the crucial moment: it attacks medication_dosage. The system rejects it because lambda-f forces clinical fields to earn independent evidence. No other system does this."

---

## Still Stuck?

1. Check [README.md](./README.md) for detailed architecture
2. Review [API_TESTING.md](./API_TESTING.md) for endpoint examples
3. See [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) for file organization
4. Check backend console for detailed logs

**Good luck with your presentation! 🏥**
