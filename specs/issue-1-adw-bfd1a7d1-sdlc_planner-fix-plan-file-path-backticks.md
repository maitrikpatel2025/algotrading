# Bug: Plan File Path Contains Backticks Causing Validation Failure

## Metadata
issue_number: `1`
adw_id: `bfd1a7d1`
issue_json: `{"number":1,"title":"Account Management - Open Trades & Order History","body":"Using adw_plan_build_review\n\n/feature \n\nImplement Account Page with Open Trades & Order History\n\nI want to view my open trades and complete transaction trade history on a dedicated Account page\n\nFor back end you need to create end points\n\nMake sure for the frontend styling is used the style guide and keep the style consistent"}`

## Bug Description
The ADW plan phase fails with error "Plan file does not exist" even though the plan file was successfully created. The symptom is:

```
Plan file does not exist: `specs/issue-1-adw-bfd1a7d1-sdlc_planner-account-open-trades-order-history.md`
```

Notice the backticks (`) around the file path. The actual file exists at `specs/issue-1-adw-bfd1a7d1-sdlc_planner-account-open-trades-order-history.md` (without backticks), but the path validation is checking for a path that includes the literal backtick characters.

## Problem Statement
When the sdlc_planner agent returns the plan file path, it wraps it in markdown backticks (e.g., `` `specs/path.md` ``). The `adw_plan.py` script's `build_plan` function receives this response and calls `.strip()` on it, which removes whitespace but not the backticks. Subsequently, `os.path.exists()` fails because the path string contains backtick characters that are not part of the actual filesystem path.

## Solution Statement
Strip backticks from the plan file path returned by the `build_plan` function in `adw_plan.py`. After calling `.strip()` on the response output, also strip any surrounding backticks using `.strip('`')` to ensure the path is clean for filesystem validation.

## Steps to Reproduce
1. Run `uv run adws/adw_plan_build_review.py 1`
2. Observe the ADW plan phase classifies the issue and generates a branch
3. Observe the implementation plan is created successfully
4. Observe the plan phase fails with: "Plan file does not exist: `specs/issue-1-adw-bfd1a7d1-sdlc_planner-account-open-trades-order-history.md`"
5. Verify the file actually exists at `specs/issue-1-adw-bfd1a7d1-sdlc_planner-account-open-trades-order-history.md` (without backticks)

## Root Cause Analysis
The root cause is a mismatch between the expected format of the sdlc_planner output and how it's processed:

1. The sdlc_planner agent (via `/feature` command) returns the plan file path wrapped in markdown backticks for formatting: `` `specs/issue-1-adw-bfd1a7d1-sdlc_planner-account-open-trades-order-history.md` ``
2. In `adw_plan.py` at line 200, the code does: `plan_file_path = plan_response.output.strip()`
3. The `.strip()` method only removes whitespace, not backticks
4. At line 212, `os.path.exists(plan_file_path)` checks for a path that literally contains backtick characters
5. This file doesn't exist (because the actual file has no backticks in its name), so the validation fails

The evidence from `agents/bfd1a7d1/sdlc_planner/raw_output.json` confirms the result was:
```
`specs/issue-1-adw-bfd1a7d1-sdlc_planner-account-open-trades-order-history.md`
```

## Relevant Files
Use these files to fix the bug:

- `adws/adw_plan.py` - The main ADW plan script where the bug occurs. Line 200 needs to strip backticks from the plan file path after stripping whitespace.
- `agents/bfd1a7d1/sdlc_planner/raw_output.json` - Contains evidence of the backtick-wrapped output (for reference/debugging)

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### Step 1: Read the affected file
- Read `adws/adw_plan.py` to understand the current implementation
- Locate line 200 where `plan_file_path = plan_response.output.strip()` is called

### Step 2: Fix the plan file path extraction
- Edit `adws/adw_plan.py` at line 200
- Change from: `plan_file_path = plan_response.output.strip()`
- Change to: `plan_file_path = plan_response.output.strip().strip('`')`
- This will first strip whitespace, then strip any surrounding backticks

### Step 3: Run Validation Commands
- Execute all validation commands to ensure the bug is fixed with zero regressions

## Validation Commands
Execute every command to validate the bug is fixed with zero regressions.

- `cd app/server && uv run pytest` - Run server tests to validate the bug is fixed with zero regressions
- `cd app/client && npm run build` - Run frontend build to validate the bug is fixed with zero regressions

## Notes
- This is a minimal, surgical fix that addresses the immediate bug
- The fix uses Python's built-in string `.strip()` method which can accept characters to strip
- Chaining `.strip().strip('`')` first removes whitespace then removes backticks from both ends
- An alternative approach would be to modify the sdlc_planner prompt to not include backticks, but fixing the consumer is more defensive and handles edge cases
- Consider adding a utility function in `adw_modules/utils.py` for path extraction if this pattern appears elsewhere
