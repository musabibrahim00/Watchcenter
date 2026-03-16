Enhance the Workflows module by introducing AI Run Diagnostics to automatically analyze workflow execution failures and provide actionable fixes.

Important constraints:
- Do not change the current UI design system, colors, or card styles.
- Preserve the existing layout with the workflow preview in the center and AiBox on the right.
- Extend the existing workflow run and debugging experience rather than redesigning it.

The goal is to transform workflow debugging into an AI-assisted diagnostic process.

---

SECTION 1 — ADD RUN DIAGNOSTICS PANEL

When a workflow run fails or produces warnings, automatically display a new section above the execution logs.

Title:
AI Run Diagnostics

This panel should summarize the issue clearly.

Example:

Workflow Failure Detected

Step  
Create Jira Ticket

Reason  
Jira API authentication token expired

Impact  
Case creation failed and escalation workflow stopped.

Suggested Fix  
Reconnect Jira integration or refresh authentication token.

Actions:
Retry Step  
Open Integration Settings  
Ask AI

---

SECTION 2 — STEP-LEVEL FAILURE ANALYSIS

Each failed step in the run timeline should support AI diagnostics.

When clicking a failed step, the system should show:

Failure summary  
Probable root cause  
Suggested fixes

Example:

Step Failure Analysis

Step  
Slack Notification

Issue  
Slack API returned timeout error.

Possible Causes  
Network latency  
Slack API rate limit  
Incorrect webhook configuration

Suggested Fixes  
Retry with exponential backoff  
Add fallback email notification  
Verify Slack webhook URL

---

SECTION 3 — AI TROUBLESHOOT ACTION

Add a Troubleshoot action inside the Workflow Agent panel.

When activated, AI should:

Analyze the entire workflow execution history  
Detect recurring failure patterns  
Recommend structural improvements

Example output:

AI Troubleshooting Results

Detected Issues
Slack notification failures occurred in 3 runs.

Suggested Improvements
Add retry logic for Slack step.  
Add fallback notification channel.

Actions
Apply Retry Logic  
Add Email Fallback  
Ignore

---

SECTION 4 — ADD AUTOMATIC FAILURE INSIGHTS

Below the workflow runs table, show a small insights block summarizing historical problems.

Example:

Execution Insights

Failure rate: 3%  
Most common failure: Slack notification  
Slowest step: SOC approval (average 8 minutes)

AI Suggestions

Add escalation after 30 minutes.  
Add retry logic for Slack failures.

Each suggestion should include an Apply action.

---

SECTION 5 — ADD SELF-HEALING WORKFLOW SUGGESTIONS

When AI detects recurring failures, it should recommend automatic improvements.

Example:

Self-Healing Recommendation

Slack notification failed multiple times.

Suggested Fix
Add retry logic with 3 attempts and exponential delay.

Buttons

Apply Fix  
Ignore

Applying the fix updates the workflow preview.

---

SECTION 6 — IMPROVE RUN TIMELINE

Enhance the run timeline to clearly display execution results.

Each step should show status icons:

Success  
Running  
Failed  
Waiting

Example timeline:

00:00 Trigger received  
00:01 Alert enriched  
00:03 Case created  
00:05 Slack notification failed  
00:05 Workflow stopped

Failed steps should highlight with a warning color and open AI diagnostics when clicked.

---

SECTION 7 — ADD ASK AI ABOUT THIS RUN

Inside the run details page, add an action:

Ask AI About This Run

Users can ask:

Why did this workflow fail?  
Which step caused the delay?  
How can this workflow be improved?

AI should analyze run logs and respond contextually.

---

SECTION 8 — IMPROVE WORKFLOW INTELLIGENCE

Extend the Workflow Intelligence section to include execution health.

Example:

Workflow Health

Runs this week: 42  
Failure rate: 2%  
Average runtime: 2m 13s

Detected Issues
Approval bottleneck detected.

AI Suggestions
Add escalation if approval exceeds 30 minutes.

---

SECTION 9 — FINAL RESULT

After this improvement:

Workflow failures become easy to understand.  
AI automatically diagnoses execution problems.  
Users receive actionable fixes instead of raw logs.  
The system evolves toward self-healing automation.