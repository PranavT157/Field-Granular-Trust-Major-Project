# 📚 MediSync Shield - Documentation Index

Complete guide to all project files and how to use them.

## 📖 Main Documentation Files

### 1. **QUICKSTART.md** ← Start here!
- 5-minute startup guide
- Step-by-step setup
- First-time demo walkthrough
- Troubleshooting tips
- Expected results for each scenario
- **Read first for fastest onboarding**

### 2. **README.md**
- Comprehensive project overview
- Architecture & tech stack
- Complete feature descriptions
- All 3 scenarios explained with expected behavior
- API endpoints reference
- Trust formulas and academic insights
- **Read before presenting to understand depth**

### 3. **PROJECT_STRUCTURE.md**
- Complete file organization
- Purpose of each file
- Data flow diagrams
- File line counts
- Customization guide
- Verification checklist
- **Read for code navigation**

### 4. **API_TESTING.md**
- 30+ ready-to-use cURL examples
- All endpoints with request/response samples
- Batch testing scripts (PowerShell)
- Monitoring commands
- Debugging tips
- **Read for backend testing without UI**

## 🎯 How to Use This Documentation

### Planning to Present to Your Professor?
1. **First**: Read QUICKSTART.md (understand how to run it)
2. **Then**: Skim README.md (understand what it does)
3. **Finally**: Practice the 3 scenarios in order

### Want to Understand the Code?
1. **Start**: PROJECT_STRUCTURE.md (overview of files)
2. **Then**: Read backend/server.js (entry point)
3. **Next**: Read trustEngine.js and wmvRunner.js (core logic)
4. **Finally**: Explore frontend/src/components/ (UI layer)

### Need to Test an Endpoint?
1. **Consult**: API_TESTING.md
2. **Find**: Your specific endpoint
3. **Copy**: Example cURL command
4. **Run**: In terminal

### Want to Modify Scenarios?
1. **Read**: README.md "Scenarios" section
2. **Edit**: backend/simulation/scenarios/*.js
3. **Restart**: Backend server
4. **Test**: New behavior via dashboard

## 📋 File Reference by Purpose

### For Getting Started
```
├── QUICKSTART.md          ← Start here (5 min)
├── setup.bat              ← Windows auto-installer
├── health-check.js        ← Verify all files present
└── .gitignore             ← Git ignore patterns
```

### For Understanding
```
├── README.md              ← Complete guide (600+ lines)
├── PROJECT_STRUCTURE.md   ← File organization
├── API_TESTING.md         ← Endpoint examples
└── /memories/             ← Your session notes
```

### For Running Backend
```
backend/
├── server.js              ← Main entry point (Run this!)
├── package.json           ← Dependencies
├── .env.example           ← Configuration template
│
├── interceptor/
│   ├── trustEngine.js     ← Trust computation
│   ├── wmvRunner.js       ← WMV algorithm
│   ├── fieldDecomposer.js ← Field parsing
│   ├── mergeAssembler.js  ← Partial commits
│   └── auditLogger.js     ← Audit trail
│
├── schema/
│   └── patientRecord.schema.json ← Trust annotations
│
├── db/
│   ├── masterDb.js        ← Patient records
│   └── trustDb.js         ← Trust counters
│
└── simulation/
    ├── deviceSimulator.js ← Virtual devices
    ├── seedData.js        ← Initial data
    └── scenarios/
        ├── scenario_normal.js      ← Honest scenario
        ├── scenario_attack.js      ← Malicious scenario
        └── scenario_laundering.js  ← Sophisticated attack
```

### For Running Frontend
```
frontend/
├── package.json           ← Dependencies
├── vite.config.js         ← Build config
├── index.html             ← HTML entry
├── tsconfig.json          ← TS config
│
└── src/
    ├── main.jsx           ← React root
    ├── App.jsx            ← Shell
    ├── index.css          ← Styles
    │
    └── components/
        ├── Dashboard.jsx              ← Main layout
        ├── DeviceTrustCard.jsx        ← Trust display
        ├── SyncFeed.jsx               ← Event log
        ├── FieldDecisionTable.jsx     ← WMV outcomes
        ├── PatientRecordViewer.jsx    ← Golden record
        ├── TrustEvolutionChart.jsx    ← Charts
        └── RiskTierBadge.jsx          ← Badge component
```

## 🎓 Documentation by Audience

### For Students Learning the Project
1. QUICKSTART.md — Get it running
2. README.md "Project Overview" — Understand the concept
3. README.md "Three Scenarios" — See each scenario explained
4. Project structure — Navigate the code

### For Professors/Reviewers
1. README.md "Academic Contributions" — See the innovation
2. README.md "Trust Formula Reference" — Understand the math
3. Run the 3 scenarios live
4. Ask questions about specific components

### For Future Developers
1. PROJECT_STRUCTURE.md — Understand organization
2. backend/server.js — API contracts
3. Inline code comments — Implementation details
4. API_TESTING.md — Test while developing

### For System Administrators
1. README.md "Deployment" section (if needed)
2. API_TESTING.md — Monitoring endpoints
3. backend/.env.example — Configuration
4. Logging in backend/server.js

## 🔍 Quick Lookup Table

| Need | File | Section |
|------|------|---------|
| Get started in 5 min | QUICKSTART.md | — |
| Understand architecture | README.md | Tech Stack, Architecture |
| Run first demo | QUICKSTART.md | Step 5 |
| Learn the math | README.md | Trust Formula Reference |
| See scenarios explained | README.md | Understanding the Scenarios |
| Test with cURL | API_TESTING.md | — |
| Find a specific file | PROJECT_STRUCTURE.md | Directory Layout |
| Customize scenarios | README.md | Customization |
| Present to professor | QUICKSTART.md + live demo | — |

## 📊 Documentation Statistics

| File | Lines | Purpose |
|------|-------|---------|
| README.md | 650+ | Complete guide |
| PROJECT_STRUCTURE.md | 400+ | File organization |
| QUICKSTART.md | 250+ | Getting started |
| API_TESTING.md | 200+ | Testing guide |
| **Total Docs** | **1,500+** | Comprehensive |

## ✅ Pre-Presentation Checklist

- [ ] Read QUICKSTART.md (understand steps)
- [ ] Run setup.bat or npm install manually
- [ ] Start backend (`npm start` in backend/)
- [ ] Start frontend (`npm run dev` in frontend/)
- [ ] Test Scenario 1: Normal (should see <1% rejection)
- [ ] Test Scenario 2: Attack (should see ~85% rejection)
- [ ] Test Scenario 3: Laundering (should see attack fail!)
- [ ] Skim README.md for talking points
- [ ] Practice your 2-minute overview
- [ ] Note the key insight: "λ_f = 0.05 defeats laundering"

## 🚀 Common Tasks & Where to Find Help

### "How do I start the project?"
→ QUICKSTART.md

### "What does this file do?"
→ PROJECT_STRUCTURE.md (file list with purposes)

### "How do I test the API?"
→ API_TESTING.md

### "How does the trust formula work?"
→ README.md "Trust Formula Reference" section

### "How do I customize scenarios?"
→ README.md "Customization" or PROJECT_STRUCTURE.md

### "What should I tell my professor?"
→ QUICKSTART.md "For Your Professor" section

### "The project isn't working!"
→ QUICKSTART.md "Troubleshooting" or README.md "FAQ"

### "I want to deploy this for real"
→ README.md (mentions CouchDB replacement options)

### "How do the 3 scenarios differ?"
→ README.md "Understanding the Scenarios" (very detailed)

---

## 🎯 Navigation Tips

**Save this as your bookmark:**
- **Getting started?** → QUICKSTART.md
- **Learning?** → README.md
- **Exploring code?** → PROJECT_STRUCTURE.md
- **Testing API?** → API_TESTING.md

**Pro tip:** Open all 4 files in your editor for quick reference while developing/presenting.

---

**📚 All documentation is written for clarity and accessibility. No prior knowledge assumed. Good luck! 🏥**
