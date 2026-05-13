# API Testing Guide - cURL Examples

This file contains ready-to-use cURL commands for testing MediSync Shield endpoints.

**Prerequisites:**
- Backend running on `http://localhost:3001`
- Windows: Use Git Bash or WSL; or replace single quotes with double quotes

## 1. Get Schema

```bash
curl http://localhost:3001/schema
```

Returns the patient record schema with trust annotations.

## 2. Get Trust Snapshot

```bash
curl http://localhost:3001/trust
```

Shows current α/β counters for all devices.

## 3. Get Patient Record

```bash
curl http://localhost:3001/record/patient_001
```

Shows the current golden record from master DB.

## 4. Get Audit Log (Last 20)

```bash
curl 'http://localhost:3001/audit?limit=20'
```

Shows last 20 sync decisions (adjust `limit` parameter).

## 5. Get Statistics

```bash
curl http://localhost:3001/stats
```

Aggregate stats: rejection rate, mean latency, etc.

## 6. Perform Single Sync

Manually send device updates to the sync endpoint:

```bash
curl -X POST http://localhost:3001/sync \
  -H 'Content-Type: application/json' \
  -d '{
    "patientId": "patient_001",
    "round": 1,
    "updates": [
      {
        "deviceId": "device_nurse_A",
        "fieldPath": "medication_dosage",
        "value": 50
      },
      {
        "deviceId": "device_monitor_ICU",
        "fieldPath": "blood_pressure",
        "value": "120/80"
      }
    ]
  }'
```

Expected response:
```json
{
  "success": true,
  "mergeResult": {
    "updatedFields": ["medication_dosage", "blood_pressure"],
    "rejectedFields": [],
    "pendingFields": []
  },
  "fieldDecisions": [...],
  "trustSnapshot": {...},
  "latencyMs": 42
}
```

## 7. Run Scenario: Normal

```bash
curl -X POST http://localhost:3001/simulate/normal
```

Runs 20 rounds with all 5 devices honest. Returns stats and audit log.

## 8. Run Scenario: Attack

```bash
curl -X POST http://localhost:3001/simulate/attack
```

Runs 20 rounds with 1 malicious attacker. Watch rejection rate spike.

## 9. Run Scenario: Laundering

```bash
curl -X POST http://localhost:3001/simulate/laundering
```

Runs 20 rounds. Launderer builds trust (rounds 1–10), then attacks (rounds 11–20).
Check console output for round 10 transition insights.

## 10. Run Comparison (All Scenarios)

```bash
curl -X POST http://localhost:3001/simulate/compare
```

Runs Normal, Attack, and Laundering sequentially. Returns aggregated stats.

## 11. Reset All State

```bash
curl -X POST http://localhost:3001/reset
```

Clears all trust counters and audit logs. Reinitializes seed data.

---

## Testing Workflow

### 1. Check Initial State
```bash
curl http://localhost:3001/trust
# Expected: empty {} or default devices at 0.5 trust
```

### 2. Run a Scenario
```bash
curl -X POST http://localhost:3001/simulate/attack
# Watch for output in backend console
```

### 3. View Results
```bash
curl 'http://localhost:3001/audit?limit=100' | jq '.entries | length'
# Should show 20 entries (20 rounds)

curl http://localhost:3001/trust | jq '.device_attacker.globalTrust'
# Should show very low value (≈0.001)
```

### 4. Check Stats
```bash
curl http://localhost:3001/stats | jq '.'
# Shows rejection rate, latency, etc.
```

### 5. Export Audit Log (for analysis)
```bash
curl 'http://localhost:3001/audit?limit=1000' > audit_export.json
```

---

## Batch Testing (PowerShell)

```powershell
# Run all scenarios and compare
$base = 'http://localhost:3001'

Write-Host "Running Normal scenario..."
$normal = Invoke-RestMethod -Uri "$base/simulate/normal" -Method Post

Write-Host "Normal rejection rate: $($normal.stats.rejectionRate * 100)%"

Write-Host "Running Attack scenario..."
$attack = Invoke-RestMethod -Uri "$base/simulate/attack" -Method Post

Write-Host "Attack rejection rate: $($attack.stats.rejectionRate * 100)%"

Write-Host "Running Laundering scenario..."
$launder = Invoke-RestMethod -Uri "$base/simulate/laundering" -Method Post

Write-Host "Laundering rejection rate: $($launder.stats.rejectionRate * 100)%"

# Summary
Write-Host "`n=== RESULTS ==="
Write-Host "Normal:     $($normal.stats.rejectionRate * 100)% rejection"
Write-Host "Attack:     $($attack.stats.rejectionRate * 100)% rejection"
Write-Host "Laundering: $($launder.stats.rejectionRate * 100)% rejection"
```

---

## Monitoring (Watch Changes Live)

Linux/Mac:
```bash
watch -n 1 'curl -s http://localhost:3001/trust | jq ".device_attacker.globalTrust"'
```

PowerShell:
```powershell
while ($true) {
  Clear-Host
  Write-Host "Device Attacker Trust:"
  (Invoke-RestMethod http://localhost:3001/trust).device_attacker.globalTrust
  Start-Sleep -Seconds 1
}
```

---

## Debugging Tips

### See Request Timing
```bash
curl -w "\nTime to first byte: %{time_starttransfer}\n" \
  -X POST http://localhost:3001/simulate/normal
```

### Pretty-Print JSON (requires `jq`)
```bash
curl -s http://localhost:3001/trust | jq '.'
```

### See Response Headers
```bash
curl -i http://localhost:3001/schema
```

### Save Full Response
```bash
curl http://localhost:3001/audit > audit_full.json
```

---

## Common Issues & Fixes

| Problem | Solution |
|---------|----------|
| "Connection refused" | Backend not running; start with `npm start` |
| Empty trust snapshot | Run a scenario first: `curl -X POST http://localhost:3001/simulate/normal` |
| 404 on `/record/patient_001` | Run `/reset` first to initialize seed data |
| Timeout | Backend is processing; increase wait time or check logs |

---

**💡 Tip:** Use these cURL commands to test without the React dashboard, or to verify backend behavior independently.
