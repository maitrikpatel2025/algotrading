# Bug: Worktree Creation Fails When Branch Already Checked Out

## Metadata
issue_number: `na`
adw_id: `na`
issue_json: `na`

## Bug Description
When ADW attempts to create an isolated git worktree using `create_worktree()`, the operation fails with the error:
```
❌ Error creating worktree: Failed to create worktree: Preparing worktree (checking out 'bug-issue-16-adw-9b5593f7-fix-trade-history-api')
fatal: 'bug-issue-16-adw-9b5593f7-fix-trade-history-api' is already used by worktree at '/home/ubuntu/Algotrading'
```

**Expected behavior:** ADW should gracefully handle scenarios where the branch is already checked out elsewhere by either:
1. Detecting the conflict and providing a clear, actionable error message
2. Reusing the existing worktree if it's valid for the current ADW ID

**Actual behavior:** The workflow fails with a cryptic git error, leaving the user unsure how to proceed.

## Problem Statement
Git worktrees cannot share the same branch - if a branch is already checked out in the main repository or another worktree, attempting to create a new worktree that checks out that same branch will fail. The current `create_worktree()` function does not detect or handle this edge case before attempting the git operation.

## Solution Statement
Modify the `create_worktree()` function in `worktree_ops.py` to:
1. Add a helper function to check if a branch is already checked out in any worktree
2. Before creating a worktree, check if the target branch is already in use
3. If the branch is in use, provide a clear error message indicating which worktree has it and how to resolve
4. Improve error handling to detect the specific "already used by worktree" error and return actionable guidance

## Steps to Reproduce
1. Have the main repository (or another worktree) checked out to branch `bug-issue-16-adw-8473b82f-fix-trade-history-api`
2. Run an ADW workflow that tries to create a worktree for that same branch:
   ```bash
   cd adws/
   uv run adw_plan_iso.py 16 8473b82f
   ```
3. Observe the error: `fatal: 'bug-issue-16-adw-8473b82f-fix-trade-history-api' is already used by worktree`

## Root Cause Analysis
The `create_worktree()` function in `adws/adw_modules/worktree_ops.py` (lines 15-72) uses `git worktree add -b <branch_name> <path> origin/main` to create a worktree. Git prohibits having the same branch checked out in multiple worktrees simultaneously.

The current error handling (lines 60-69) only checks for "already exists" in stderr and retries without `-b`, but this doesn't help when the branch exists AND is checked out elsewhere. The specific error "is already used by worktree" is not detected or handled.

Scenarios that trigger this bug:
1. User manually checked out the ADW branch in the main repo
2. A previous ADW run was interrupted and left the main repo on that branch
3. Running ADW on two machines with synced repos where both try to use the same branch

## Relevant Files
Use these files to fix the bug:

- `adws/adw_modules/worktree_ops.py` - Contains the `create_worktree()` function (lines 15-72) that needs to be fixed to detect and handle branch conflicts before attempting git operations. This is the primary file to modify.
- `adws/adw_plan_iso.py` - Entry point workflow that calls `create_worktree()` at line 182. May need to handle new error types for better user feedback.
- `adws/adw_patch_iso.py` - Another entry point that creates worktrees. Should be checked for consistency with error handling.
- `adws/README.md` - Should document the new error scenario in the Troubleshooting section.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Add helper function to detect branch checkout conflicts
- In `adws/adw_modules/worktree_ops.py`, add a new function `get_branch_worktree(branch_name: str) -> Optional[str]`
- Run `git worktree list --porcelain` and parse the output to find which worktree (if any) has the given branch checked out
- Return the worktree path if the branch is checked out, or `None` if not
- The porcelain format outputs blocks like:
  ```
  worktree /path/to/worktree
  HEAD abc123
  branch refs/heads/branch-name
  ```

### 2. Update create_worktree to check for conflicts before git operations
- At the beginning of `create_worktree()`, after checking if the worktree directory exists
- Call `get_branch_worktree(branch_name)` to check if the branch is already in use
- If the branch is in use by another worktree:
  - Log a warning with the conflicting worktree path
  - Return `(None, f"Branch '{branch_name}' is already checked out at '{conflicting_path}'. Please switch that worktree to a different branch (e.g., 'git checkout main') or remove it with 'git worktree remove {conflicting_path}'")`

### 3. Improve error detection for the fallback case
- Update the error handling block (lines 60-69) to also check for "is already used by worktree" in the error message
- If this specific error is detected, parse out the conflicting path from the error message
- Return a more helpful error message that includes resolution steps

### 4. Update README troubleshooting documentation
- Add a new entry under "Common Errors" in `adws/README.md`
- Document the "Branch already used by worktree" error
- Provide clear resolution steps: switch to main branch or remove the conflicting worktree

### 5. Run validation commands
- Execute all validation commands to ensure zero regressions

## Validation Commands
Execute every command to validate the bug is fixed with zero regressions.

- `cd /Users/maitrikpatel/Documents/Automate With Maitrik/Algotrading && git worktree list` - Check current worktree state
- `cd /Users/maitrikpatel/Documents/Automate With Maitrik/Algotrading && git checkout main` - Switch to main to clear any branch conflicts
- `cd /Users/maitrikpatel/Documents/Automate With Maitrik/Algotrading/adws && uv run python -c "from adw_modules.worktree_ops import get_branch_worktree; print('main branch at:', get_branch_worktree('main'))"` - Test the new helper function works
- `cd app/server && uv run pytest` - Run server tests to validate the bug is fixed with zero regressions
- `cd app/client && npm run build` - Run frontend build to validate the bug is fixed with zero regressions

## Notes
- Git worktrees are fundamentally designed to prevent having the same branch checked out in multiple places. This is intentional git behavior to prevent conflicts.
- The fix prioritizes providing clear, actionable error messages rather than automatic resolution, since automatic switching could cause loss of uncommitted work.
- The `git worktree list --porcelain` format is stable and machine-parseable, making it the right choice for programmatic detection.
- This bug does not affect the UI - it's purely an ADW infrastructure issue, so no E2E tests are needed.
