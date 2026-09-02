# OpenCode Prompt — Integrate MilkEdin AI Assistant into the Frontend

You are working inside the existing frontend repository:

`https://github.com/imshashwatsingh/milkedin-frontend`

The backend repository is:

`https://github.com/imshashwatsingh/milkedin-backend`

The backend now contains a **Natural Language Milk Assistant** powered by the Google Gemini API.

Your task is to integrate that backend AI capability into the existing MilkEdin React Native application as a polished, first-class **AI Assistant tab**.

Do not redesign the application or replace its existing architecture. Extend the current architecture consistently.

---

# 1. Read the existing frontend before making changes

Before editing anything, inspect the actual repository, especially:

```text
README.md

src/app/_layout.tsx
src/app/(tabs)/_layout.tsx

src/app/(tabs)/index.tsx
src/app/(tabs)/history.tsx
src/app/(tabs)/insights.tsx
src/app/(tabs)/settings.tsx

src/auth/AuthContext.tsx
src/auth/storage.ts

src/services/api/client.ts
src/services/api/auth.ts
src/services/api/categories.ts
src/services/api/milk.ts
src/services/api/export.ts

src/hooks/*
src/components/ui/*
src/components/navigation/*
src/components/analytics/*

src/theme/index.ts
src/theme/navigation.ts

src/types/api.ts
src/types/index.ts
src/utils/*
```

The README and source code indicate that the application uses:

* React Native
* Expo SDK 57
* React 19
* TypeScript with strict mode
* Expo Router
* file-based navigation
* centralized theme tokens
* reusable UI components
* a typed API service layer
* a shared `fetch` client
* JWT authentication
* automatic access-token refresh
* `useApiData`
* reusable hooks/components

The source code is authoritative if it differs from README documentation.

Do not introduce a parallel architecture.

---

# 2. Existing application architecture

The existing frontend follows this pattern:

```text
Screen
  ↓
Hooks / local state
  ↓
Typed API service
  ↓
Shared HTTP client
  ↓
Backend API
```

The shared client already:

* resolves `EXPO_PUBLIC_API_URL`
* attaches the Bearer token
* refreshes an expired access token once
* retries the request
* handles 401/session expiry
* exposes a typed `request<T>()`
* unwraps `{ success, message, data }`

Reuse this client for the AI API.

Do NOT create a separate fetch implementation for AI.

The existing client behavior is documented in `src/services/api/client.ts`. It already adds `Authorization: Bearer <token>` and transparently refreshes expired tokens.

---

# 3. Main UX decision

Add **AI Assistant as a fifth bottom navigation tab**.

Current tabs:

```text
Today
History
Insights
Milk & Price
```

Change to:

```text
Today
History
Insights
AI
Milk & Price
```

The AI tab should be available only to authenticated users because the backend endpoint is authenticated and all AI queries operate on the current user's private milk data.

The existing root navigation already protects `(tabs)` using `Stack.Protected guard={!!user}`, so do not create a second authentication mechanism.

Use an appropriate Ionicons icon, preferably something such as:

```text
sparkles-outline
```

or another AI-oriented icon that exists in the installed Ionicons set.

Do not use an icon package that is not already installed.

---

# 4. New route

Create:

```text
src/app/(tabs)/ai.tsx
```

This becomes the screen for the AI Assistant tab.

Update:

```text
src/app/(tabs)/_layout.tsx
```

to register:

```text
name="ai"
```

with title:

```text
AI
```

and an appropriate icon.

Keep the ordering visually sensible. Recommended:

```text
Today
History
Insights
AI
Milk & Price
```

Do not modify other tab behavior.

---

# 5. AI API service

Create:

```text
src/services/api/ai.ts
```

This file should contain the typed frontend wrapper around:

```http
POST /api/ai/chat
```

Use the existing `request<T>()` from:

```text
src/services/api/client.ts
```

Do not call `fetch()` directly from the screen.

Example request:

```json
{
  "message": "How much did I spend on milk last month?"
}
```

The backend response is conceptually:

```json
{
  "success": true,
  "message": "AI response generated successfully",
  "data": {
    "answer": "You spent ₹1,780 on milk last month across 29.6 litres.",
    "tools_used": [
      "get_monthly_summary"
    ]
  }
}
```

The shared client unwraps the backend envelope and returns `data`, so the frontend service should expose the inner structure.

Example TypeScript contract:

```ts
export interface AIChatRequest {
  message: string;
}

export interface AIChatResponse {
  answer: string;
  tools_used?: string[];
}
```

Adapt names/types to the existing project conventions.

Then expose:

```ts
export function sendAIMessage(
  message: string,
): Promise<AIChatResponse>
```

or an equivalent clean API.

---

# 6. Update frontend API types

Add the AI request/response types to the appropriate existing type file:

```text
src/types/api.ts
```

and/or the corresponding barrel export:

```text
src/types/index.ts
```

Follow the existing type organization.

The existing API type layer mirrors backend contracts, including the API envelope and domain response types.

Do not use `any`.

Use strict TypeScript types.

---

# 7. AI screen UX

The AI screen should feel like a **personal assistant**, not a generic developer chatbot.

Suggested header:

```text
MilkEdin AI
Your personal milk assistant
```

or a similarly concise design consistent with the application.

The screen should contain:

```text
Header
   ↓
Conversation
   ↓
Suggested question chips
   ↓
Input composer
```

The conversation must remain usable on:

* Android
* iOS
* Web

Avoid platform-specific APIs unless they are already used by the project.

---

# 8. Chat experience

Create a proper conversational UI.

The user should see messages in chat bubbles.

Example:

```text
                  ┌─────────────────────────────┐
                  │ How much did I spend last  │
                  │ month?                      │
                  └─────────────────────────────┘

┌─────────────────────────────────────────┐
│ You spent ₹1,780 on milk last month,   │
│ across 29.6 litres.                    │
└─────────────────────────────────────────┘
```

Clearly distinguish:

* user messages
* AI messages

Use the existing theme rather than inventing an unrelated visual language.

---

# 9. Do not use a generic third-party chat UI library unless necessary

Prefer implementing the chat UI using existing React Native primitives and existing MilkEdin components.

Use existing components such as:

* `Screen`
* `Text`
* `Card`
* `Button`
* `Field`
* animation components
* existing spacing/radii/shadows/theme tokens

where appropriate.

The current design system uses centralized tokens for colors, spacing, radii, typography, shadows, and touch targets.

Respect these tokens.

Do not hard-code an entirely new design system.

---

# 10. Message list implementation

Use an efficient scrollable conversation container.

Preferred approach:

```text
FlatList
```

or another suitable React Native list implementation.

Avoid rendering an unbounded number of messages inside a normal `ScrollView` if the implementation is intended to support longer conversations.

Messages should have a stable `id`.

Suggested local state:

```ts
type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: number;
};
```

You may extend this with:

```ts
status?: 'sending' | 'sent' | 'error';
```

if useful.

Do not send the entire conversation history to the backend unless the backend API explicitly supports it.

For the current backend contract, send the current user message.

---

# 11. Initial AI state

When the AI screen opens for the first time, show a helpful empty state.

Example:

```text
MilkEdin AI

Ask me anything about your milk consumption
or spending.

Try asking:

“How much did I spend last month?”
“Which milk do I consume the most?”
“Am I spending more than usual?”
“What was my most expensive month?”
```

These should be tappable suggestion chips/buttons.

When the user taps one:

```text
populate input
```

or preferably:

```text
send it immediately
```

Choose the interaction that fits the app best, but keep it intuitive.

---

# 12. Suggested questions

Implement 4–6 useful prompts.

For example:

```text
How much did I spend last month?
Which milk do I consume the most?
Am I spending more than usual?
What was my most expensive month?
How much milk did I consume this month?
Show me my milk spending trend.
```

Keep these focused on capabilities actually supported by the backend AI tools.

Do not advertise unsupported AI functionality.

---

# 13. Message composer

At the bottom of the screen provide:

```text
[ Ask MilkEdin AI...                         ][Send]
```

Requirements:

* multi-platform
* keyboard aware
* clear disabled state while sending
* disabled when input is empty/whitespace
* submit via keyboard where appropriate
* send button has accessible label
* input has accessible label
* at least the application's standard touch target size

The design system specifies a minimum interactive height of 56px. Respect that baseline.

---

# 14. Keyboard behavior

This is important.

The project already has a reusable `Screen` component using:

* `SafeAreaView`
* `KeyboardAvoidingView`

The AI chat composer must work naturally with the keyboard.

Inspect how `Screen` works before implementing your own behavior. The existing component already accounts for platform-specific keyboard behavior.

Avoid double-wrapping the page in conflicting keyboard handlers.

The chat list should remain scrollable when the keyboard opens.

The input should remain visible above the keyboard.

---

# 15. Send behavior

When the user sends a message:

1. Trim the message.
2. Add the user message immediately to the conversation.
3. Clear the input.
4. Show an AI loading state.
5. Call `sendAIMessage(message)`.
6. Add the returned assistant answer.
7. Remove the loading state.

Example:

```text
User message
      ↓
optimistic UI
      ↓
loading indicator
      ↓
POST /api/ai/chat
      ↓
response
      ↓
assistant bubble
```

Do not wait for the request to complete before showing the user's message.

---

# 16. Loading state

Do not display a full-screen spinner while waiting.

The user should see a subtle assistant typing/loading indicator near the bottom of the conversation.

For example:

```text
AI is thinking...
```

or animated dots:

```text
•••
```

Use existing animation primitives where appropriate.

The existing project already contains animation components such as `FadeInView` and `PressScale`; reuse existing patterns where they make sense rather than introducing a new animation dependency.

---

# 17. Error handling

Use the existing `ApiError` mechanism.

Do not create a new network-error abstraction.

The shared client already converts:

* network failures
* 401/session expiration
* backend errors
* 500-level failures

into user-friendly `ApiError` instances.

For an AI request failure, display a friendly inline assistant error or retry card.

Example:

```text
I couldn't reach MilkEdin AI right now.

[Try again]
```

Do not expose:

* raw stack traces
* Gemini errors
* provider internals
* API keys
* request payloads
* backend internals

Do not automatically retry an AI generation request multiple times unless there is an explicit product reason.

---

# 18. Retry behavior

For a failed assistant request, provide a retry action.

The retry should repeat the failed user message.

Example message model:

```ts
{
  id,
  role: 'assistant',
  content: 'I could not complete that request.',
  status: 'error',
  retryMessage: 'What did I spend last month?'
}
```

Use a simpler structure if preferred.

Do not duplicate user messages unintentionally when retrying.

---

# 19. Conversation persistence

For the first implementation, keep the conversation in screen/session memory.

Do NOT add a database-backed AI conversation history unless the backend supports it.

Do not introduce:

* SQLite
* AsyncStorage
* a new database
* global chat persistence

just to save chat messages.

A clean first version should reset when the screen/app session resets.

However, structure the state so persistence can be added later without rewriting the UI.

---

# 20. AI tab navigation behavior

The AI tab should work naturally with the existing Expo Router setup.

When the user switches:

```text
Today → AI → Insights → AI
```

the chat should behave predictably.

Prefer preserving the conversation while the tab remains mounted.

Do not introduce unusual navigation behavior.

Do not open AI as a modal by default.

The AI assistant is a first-class application feature.

---

# 21. AI branding

Use the MilkEdin design language.

Do not make the AI screen look like OpenAI ChatGPT, Gemini, or another third-party product.

It should feel like:

**MilkEdin with an intelligent assistant built into it.**

Suggested visual direction:

* existing warm white background
* existing blue primary
* subtle dairy accent
* rounded cards
* soft shadows
* restrained AI/sparkles iconography
* generous whitespace
* large readable typography
* comfortable touch targets

The existing design tokens include:

```text
background
surface
primary
primarySoft
accent
accentSoft
text
textMuted
surfaceBorder
shadows
spacing
radii
typography
```

Use them rather than introducing arbitrary values.

---

# 22. Suggested empty state design

Create an appealing empty AI screen.

For example:

```text
          ✨

       MilkEdin AI

Ask about your milk consumption,
spending, categories, and trends.

        Try asking

[ How much did I spend last month? ]

[ Which milk do I consume most? ]

[ Am I spending more than usual? ]
```

Use existing components and tokens.

Keep it simple.

---

# 23. AI assistant capabilities shown in UI

Make it clear that the assistant is grounded in the user's MilkEdin data.

Suggested small subtitle:

```text
Ask about your milk records and spending
```

Avoid making generic statements like:

```text
Ask me anything.
```

because the backend assistant intentionally focuses on MilkEdin-related questions.

---

# 24. Response rendering

The backend returns a natural-language `answer`.

Render the answer as text.

Do not attempt to render arbitrary HTML.

Do not use raw markdown parsing unless the backend explicitly guarantees Markdown output.

The frontend should treat the answer as untrusted text.

Safely display text using React Native `Text`.

---

# 25. Currency and units

AI responses may include:

```text
₹1,780
29.6 litres
```

Do not unnecessarily post-process or re-format the AI answer.

The backend AI layer is responsible for producing human-readable answers.

However, the UI itself should respect the app's existing formatting conventions if it adds metadata/cards in the future.

---

# 26. Optional tool metadata

The backend may return:

```json
{
  "answer": "...",
  "tools_used": [
    "get_monthly_summary"
  ]
}
```

Do not expose raw tool names to normal users.

Do not show:

```text
Tool: get_monthly_summary
```

in the UI.

Treat `tools_used` as diagnostic metadata only.

You may retain it internally for debugging if useful, but do not build the UX around it.

---

# 27. No direct Gemini usage in frontend

This is critical.

The frontend MUST NOT call Gemini directly.

Do not add:

```env
EXPO_PUBLIC_GEMINI_API_KEY=
```

Do not put a Gemini API key into the Expo app.

The correct flow is:

```text
React Native
    ↓
MilkEdin backend
    ↓
Gemini
```

The Gemini API key stays on the backend.

The frontend knows only the backend API URL.

---

# 28. Authentication

The frontend must rely on the existing AuthContext/client authentication pipeline.

Do not manually retrieve or manage JWT tokens in the AI screen.

Do not manually write:

```ts
Authorization: `Bearer ${token}`
```

in the AI service.

The existing `client.ts` already handles this.

Use:

```ts
request<AIChatResponse>()
```

and let the existing authentication machinery handle the token.

---

# 29. API URL / environment

Do not add an AI-specific API URL.

Reuse:

```text
EXPO_PUBLIC_API_URL
```

The existing client already resolves the backend base URL.

Do not modify API URL behavior unless absolutely necessary.

---

# 30. Accessibility

The AI chat must be accessible.

Provide:

* accessibility labels
* clear button labels
* sensible roles where appropriate
* readable contrast
* large touch targets
* input placeholder
* send button state
* retry button label

Examples:

```text
accessibilityLabel="Ask MilkEdin AI"
accessibilityLabel="Send message"
accessibilityLabel="Retry message"
```

Respect the existing accessibility conventions.

---

# 31. Responsive behavior

The app works on:

* Android
* iOS
* Web

The AI screen must work on all three.

For Web:

* input should work with keyboard
* Enter should have sensible behavior
* scrolling should work
* no native-only assumptions

For mobile:

* keyboard should not cover composer
* safe areas should be respected
* messages should remain scrollable

Do not hard-code a device width.

Use responsive styles where necessary.

---

# 32. Handle rapid sends

Prevent accidental duplicate requests.

While a message is being sent:

* disable the send action for that message/request
* prevent accidental double tap
* prevent duplicate submission through keyboard + button

However, do not block the entire chat UI unnecessarily.

A reasonable first implementation can allow only one pending AI request at a time.

---

# 33. Empty input behavior

Do not send:

```text
" "
```

or empty strings.

Disable Send when:

```ts
message.trim().length === 0
```

Also trim before submitting.

---

# 34. Chat state implementation

Keep the state local to the AI screen unless there is a strong reason otherwise.

Possible state:

```ts
const [messages, setMessages] = useState<ChatMessage[]>([]);
const [input, setInput] = useState('');
const [sending, setSending] = useState(false);
```

Use stable callbacks and keys.

Avoid unnecessary re-rendering for a normal conversation.

Do not introduce global state management just for this feature.

---

# 35. Components

Keep the screen maintainable.

If the AI screen becomes too large, split reusable pieces into:

```text
src/components/ai/
├── AIMessageBubble.tsx
├── AIInput.tsx
├── AISuggestions.tsx
└── AILoadingIndicator.tsx
```

Do this only where it improves readability.

Do not create dozens of tiny components.

Recommended responsibility:

### `AIMessageBubble`

Render a single user or assistant message.

### `AIInput`

Own the input composer UI.

### `AISuggestions`

Render suggested prompts.

### `AILoadingIndicator`

Show assistant thinking state.

Use the existing `components/ui` primitives inside these components.

---

# 36. Suggested visual hierarchy

Recommended screen:

```text
┌──────────────────────────────────┐
│ MilkEdin AI                      │
│ Your milk, understood.           │
├──────────────────────────────────┤
│                                  │
│      Empty state / messages      │
│                                  │
│                                  │
│                                  │
├──────────────────────────────────┤
│ Suggested questions              │
│ [Spent last month?] [Top milk?]  │
├──────────────────────────────────┤
│ [ Ask MilkEdin AI...       ] [↑] │
└──────────────────────────────────┘
```

When conversation starts:

```text
┌──────────────────────────────────┐
│ MilkEdin AI                      │
├──────────────────────────────────┤
│                                  │
│                 User bubble →    │
│                                  │
│ ← Assistant bubble               │
│                                  │
│                 User bubble →    │
│                                  │
│ ← Assistant bubble               │
│                                  │
│               •••                │
│                                  │
├──────────────────────────────────┤
│ [ Ask MilkEdin AI...       ] [↑] │
└──────────────────────────────────┘
```

Keep the bottom composer visually stable.

---

# 37. Use the existing Screen carefully

The existing `Screen` component supports:

```ts
title
subtitle
scroll
contentStyle
scrollStyle
children
```

It also wraps content with SafeAreaView and KeyboardAvoidingView.

Because the AI screen has its own scrollable conversation, do not blindly use the default `scroll={true}` behavior if that would create nested scrolling.

A likely implementation is:

```tsx
<Screen
  title="MilkEdin AI"
  subtitle="Ask about your milk consumption and spending"
  scroll={false}
>
  ...
</Screen>
```

Then place the chat list inside the screen.

Use the actual component behavior to make the final decision.

---

# 38. Do not reuse `useApiData` blindly

The existing `useApiData` hook is designed primarily for data fetching.

AI chat is an event-driven mutation:

```text
user submits message
        ↓
POST request
        ↓
assistant response
```

Do not force the chat implementation into a `useApiData` pattern if it makes the interaction awkward.

Use local state + the typed AI service.

This should remain consistent with the application's architecture while respecting the different interaction model.

---

# 39. Frontend tests

Add appropriate tests for the AI integration.

At minimum test:

### API service

* sends POST to `/api/ai/chat`
* sends `{ message }`
* returns typed AI response
* uses the existing request client

### UI

* AI tab exists
* AI screen renders
* empty state renders
* suggestion chips render
* input works
* send button disabled for empty input
* sending a message adds user bubble
* successful response adds assistant bubble
* loading state appears
* error state appears
* retry works
* authenticated navigation still works

Mock the API service.

Do not call the real Gemini-backed backend in unit tests.

---

# 40. Type checking and linting

After implementation run:

```bash
npm run typecheck
```

and:

```bash
npm run lint
```

Fix all errors introduced by your changes.

Do not weaken TypeScript strictness.

Do not disable ESLint rules just to make the implementation pass.

---

# 41. Avoid unnecessary dependencies

Before installing anything:

* inspect `package.json`
* inspect existing UI components
* inspect existing Expo packages

Do not install a chat library, markdown renderer, icon library, state library, or networking library unless there is a compelling requirement.

The project already has the tools necessary to build this feature.

---

# 42. Keep current features working

Do not break:

* Today
* History
* Insights
* Milk & Price
* authentication
* login/register
* token refresh
* logout
* exports
* profile
* category management
* milk record creation/editing/deletion

The AI feature should be additive.

---

# 43. Backend contract assumptions

Assume the backend exposes:

```http
POST /api/ai/chat
```

with:

```json
{
  "message": "What did I spend on milk last month?"
}
```

and returns:

```json
{
  "success": true,
  "message": "AI response generated successfully",
  "data": {
    "answer": "You spent ₹1,780 on milk last month across 29.6 litres.",
    "tools_used": [
      "get_monthly_summary"
    ]
  }
}
```

If the actual backend implementation differs, inspect the backend repository and adapt the frontend to the actual API contract.

Do not guess.

---

# 44. Backend/frontend integration debugging

Because the backend and frontend are separate repositories, verify:

```text
Frontend EXPO_PUBLIC_API_URL
            ↓
Backend URL
            ↓
POST /api/ai/chat
```

Remember:

* frontend runs through Expo
* backend may run on port 4000
* physical devices cannot use `localhost` to refer to the development machine
* `EXPO_PUBLIC_API_URL` may need the machine's LAN IP for device testing

The existing frontend README already documents this behavior.

Do not change the networking architecture merely to support AI.

---

# 45. Conversation examples the UI should handle

### Example 1

User:

```text
How much did I spend on milk last month?
```

Assistant:

```text
You spent ₹1,780 on milk last month, across 29.6 litres.
```

---

### Example 2

User:

```text
Which milk did I consume the most?
```

Assistant:

```text
You consumed the most Full Cream milk, at 18.5 litres.
```

---

### Example 3

User:

```text
Am I spending more than usual?
```

Assistant:

```text
Yes. You spent about 9.6% more than the previous month.
```

---

### Example 4

User:

```text
What was my most expensive month?
```

Assistant:

```text
April 2026 was your most expensive month, at ₹1,812.
```

---

# 46. Out-of-domain response

The frontend does not need to special-case unrelated questions.

The backend AI handles the domain boundary.

For example:

```text
Who won the cricket match?
```

may return:

```text
I'm here to help with your MilkEdin milk
consumption and spending.
```

Render this normally as an assistant response.

---

# 47. Future extensibility

Design the frontend so future AI capabilities can be added later without restructuring the feature.

Potential future capabilities might include:

```text
AI-generated monthly insights
AI forecasts
AI recommendations
natural-language milk logging
```

However:

**Do not implement these now.**

The first version should focus on the backend's current:

```text
Natural Language Milk Assistant
```

capability.

Avoid speculative UI.

---

# 48. Important security rules

The frontend must never:

* contain `GEMINI_API_KEY`
* expose backend secrets
* construct SQL
* send `userId`
* allow the user to specify another user ID
* call Gemini directly

The frontend only sends:

```json
{
  "message": "..."
}
```

The authenticated backend determines whose data is used.

---

# 49. Code quality

Use:

* TypeScript
* strict typing
* existing aliases such as `@/...`
* existing theme tokens
* existing components
* existing API client
* existing navigation conventions
* existing error model

Avoid:

* `any`
* duplicated fetch code
* arbitrary magic constants
* unnecessary dependencies
* deeply nested components
* enormous single-file screens

Keep code readable and production-oriented.

---

# 50. Final implementation checklist

Before finishing, verify all of the following:

```text
[ ] AI tab added to bottom navigation
[ ] AI route created
[ ] AI screen accessible only after authentication
[ ] AI API service created
[ ] AI TypeScript types created
[ ] POST /api/ai/chat integrated
[ ] Existing API client reused
[ ] JWT authentication reused
[ ] Automatic token refresh preserved
[ ] Chat UI implemented
[ ] User/assistant bubbles implemented
[ ] Input implemented
[ ] Send button implemented
[ ] Suggested prompts implemented
[ ] Loading state implemented
[ ] Error state implemented
[ ] Retry implemented
[ ] Keyboard handling works
[ ] Safe area works
[ ] Android works
[ ] iOS works
[ ] Web works
[ ] Accessibility considered
[ ] Existing design system reused
[ ] No Gemini API key in frontend
[ ] No unnecessary dependencies
[ ] TypeScript passes
[ ] ESLint passes
[ ] Existing app functionality remains intact
[ ] README updated
```

---

# 51. README update

Update the frontend `README.md`.

Add a section describing:

```text
## AI Assistant
```

Document:

* MilkEdin AI tab
* `/api/ai/chat`
* authentication requirement
* frontend architecture
* Gemini is accessed through backend only
* no Gemini credentials exist in the frontend
* supported example questions

Do not put secret values in the README.

---

# 52. Final expected architecture

The final frontend should conceptually look like:

```text
                     MilkEdin App
                          |
        ┌─────────────────┴─────────────────┐
        |                                   |
   Existing Tabs                        AI Tab
        |                                   |
 Today / History /                    AI Chat Screen
 Insights / Milk & Price                    |
                                            ↓
                                     services/api/ai.ts
                                            |
                                            ↓
                                    services/api/client.ts
                                            |
                                      JWT + refresh
                                            |
                                            ↓
                                    POST /api/ai/chat
                                            |
                                            ↓
                                  MilkEdin Backend AI
                                            |
                                            ↓
                                         Gemini
```

The frontend should know nothing about the internal Gemini tool-calling implementation.

It should only know:

```text
POST /api/ai/chat
```

with:

```json
{
  "message": "..."
}
```

and receive:

```json
{
  "answer": "..."
}
```

---

# 53. Final objective

The finished application should make the AI feel like a natural part of MilkEdin.

A user should be able to open:

```text
AI
```

and immediately ask:

```text
"How much did I spend last month?"
```

and receive a polished response based on their real MilkEdin data.

The experience should feel:

* fast
* simple
* trustworthy
* personal
* mobile-friendly
* visually consistent
* genuinely AI-native

Do not build a generic chatbot.

Build **MilkEdin AI** — an intelligent conversational interface over the user's existing milk consumption and spending data.

After completing the implementation, provide a concise summary containing:

1. files created/modified
2. UI/navigation changes
3. API integration
4. components added
5. tests/typecheck/lint results
6. any assumptions or issues discovered
