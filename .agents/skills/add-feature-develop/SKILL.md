---
name: add-feature-develop
description: Add or update Domilix product features using the repository workflow, preparing changes for the develop branch and pushing to develop only when explicitly requested. Use when asked to add a feature, implement a new feature, finish feature work, or prepare/push feature changes to develop.
---

# Add Feature On Develop

## Purpose

Use this skill when the user asks to add, update, or finish a product feature in Domilix and wants the work prepared for the `develop` branch.

## When To Use This Skill

- Adding frontend features in `domilix.com`.
- Adding backend features in `backend`.
- Updating shared API contracts, types, or services for a feature.
- Preparing feature work for `develop`.
- Pushing feature work to `develop` when the user explicitly requests it.

## Branch Workflow

- Check the current branch before editing.
- Prefer working from `develop` for feature work.
- If currently on another branch, ask before switching when there are uncommitted changes.
- Never discard local changes.
- Never use destructive Git commands.

## Implementation Workflow

- Inspect the relevant frontend/backend files before editing.
- Make the smallest correct change.
- Preserve existing design patterns unless the user explicitly asks for redesign.
- Keep API changes backward compatible only when there is a real external/persisted dependency.
- Update frontend types/services when backend response shapes change.
- Add user-facing French copy when the surrounding UI is French.
- Prefer non-blocking backend side effects for notifications, emails, thumbnails, and analytics.

## Verification

- For frontend changes, run `npm run build` from `domilix.com` when feasible.
- For backend changes, run `pnpm build` from `backend` when dependencies are installed.
- If backend dependencies are missing locally, state that verification could not run and include the exact error.
- For deployment/config changes, inspect the relevant workflow or compose diff.

## Commit And Push Policy

- Only commit when the user explicitly asks to commit or push.
- Only push when the user explicitly asks to push.
- When pushing feature work, push to `develop` by default unless the user names another branch.
- Before pushing, run:
  - `git status --short --branch`
  - `git diff`
  - `git log --oneline --decorate -5`
- Do not include unrelated changes in the commit.
- Do not include secrets or environment files.
- Use concise commit messages focused on the feature outcome.

## Deployment Awareness

- Production deploys are tied to `main`/`master` workflows unless configured otherwise.
- Pushing to `develop` should be treated as staging/integration work, not production deployment, unless workflows explicitly deploy `develop`.
- If the user wants `develop` to deploy automatically, verify GitHub Actions first and update workflows deliberately.
