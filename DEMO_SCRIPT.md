# Watch Center — Stakeholder Demo Script
### 5–7 minutes · Confident · No jargon

---

## BEFORE YOU START

**Tab open:** Watch Center (main dashboard)
**Cursor position:** Resting near the INSIGHTS panel
**Know your exit:** If anything breaks → jump straight to Section 9 (Backup Path)

---

---

## SECTION 1 — OPENING (0:00–0:30)

### What to say

> "Security teams are drowning in alerts. The average analyst sees 500 signals a day. The real problem isn't detection — it's knowing what actually matters right now, and what to do about it."

> "Watch Center solves that. It's not a dashboard. It's a command center where eight AI analysts work continuously, surface what matters, and help your team act — fast."

### What stakeholders understand
- This is not a SIEM
- The problem is prioritization + action, not more data
- There are AI agents doing real work

---

---

## SECTION 2 — WATCH CENTER: WHAT'S HAPPENING NOW (0:30–1:30)

### What to say

> "This is Watch Center. When your team opens this in the morning — or at 2am during an incident — this is the view."

### What to click / point to

**Point to the globe (center)**
> "These eight orbs are your AI analysts. Each one covers a domain — vulnerabilities, identity, exposure, configuration, compliance, and more. They're running continuously. Right now, in real time."

**Point to ACTIVITY panel (top left)**
> "On the left, you see what agents are doing right now. Exposure Analyst identified an attack path. Asset Intelligence just scanned a new cloud subnet. This isn't a log. It's a live feed."

**Point to INSIGHTS panel (middle left)**
> "Below that — Insights. This is the signal layer. Not 500 alerts. Three signals that need your attention right now."

**Point to the CRIT signal:**
> "Lateral movement confirmed to finance-db-01. Domain credentials at risk."

**Point to the HIGH signals:**
> "Three crown jewel assets exposed. TLS certificate expiring in under 72 hours."

> "Every signal is clickable. We'll use that in a moment."

**Point to RISK TRACKER (bottom)**
> "At the bottom — required interventions. These aren't suggestions. They're fully analyzed, ready-to-authorize actions. The AI did the work. Your team makes the call."

### What stakeholders understand
- Continuous AI coverage across 8 domains
- Instant prioritization — not raw alerts
- Human decision stays in the loop

---

---

## SECTION 3 — INVESTIGATE A RISK (1:30–2:30)

### What to say

> "Let's follow one of these risks all the way through."

### What to click

**Click on the Exposure Analyst orb on the globe**

> "This is the Exposure Analyst. It maps attack paths — how an attacker could move from an initial foothold to a crown jewel asset."

**You land on the Agent Detail page for Foxtrot**

> "This is the agent's workspace. You see exactly what it found, what it's monitoring, and what it recommends."

**Point to the Insights section**
> "It identified a 3-hop lateral movement path to the domain controller. Confirmed. Not simulated — confirmed."

**Point to the Impact metrics**
> "47 attack paths identified this week. 18 lateral movement risks. 198 analyst hours saved — that's time your team didn't spend correlating logs manually."

### What stakeholders understand
- Agents have persistent, specialized knowledge
- You can inspect any agent at any time
- Data is specific and traceable

---

---

## SECTION 4 — AGENT SKILLS + AIBOX (2:30–4:00)

### What to say

> "Now here's where it gets interesting. Each analyst has a set of skills — structured ways you can interact with it."

### What to click

**Point to the skill chips below the agent header**

> "These are the agent's capabilities. You're not typing free-form into a black box. You're directing a specialist."

**Click "Explain findings"**

> "Let's ask it to explain what it found."

---

### AI MOMENT 1 — Explain Findings

**Prompt used:**
> `Explain your current findings for Exposure Analyst`

**Expected response shown in AIBox:**

> _"I've identified a confirmed lateral movement path from compromised jump server (jump-srv-02) to domain controller (corp-dc-01) in 3 hops. The path exploits a misconfigured trust relationship on the engineering subnet. Domain admin credentials are reachable. Additionally, I've mapped an internet-facing exposure path to finance-db-01 through a misconfigured API gateway — the same asset flagged by Vulnerability Analyst."_

**What to say over the response:**
> "It's not summarizing a log file. It's synthesizing findings across asset inventory, network topology, and threat intelligence."

---

**Now click "Lateral movement risk"**

> "Let's go deeper. I want to understand the blast radius."

---

### AI MOMENT 2 — Lateral Movement Risk

**Prompt used:**
> `What is the lateral movement risk to corp-dc-01?`

**Expected response shown in AIBox:**

> _"The path to corp-dc-01 runs: WKS-0447 (compromised endpoint, C2 beacon active) → jump-srv-02 (misconfigured trust) → corp-dc-01 (domain admin accessible). If domain credentials are compromised, all 8 agents' managed assets are reachable. Estimated blast radius: 400+ endpoints, 12 source code repositories, 3 financial systems. Recommended action: block the trust relationship on jump-srv-02 and isolate WKS-0447 immediately."_

**What to say:**
> "It told us the path, the blast radius, and exactly what to do. That's the difference between an alert and an answer."

---

**Now click "Re-run analysis"**

> "What if I want to challenge the assumption? What if I think the risk is being overstated?"

---

### AI MOMENT 3 — Re-run with New Assumptions

**Prompt used:**
> `Re-run analysis assuming jump-srv-02 is already patched`

**Expected response shown in AIBox:**

> _"Rerunning with jump-srv-02 patched: the 3-hop path via jump-srv-02 is closed. However, a secondary 4-hop path remains via corp-vpn-gateway-01 through a shared service account with no MFA enforcement. Domain admin is still reachable. Blast radius reduces by ~35%, but the core risk remains. Recommend also addressing the shared service account on Identity Security's open findings."_

**What to say:**
> "You can test your own assumptions. Change the lens on any finding. The analyst adapts, doesn't just replay the same result."

### What stakeholders understand
- Skills are structured — not a chatbot
- Re-run enables 'what if' analysis without rebuilding a query
- AI explains its reasoning, not just its output

---

---

## SECTION 5 — THE WOW MOMENT: AI EXPLAINS → RECOMMENDS → USER ACTS (4:00–5:00)

### What to say

> "Now let's close the loop. Back to Watch Center."

### What to click

**Navigate back to Watch Center (click back arrow or sidebar)**

**Scroll to the Risk Tracker at the bottom**

**Point to task 2: "Block lateral movement to domain controller"**

> "The Exposure Analyst found the attack path. The Risk Intelligence Analyst correlated it with active threat signals. The system prepared this action — ready to authorize."

**Expand the task card**

> "High confidence. Expected outcome: lateral movement path blocked — domain-wide compromise surface eliminated. Risk if deferred: domain admin reachability window stays open."

> "One click."

**Click "Authorize"**

> "That's it. The action is queued. The agent will monitor the outcome and surface a new state within minutes."

**Point to pipeline stage indicator**

> "It moves from 'awaiting authorization' to 'executing'. Your team authorized it. The agent tracks it."

---

### This is the WOW moment

**The sequence:**
1. **Exposure Analyst explained** → lateral movement path, 3 hops, domain admin reachable
2. **AIBox recommended** → block trust relationship on jump-srv-02, isolate WKS-0447
3. **User authorized** → single click, no ticket, no runbook hunting

**What to say:**
> "This is what shifts your team from reactive to decisive. The AI did the analysis. You made the call. The system executes and monitors."

### What stakeholders understand
- Human authorization is never removed from the loop
- Action is prepared — not just suggested
- The cycle from signal → analysis → authorization takes minutes, not hours

---

---

## SECTION 6 — CLOSE LOOP: OUTCOME + MONITORING (5:00–5:30)

### What to say

> "After authorization, Watch Center doesn't go quiet."

### What to click / point to

**Point to INSIGHTS panel, MTTD/MTTR row**
> "Mean time to detect: 3.6 hours. Mean time to respond: 1.2 hours. SLA compliance: 98.7%. These are live."

**Point to the Investigation Timeline (bottom of left panel)**
> "Every action is tracked. When it was detected, who authorized it, what the outcome was. Full audit trail — no manual logging."

**Point to ACTIVITY feed ticking**
> "And the agents keep working. New signals surface. New paths get mapped. The system doesn't stop when you leave."

### What stakeholders understand
- Full traceability from detection to resolution
- Live performance metrics, not weekly reports
- Continuous coverage — not point-in-time scans

---

---

## SECTION 7 — CLOSING (5:30–6:00)

### What to say

> "Your team gets attacked at 2am on a Friday. Right now, that means on-call pages, manual log correlation, three Slack threads, and a decision made by someone who hasn't slept."

> "With Watch Center: one screen tells you what happened, what it means, and what to do about it. The AI has already done the work."

> "You're not replacing your analysts. You're giving them an unfair advantage."

### Three closing points

1. **What problem is solved:** Analysts spend 70% of their time on triage and context-gathering. Watch Center eliminates that.
2. **What value is delivered:** High-confidence, pre-analyzed actions ready to authorize — in minutes, not hours.
3. **Why it matters:** Crown jewel assets are protected by decisions made faster, with better information, by fewer people.

---

---

## SECTION 8 — COMMON QUESTIONS

**Q: How is this different from a SIEM?**
> "A SIEM collects and stores events. Watch Center acts on them. SIEMs tell you what happened. Watch Center tells you what it means, what's at risk, and what to do. They can coexist — we ingest from SIEMs."

**Q: Is this automated? Does it take action on its own?**
> "No. Agents analyze and prepare actions. Authorization is always human. The system will never execute anything you haven't approved."

**Q: Where does the data come from?**
> "Agents connect to your existing stack — EDR, CSPM, SAST, identity providers, CMDB, vulnerability scanners. We don't replace them. We sit on top."

**Q: How does the AI work?**
> "Each agent is a specialized model trained for its domain — not a general chatbot. They run continuously, correlate signals across sources, and communicate findings through a shared risk layer. The AIBox is how your analysts query them directly."

---

---

## SECTION 9 — BACKUP PATH

### If the globe doesn't load
> "The agents are continuously running in the background — let me show you the findings directly."
→ Navigate to `/agent/foxtrot` directly from the URL bar
→ Continue from Section 3

### If the Agent Detail page is blank
> "Let me pull up the findings another way."
→ Go back to Watch Center → click the INSIGHTS signal "Lateral movement confirmed to finance-db-01"
→ This injects the query into AIBox
→ Continue from Section 4 using AIBox directly

### If AIBox doesn't respond
> "The key thing here is the structure of how the team works — let me walk through the risk tracker instead."
→ Scroll to Risk Tracker at the bottom
→ Expand task cards and walk through confidence, expected outcome, and risk-if-deferred fields
→ Authorize a task to show the action flow
→ Jump to Section 5 talking points

### If the Authorize button doesn't respond
> "We track the full authorization lifecycle — let me show you the audit trail."
→ Point to the pipeline stage label on the task card
→ Describe the stages: detected → analyzed → prepared → awaiting authorization → executing → monitoring
→ Move to Section 6

---

---

## APPENDIX A — AI PROMPTS USED

| # | Prompt | Where | Skill |
|---|--------|-------|-------|
| 1 | "Explain your current findings for Exposure Analyst" | Agent Detail → AIBox | Explain findings |
| 2 | "What is the lateral movement risk to corp-dc-01?" | Agent Detail → AIBox | Lateral movement risk |
| 3 | "Re-run analysis assuming jump-srv-02 is already patched" | Agent Detail → AIBox | Re-run analysis |
| 4 | [Click INSIGHTS signal] "Lateral movement confirmed to finance-db-01" | Watch Center INSIGHTS → AIBox | Auto-injected |

---

## APPENDIX B — EXPECTED AI RESPONSES (SUMMARY)

**Explain findings:**
Confirms 3-hop path to corp-dc-01. Links to finance-db-01 exposure via API gateway misconfiguration.

**Lateral movement risk:**
Path: WKS-0447 → jump-srv-02 → corp-dc-01. Blast radius: 400+ endpoints, 12 repos, 3 financial systems. Recommends: block trust relationship + isolate workstation.

**Re-run with new assumptions:**
jump-srv-02 patched closes primary path. Secondary 4-hop path via corp-vpn-gateway-01 remains. 35% blast radius reduction. Risk not eliminated — shared service account with no MFA still open.

---

## APPENDIX C — KEY TALKING POINTS

1. Eight AI analysts running continuously — not scans on a schedule
2. Signal layer: 3 signals that matter, not 500 alerts
3. Skills are structured interaction — not free-form chatbot prompts
4. Re-run changes the lens — analysts don't just replay results
5. Human authorization never removed from the loop
6. Full audit trail: detected → analyzed → authorized → executed → monitored
7. MTTD 3.6h · MTTR 1.2h · SLA 98.7% — live, not weekly
8. Every agent saves analyst hours — see impact metrics on any agent detail page

---

## APPENDIX D — DEMO TIMING

| Section | Content | Time |
|---------|---------|------|
| 1 | Opening | 0:00–0:30 |
| 2 | Watch Center overview | 0:30–1:30 |
| 3 | Agent Detail | 1:30–2:30 |
| 4 | Skills + AIBox (3 AI moments) | 2:30–4:00 |
| 5 | Wow moment + Authorize | 4:00–5:00 |
| 6 | Close loop + monitoring | 5:00–5:30 |
| 7 | Closing | 5:30–6:00 |
| Q&A buffer | | 6:00–7:00 |
