# SPECIALIZED AI SKILLS

## SKILL: [Skill Name]
* Purpose: [What the skill achieves]
* Logic: [Step-by-step logic for the AI to follow]

## SKILL: Firebase Deployment Routine
* Purpose: Ensure Firebase deployment is properly configured and documented before pushing, and updated afterwards.
* Logic: 
  1. Check if irebase.md contains the necessary configuration info.
  2. If not, prompt the user for the lacking details.
  3. Execute the push to Firebase using the verified info.
  4. Test to ensure the deployment was successful.
  5. Update irebase.md with the tested and validated configuration details.

## SKILL: GitHub Push Routine
* Purpose: Ensure GitHub push is properly configured and handles mismatches (e.g., rebasing, merging) between local directory and remote.
* Logic: 
  1. Check if github.md contains the necessary configuration info.
  2. If not, prompt the user for the lacking details.
  3. Fetch the latest remote changes and check the status of the local working directory against the remote branch.
  4. If there's a mismatch (diverged, local behind, conflicts), prompt the user in plain English with specific options (Merge, Rebase, Overwrite Web, Overwrite Local).
  5. Execute the Git command based on the user's explicit instructions.
  6. Push to GitHub and update github.md with new configuration details if applicable.

## SKILL: Supabase Management Routine
* Purpose: Keep database schemas properly synchronized via migrations and maintain strictly typed front-ends
* Logic:
  1. Check supabase.md for project configuration (e.g., project ID, database URL)
  2. When prompted to migrate: run 
px supabase db push and verify success
  3. When prompted to sync types: run 
px supabase gen types typescript --project-id "[ID]" > types/supabase.ts
  4. Verify the type generation was successful and update any relevant documentation

## SKILL: Resend Email Services
* Purpose: Standardize initialization of Email API services and transactional email wrappers
* Logic:
  1. Check for valid Resend API keys or esend.md configuration in the environment
  2. Inject key into local .env file safely if instructed
  3. Scaffold a reusable sendEmail utility function wrapping the Resend SDK
  4. Use template parameters (To, From, Subject, HTML body) to verify email functionality

## SKILL: Telegram Notifications
* Purpose: Dispatch critical system alerts or CI/CD deployment statuses to a Telegram chat
* Logic:
  1. Verify the presence of TELEGRAM_BOT_TOKEN and DEFAULT_CHAT_ID
  2. Format a concise markdown string detailing the deployment success or error state
  3. Execute an HTTP POST request to the Telegram Bot API to deliver the alert
  4. Log the notification timestamp locally if requested
