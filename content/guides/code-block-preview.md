---
title: Code Block Preview
navTitle: Code Block Preview
description: Preview page for checking the code block header, copy button, syntax highlighting, and spacing.
order: 3
group: guides
groupTitle: Guides
tags:
  - code
  - preview
---

## TypeScript example

```ts
type User = {
  id: number
  name: string
  role: "admin" | "editor" | "viewer"
}

function canEdit(user: User) {
  return user.role === "admin" || user.role === "editor"
}

const currentUser: User = {
  id: 1,
  name: "Farrux",
  role: "admin",
}

console.log(canEdit(currentUser))
```

## Bash example

```bash
npm install
npm run dev
npm run build
```

## JSON example

```json
{
  "name": "atlas-docs",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build"
  }
}
```

## Longer block

```javascript
async function createSession(userId) {
  const session = {
    id: crypto.randomUUID(),
    userId,
    createdAt: new Date().toISOString(),
    permissions: ["read", "write", "publish"],
  }

  const response = await fetch("/api/sessions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(session),
  })

  if (!response.ok) {
    throw new Error("Failed to create session")
  }

  return response.json()
}
```
