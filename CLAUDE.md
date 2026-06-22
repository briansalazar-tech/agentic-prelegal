# Prelegal Project

## Overview

This is a SaaS product to allow users to draft legal agreements based on templates in the templates directory.
The user can carry out AI chat in order to establish what document they want and how to fill in the fields.
The available documents are covered in the catalog.json file in the project root, included here:

@catalog.json

The current implementation supports all 11 document types via AI chat with full user authentication and document persistence.

## Development process

When instructed to build a feature:
1. Use your Atlassian tools to read the feature instructions from Jira
2. Develop the feature - do not skip any step from the feature-dev 7 step process
3. Thoroughly test the feature with unit tests and integration tests and fix any issues
4. Submit a PR using your github tools

## AI design

When writing code to make calls to LLMs, use your Cerebras skill to use LiteLLM via OpenRouter to the `openrouter/openai/gpt-oss-120b` model with Cerebras as the inference provider. You should use Structured Outputs so that you can interpret the results and populate fields in the legal document.

There is an OPENROUTER_API_KEY in the .env file in the project root.

## Technical design

The entire project should be packaged into a Docker container.  
The backend should be in backend/ and be a uv project, using FastAPI.  
The frontend should be in frontend/  
The database should use SQLLite and be created from scratch each time the Docker container is brought up, allowing for a users table with sign up and sign in.  
Consider statically building the frontend and serving it via FastAPI, if that will work.  
There should be scripts in scripts/ for:  
```bash
# Mac
scripts/start-mac.sh    # Start
scripts/stop-mac.sh     # Stop

# Linux
scripts/start-linux.sh
scripts/stop-linux.sh

# Windows
scripts/start-windows.ps1
scripts/stop-windows.ps1
```
Backend available at http://localhost:8000

## Color Scheme
- Accent Yellow: `#ecad0a`
- Blue Primary: `#209dd7`
- Purple Secondary: `#753991` (submit buttons)
- Dark Navy: `#032147` (headings)
- Gray Text: `#888888`

## Implementation Status

### Completed (PL-4)
- Docker multi-stage build (Node frontend + Python backend)
- FastAPI backend with SQLite (fresh DB each container start)
- Next.js static export served by FastAPI at localhost:8000
- Start/stop scripts for Mac, Linux, Windows
- Fake login page at `/login` — collects display name, stores session in `localStorage`, no backend validation
- Session gate on main page: redirects to `/login` if no session; shows guest name and Log Out in header

### Completed (PL-5)
- AI chat interface replaces manual form for NDA creation
- Uses LiteLLM via OpenRouter with Cerebras inference (gpt-oss-120b model)
- Structured outputs for reliable field extraction from conversation
- Live preview updates as AI extracts fields from chat
- AI greets user, asks questions conversationally, and confirms when complete
- Download button appears when all required fields are gathered

### Completed (PL-6)
- Support for all 11 document types from catalog.json (infrastructure built in PL-5; PL-6 adds tests)
- AI detects document type from user requests and routes accordingly
- Dedicated preview/PDF components for Mutual NDA, Cloud Service Agreement, Pilot Agreement
- Generic preview/PDF components for remaining document types (Design Partner, SLA, Professional Services, Partnership, Software License, DPA, BAA, AI Addendum)
- Auto-focus chat input after sending messages
- AI always asks follow-on questions when more information is needed
- Comprehensive test suite: `documents.test.ts`, `documentConfig.test.ts`, `GenericPreview.test.tsx`, `DocumentPreview.test.tsx`, extended `chat.test.ts` — 199 tests total

### Completed (PL-7)
- Functional user authentication with JWT tokens in HttpOnly cookies
- User signup and signin with email/password (bcrypt password hashing)
- Document persistence - users can save documents to their account
- My Documents modal to view, load, and delete saved documents
- User menu with sign out functionality
- New Document button to start fresh
- Auth context for managing user state across the app
- Protected document save/load endpoints

### Current API Endpoints
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/signin` - Sign in and receive JWT cookie
- `POST /api/auth/signout` - Clear auth cookie
- `GET /api/auth/me` - Get current user info
- `GET /api/documents` - List user's saved documents (auth required)
- `POST /api/documents` - Save new document (auth required)
- `GET /api/documents/{id}` - Get specific document (auth required)
- `PUT /api/documents/{id}` - Update document (auth required)
- `DELETE /api/documents/{id}` - Delete document (auth required)
- `GET /api/chat/greeting` - Get AI greeting
- `POST /api/chat/message` - Send chat message and get AI response
- `GET /api/health` - Health check

## Brian's PRs (briansalazar-tech/agentic-prelegal)

PL-7 features exist in the repo via the upstream reference implementation. Brian's own submitted PRs are:

| PR | Ticket | What Brian implemented |
|----|--------|------------------------|
| #2 | PL-2 | README status update |
| #3 | PL-2 | Legal document templates from CommonPaper |
| #4 | PL-3 | Mutual NDA form prototype page + utility tests |
| #5 | PL-4 | Fake login page (`/login`), session gate on main page, session unit tests |
| #6 | PL-5 | AI chat interface (ChatInterface, chatApi, chat types, backend routes/service, 32 unit tests) |
| #7 | PL-6 | Comprehensive tests for all 11 document types (documents.test.ts, documentConfig.test.ts, GenericPreview.test.tsx, DocumentPreview.test.tsx, extended chat.test.ts — 199 total tests) |

Next ticket to implement: **PL-7** (functional user authentication and document persistence).
