Connect Watch Center AI recommendations with the Case Management module.

Do not redesign any screens.

Reuse the existing Case Management layouts exactly as shown in the attached screenshots.

---

TRIGGER POINT

Inside Watch Center AI Box there are actions:

Investigate  
Create Case  
View Details

When a user clicks Create Case, automatically create a new case inside Case Management.

---

CASE CREATION

When a case is created from Watch Center AI, automatically populate the following fields.

Case Title  
Use the AI recommendation title.

Example:

"Block lateral movement to domain controller"

Severity  
Use the severity from the AI recommendation.

Example:

Critical / High / Medium

Category  
Auto-detect based on recommendation type.

Examples:

Identity Breach  
Privilege Escalation  
Public Exposure  
Data Exfiltration  
Configuration Drift

Owner  
Default owner = System

Status  
Open

Resolution State  
Case Assigned

---

CASE CONTEXT

Attach investigation context from Watch Center.

Store the following metadata in the case:

attackPathId  
affectedAssets  
threatSource  
recommendedAction  
confidenceScore  
analystInsight

Example context:

Attack Path: internet-facing → EC2 → database  
Threat: lateral movement path detected  
Confidence: 94%

---

OPEN CASE DETAIL PAGE

After the case is created:

Navigate directly to the Case Detail page.

Open the Case Investigation tab.

Do not open the cases list first.

---

AUTO-GENERATE PLAYBOOKS

Populate the Recommended Playbooks section automatically based on the AI recommendation.

Examples:

Disable compromised IAM user  
Enable MFA enforcement  
Block IP in firewall ACL  
Rotate credentials  
Enable CloudTrail logging  
Isolate compromised host

Display these playbooks exactly using the playbook card UI shown in the screenshots.

---

AUTO-GENERATE FIRST OBSERVATION

Create the first observation entry automatically.

Example text:

AI Insight from Watch Center

"A multi-hop lateral movement path was detected from an internet-facing asset to a critical database. Immediate containment is recommended."

Timestamp = case creation time.

---

ACTION BUTTONS FROM AI INSIGHT

Inside the observation card show suggested quick actions.

Examples:

Disable User Account  
Escalate Case to Tier-2 Analyst  
Isolate Host  
Block Source IP

These actions should trigger workflows or playbooks.

---

BACK NAVIGATION

If the user clicks back from the Case Detail page:

Return them to the Watch Center screen they came from.

Do not redirect to the Cases list.

---

IMPORTANT

Do not modify the Case Management UI.

Reuse the exact structure from the screenshots:

Dashboard  
Cases list  
Case Investigation  
Case Reporting  
Playbooks  
Observations  
Modals

Only implement the integration logic.