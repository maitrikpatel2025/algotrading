# Install & Prime

## Read
- `./app/server/env.example` (never read .env)
- `./app/client/env.example` (never read .env)
- `./app/bot/env.example` (never read .env)
- `./app/README.md`

## Read and Execute
.claude/commands/prime.md

## Run
- Think through each of these steps to make sure you don't miss anything.
- Remove the existing git remote: `git remote remove origin`
- Initialize a new git repository: `git init`
- Make scripts executable: `chmod +x scripts/*.sh`
- Run `./scripts/copy_dot_env.sh` to create .env files from env.example templates
- Install frontend dependencies:
  ```bash
  cd app/client && npm install
  ```
- Install backend dependencies (using UV, fallback to pip):
  ```bash
  cd app/server
  if command -v uv &> /dev/null; then
    uv sync
  else
    pip install -r requirements.txt
  fi
  ```
- Install bot dependencies:
  ```bash
  cd app/bot
  pip install -r requirements.txt
  ```
- On a background process, run `./scripts/start.sh` with 'nohup' or a 'subshell' to start the server so you don't get stuck

## Report
- Output the work you've just done in a concise bullet point list.
- Instruct the user to fill out `./app/server/.env` based on `./app/server/env.example` with their OpenFX API credentials and Supabase configuration (SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY).
- Instruct the user to verify `./app/client/.env` exists (it should have been created with default API URL settings).
- If `./app/bot/.env` does not exist, instruct the user to fill out `./app/bot/.env` based on `./app/bot/env.example`
- Mention the url of the frontend application we can visit based on `scripts/start.sh`
- Mention: 'To setup your Algotrading project with version control, be sure to update the remote repo url and push to a new repo so you have access to git issues and git PRs:
  ```
  git remote add origin <your-new-repo-url>
  git push -u origin main
  ```'
- Mention: 'To start the application, run:
  ```
  ./scripts/start.sh
  ```
  or use the `/start` command.'
- Mention: If you want to upload images to github during the review process setup cloudflare for public image access you can setup your cloudflare environment variables. See env.example for the variables.
