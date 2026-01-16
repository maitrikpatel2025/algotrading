# Install & Prime

## Read
- `./app/server/env.example` (never read .env)
- `./app/client/env.example` (never read .env)
- `./app/bot/env.example` (never read .env)
- `./app/README.md`

## Run
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

## Report
- Output the work you've just done in a concise bullet point list.
- Instruct the user to fill out `./app/server/.env` based on `./app/server/env.example` with their OpenFX API credentials and Supabase configuration (SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY).
- Instruct the user to verify `./app/client/.env` exists (it should have been created with default API URL settings).
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
