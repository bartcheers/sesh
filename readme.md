# Sesh

Simplified Server-Side Caching for Next.js - A lightweight utility that safely and efficiently
caches server-side queries using browser session scoping and deduplication.

## Demo

[![Watch the demo](https://markdown-videos-api.jorgenkh.no/youtube/gkS55BiAuUY)](https://youtu.be/gkS55BiAuUY)

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Why Sesh?](#why-sesh)
- [Installation](#installation)
- [Usage](#usage)
- [Configuring Cookie Usage](#configuring-cookie-usage)
- [How It Works](#how-it-works)
- [Examples](#examples)
- [FAQ](#faq)
- [License](#license)

## Introduction

Sesh is a utility designed for Next.js developers who want a straightforward, safe, and efficient
way to cache server-side data fetching without the pitfalls of using `unstable_cache` directly. It
leverages browser sessions to scope caching, ensuring fresh data is served when needed and
preventing data leakage across users.

## Features

- **Browser Session-Scoped Caching**: Cache is scoped per browser session to prevent data leakage
  across different users
- **Automatic Cache Invalidation**: Serves fresh data upon page refresh or when the tab regains
  focus
- **Deduplication within Render Cycle**: Uses React's cache function to prevent redundant data
  fetching within the same render cycle
- **Familiar Patterns**: Inspired by popular data-fetching libraries, making it intuitive to adopt
- **Optimized for Next.js**: Allows you to utilize Next.js features like streaming and Suspense
  without worrying about complex caching strategies

## Why Sesh?

Next.js offers powerful caching mechanisms, but they can be complex and risky if misused:

- **`unstable_cache` Risks**: Misusing `unstable_cache` can lead to caching errors, data leakage,
  and serving stale data
- **Fetch Cache Limitations**: The built-in fetch cache doesn't support the latest Next.js features
  without creating endpoints
- **Server Actions Not Ideal for Fetching**: Server Actions are intended for mutations, not data
  fetching

Sesh provides a safe middle ground:

- **Avoids Common Pitfalls**: Prevents typical caching mistakes that can result in severe bugs
- **User-Friendly Escape Hatch**: Users can simply refresh the page to fetch the latest data
- **Leverages New Next.js Features**: Use the latest Next.js capabilities without complex caching
  strategies Installation Install via npm: npm install sesh-cache-helper Or with Yarn: yarn add
  sesh-cache-helper Or with pnpm: pnpm add sesh-cache-helper

Usage Wrap Your Query Functions

```typescript
// queries.ts
import { query } from 'sesh-cache-helper'
import { prisma } from './prismaClient'

export const getUserById = query(
  async (userId: string) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })
    return user
  },
  (userId) => `getUserById-${userId}`
)
```

## Installation

Install via npm:

```bash
npm install sesh-cache-helper
```

Or with Yarn:

```bash
yarn add sesh-cache-helper
```

Or with pnpm:

```bash
pnpm add sesh-cache-helper Usage
```

## Usage

1. Wrap Your Query Functions Use the query function to wrap your asynchronous data-fetching
   functions.

```typescript
// queries.ts
import { query } from 'sesh-cache-helper'
import { prisma } from './prismaClient'

export const getUserById = query(
  async (userId: string) => {
    // Directly query the database using Prisma
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })
    return user
  },
  (userId) => `getUserById-${userId}`
)
```

2. Use in Server Components Call your wrapped query function within your server components.

```typescript
// app/users/[userId]/page.tsx
import { getUserById } from '../../../queries'

export default async function UserPage({ params }) {
  const user = await getUserById(params.userId)

  if (!user) {
    return <div>User not found.</div>
  }

  return (
    <div>
      <h1>{user.name}</h1>
      <p>Email: {user.email}</p>
    </div>
  )
}
```

3. Initialize Browser Session ID on the Client Include the useBrowserSessionId hook in your root
   layout or a top-level client component to set up the browser session ID.

```typescript
// app/layout.tsx
'use client'

import { useBrowserSessionId } from 'sesh-cache-helper'

export default function RootLayout({ children }) {
  useBrowserSessionId()

  return (
    <html>
      <body>{children}</body>
    </html>
  )
}
```

Configuring Cookie Usage Disabling Cookies for Compliance If you need to disable cookies (e.g., for
compliance with European regulations), you can control this behavior using the hasDisabledCookies
parameter.

Usage:

```typescript
// app/layout.tsx 'use client';
import { useBrowserSessionId } from 'sesh-cache-helper'

export default function RootLayout({ children }) {
  useBrowserSessionId({ hasDisabledCookies: true }) // Disable cookies

  return (
    <html>
      <body>{children}</body>
    </html>
  )
}
```

Implications of Disabling Cookies:

- **Cross-Request Caching Disabled**: When `hasDisabledCookies` is true, the library avoids using
  `unstable_cache` to prevent data leakage. Caching is limited to the current render cycle.
- **No Data Leakage**: Data is not shared between different users.
- **Performance Impact**: More frequent data fetching may impact performance.
- **Console Warnings**: The library logs warnings to inform you that cross-request caching is
  disabled.

## Recommendations:

- **Understand the Trade-offs**: Disabling cookies enhances safety but may affect performance.
- **Monitor Performance**: Consider the impact on your application.
- **Inform Users**: If necessary, inform users about the impact on performance.

## How It Works

### When Cookies Are Enabled:

- **Session ID Generation**: `useBrowserSessionId` creates a unique ID and stores it in a cookie
- **Caching Mechanism**: `query` uses both React's cache and Next.js's `unstable_cache`
- **Cache Scoping**: Cache is scoped to the browser session using the session ID

### When Cookies Are Disabled:

- **Session ID Unavailable**: Session ID is not stored in cookies
- **Limited Caching**: `query` avoids `unstable_cache` and relies on React's cache
- **No Cross-Request Caching**: Data is fetched on each request
- **Safety Over Performance**: Prioritizes data safety

## Examples

### Example with Prisma

Setting Up the Query Function:

```typescript
// lib/queries.ts
import { query } from 'sesh-cache-helper'
import { prisma } from './prismaClient'

export const getPostsByUser = query(
  async (userId: string) => {
    const posts = await prisma.post.findMany({
      where: { authorId: userId },
    })
    return posts
  },
  (userId) => `getPostsByUser-${userId}`
)
```

Using in a Server Component:

```typescript
// app/users/[userId]/posts/page.tsx
import { getPostsByUser } from '../../../../lib/queries'

export default async function UserPostsPage({ params }) {
  const posts = await getPostsByUser(params.userId)

  return (
    <div>
      <h1>Posts by User {params.userId}</h1>
      {posts.length === 0 ? (
        <p>No posts found.</p>
      ) : (
        posts.map((post) => (
          <article key={post.id}>
            <h2>{post.title}</h2>
            <p>{post.content}</p>
          </article>
        ))
      )}
    </div>
  )
}
```

### Alternative Example with Fetch

Setting Up the Query Function:

```typescript
// lib/queries.ts
import { query } from 'sesh-cache-helper'

export const getExternalData = query(
	async (endpoint: string) => {
		const response = await fetch(`https://api.example.com/${endpoint}`, {
			cache: 'no-store',
		})
		const data = await response.json()
		return data
	},
	(endpoint) => `getExternalData-${endpoint}`
)
```

Using in a Server Component:

```typescript
// app/data/[endpoint]/page.tsx
import { getExternalData } from '../../../lib/queries'

export default async function DataPage({ params }) {
  const data = await getExternalData(params.endpoint)

  return (
    <div>
      <h1>Data for {params.endpoint}</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}
```

## FAQ

1. Why does Sesh use `unstable_cache`? Isn't it risky?

`unstable_cache` is currently the only way to cache data fetching in Next.js server components
without creating endpoints or using experimental features like Server Actions for fetching (which is
discouraged). While `unstable_cache` is experimental and may change in future Next.js versions, Sesh
provides a practical solution until a stable API is available. We are actively monitoring Next.js
updates and plan to adapt Sesh accordingly.

2. Why create Sesh when there are existing solutions like SWR or React Query?

SWR and React Query are excellent libraries for client-side data fetching and caching. However, they
don't address server-side caching in Next.js server components without creating API endpoints. Sesh
fills this specific gap by simplifying server-side caching directly within server components.

3. Does generating new session IDs and invalidating caches on tab focus impact performance?

The performance impact is minimal. Generating a session ID is a lightweight operation, and
invalidating the cache ensures users receive fresh data when returning to the application. The
benefits of preventing stale data and data leakage outweigh the negligible overhead.

4. Are there security or privacy risks in storing session IDs in cookies?

The session IDs are opaque tokens containing no sensitive information and are used solely for
scoping the cache. They do not expose any user data. However, to comply with European cookie laws,
Sesh can be configured to use sessionStorage as a fallback when cookies are disabled, and you can
implement consent mechanisms if necessary.

5. What happens when Next.js releases official support for caching in server components?

We are committed to keeping Sesh up-to-date with the latest Next.js developments. When a stable
caching API becomes available, we plan to update Sesh to leverage it or provide migration paths for
users.

6. Does Sesh add unnecessary complexity to my project?

On the contrary, Sesh simplifies caching by abstracting the complexity of `unstable_cache` and
providing a straightforward API. It reduces boilerplate code and minimizes the potential for caching
errors, allowing you to focus on building features.

7. Why not use API endpoints or Server Actions for data fetching?

While API endpoints are a viable option, they add an extra layer and can complicate the
architecture. Server Actions are intended for mutations and are not recommended for data fetching.
Sesh allows you to fetch data directly in server components without these additional complexities.

8. How does Sesh handle environments where cookies are disabled?

If cookies are disabled, Sesh can fallback to using sessionStorage to store the session ID. This
ensures that the application still functions correctly, and the cache remains scoped to the browser
session. The useBrowserSessionId hook has been updated to handle this scenario.

9. Is Sesh compliant with European cookie laws (GDPR and ePrivacy Directive)?

Sesh can be configured to comply with European regulations. Since the session ID is essential for
providing the service (scoping the cache to prevent data leakage), it may fall under the "strictly
necessary" exemption. However, we recommend implementing a consent mechanism or consulting legal
advice to ensure compliance.

10. Is this project actively maintained and under what license is it released?

Yes, Sesh is actively maintained, and we welcome community contributions. The project is released
under the MIT License, allowing for flexible use in both open-source and proprietary projects.

11. Have you used Sesh in production? What are the results?

Yes, I've been using Sesh in production on playtennisla.com for over two months. It has simplified
data fetching in server components and improved performance by reducing redundant database queries
without any significant issues.

12. Can I contribute to Sesh or suggest improvements?

Absolutely! We encourage contributions, feedback, and suggestions. Feel free to open issues or pull
requests on the GitHub repository (replace with your actual link).

## License

This project is licensed under the MIT License - see the LICENSE file for details.
