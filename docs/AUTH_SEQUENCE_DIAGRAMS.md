# Authentication Sequence Diagrams

This document provides visual documentation of the cookie-based authentication flows.

---

## 1. Login Flow

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant Frontend
    participant Backend

    User->>Frontend: Enter credentials
    Frontend->>Backend: POST /auth/login {username, password}
    Note over Backend: Validate credentials
    Backend-->>Browser: Set-Cookie: access_token (HttpOnly)
    Backend-->>Browser: Set-Cookie: refresh_token (HttpOnly)
    Backend-->>Frontend: 200 OK {id, username}
    Frontend->>Frontend: Store user in Zustand (no tokens!)
    Frontend-->>User: Redirect to dashboard
```

**Key Points:**
- Tokens never touch JavaScript - stored in httpOnly cookies
- Frontend only stores user info (id, username, role)
- Cookies sent automatically on subsequent requests

---

## 2. Authenticated Request

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant Frontend
    participant Backend

    User->>Frontend: Navigate to Products page
    Frontend->>Browser: GET /products (withCredentials: true)
    Browser->>Backend: GET /products + Cookie: access_token
    Note over Backend: Validate access_token
    Backend-->>Frontend: 200 OK {products: [...]}
    Frontend-->>User: Display products
```

**Key Points:**
- Browser automatically attaches cookies (no manual header injection)
- Backend validates cookie on each request
- Frontend code never sees the tokens

---

## 3. Token Refresh (401 Interceptor)

```mermaid
sequenceDiagram
    participant Browser
    participant Frontend
    participant Backend

    Frontend->>Browser: GET /products
    Browser->>Backend: GET /products + Cookie: expired_token
    Backend-->>Frontend: 401 Unauthorized
    Note over Frontend: Interceptor catches 401
    Frontend->>Browser: POST /auth/refresh
    Browser->>Backend: POST /auth/refresh + Cookie: refresh_token
    Note over Backend: Validate refresh_token<br/>Generate new tokens<br/>Revoke old refresh_token
    Backend-->>Browser: Set-Cookie: access_token (new)
    Backend-->>Browser: Set-Cookie: refresh_token (rotated)
    Backend-->>Frontend: 200 OK
    Note over Frontend: Retry original request
    Frontend->>Browser: GET /products (retry)
    Browser->>Backend: GET /products + Cookie: new_token
    Backend-->>Frontend: 200 OK {products: [...]}
```

**Key Points:**
- Refresh happens automatically (user doesn't notice)
- Refresh tokens are rotated (security best practice)
- No token manipulation in frontend code

---

## 4. Session Restoration (Page Reload)

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant Frontend
    participant Backend

    User->>Browser: Reload page (F5)
    Browser->>Frontend: Load app
    Note over Frontend: AuthInitializer runs
    Frontend->>Browser: GET /auth/me
    Browser->>Backend: GET /auth/me + Cookie: access_token

    alt Valid session
        Backend-->>Frontend: 200 OK {id, username}
        Frontend->>Frontend: Restore user in Zustand
        Frontend-->>User: Show dashboard
    else Invalid session (401)
        Backend-->>Frontend: 401 Unauthorized
        Frontend->>Frontend: Clear state
        Frontend-->>User: Redirect to login
    end
```

**Key Points:**
- `/auth/me` endpoint validates session on startup
- If cookies are valid, session is restored
- If cookies expired, user is redirected to login

---

## 5. Logout Flow

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant Frontend
    participant Backend

    User->>Frontend: Click "Logout"
    Frontend->>Browser: POST /auth/logout
    Browser->>Backend: POST /auth/logout + Cookie: tokens
    Note over Backend: Revoke tokens<br/>Clear cookie values
    Backend-->>Browser: Set-Cookie: access_token= Max-Age=0
    Backend-->>Browser: Set-Cookie: refresh_token= Max-Age=0
    Backend-->>Frontend: 204 No Content
    Frontend->>Frontend: Clear Zustand state<br/>Clear React Query cache
    Frontend-->>User: Redirect to login
```

**Key Points:**
- Backend clears cookies by setting `Max-Age=0`
- Frontend clears all client-side state
- React Query cache is cleared to prevent data leakage

---

## 6. Expired Refresh Token

```mermaid
sequenceDiagram
    participant Browser
    participant Frontend
    participant Backend

    Note over Browser: User idle for 7+ days
    Frontend->>Browser: GET /products
    Browser->>Backend: GET /products + Cookie: expired_access_token
    Backend-->>Frontend: 401 Unauthorized
    Note over Frontend: Interceptor catches 401
    Frontend->>Browser: POST /auth/refresh
    Browser->>Backend: POST /auth/refresh + Cookie: expired_refresh_token
    Note over Backend: Refresh token expired
    Backend-->>Frontend: 401 Unauthorized
    Note over Frontend: Refresh failed
    Frontend->>Frontend: Call logout()<br/>Clear state
    Frontend-->>User: Redirect to login
    Note over User: "Session expired, please log in again"
```

**Key Points:**
- Both access and refresh tokens can expire
- When refresh fails, user must re-authenticate
- Graceful error handling with user-friendly message

---

## Security Architecture

### Cookie Attributes

```
Set-Cookie: access_token=<jwt>;
  Path=/;
  HttpOnly;           ← JavaScript cannot read
  Secure;             ← HTTPS only (production)
  SameSite=Lax;       ← CSRF protection
  Max-Age=1800        ← 30 minutes
```

### Token Lifetimes

| Token Type | Lifetime | Purpose |
|------------|----------|---------|
| **Access Token** | 30 minutes | API authentication |
| **Refresh Token** | 7 days | Renew access token |

### Security Benefits vs localStorage

| Aspect | localStorage (OLD) | httpOnly Cookies (NEW) |
|--------|-------------------|----------------------|
| **XSS Protection** | ❌ Vulnerable | ✅ Protected |
| **CSRF Protection** | ✅ Not applicable | ✅ SameSite=Lax |
| **Token Visibility** | ❌ JavaScript can read | ✅ JavaScript cannot access |
| **Automatic Transport** | ❌ Manual header injection | ✅ Browser handles it |
| **Code Complexity** | ❌ High (token management) | ✅ Low (just user state) |

---

## Implementation Reference

### Frontend Configuration

**Axios Setup** (`src/services/api.ts`):
```typescript
export const apiClient = axios.create({
  withCredentials: true,  // Critical for cookies!
  timeout: 10000,
});
```

**Request Interceptor**:
- Sets dynamic `baseURL`
- NO token header injection (cookies sent automatically)

**Response Interceptor**:
- Catches 401 errors
- Calls `/auth/refresh`
- Retries original request
- No token manipulation (backend updates cookies)

### Backend Endpoints

| Endpoint | Method | Request | Response |
|----------|--------|---------|----------|
| `/auth/login` | POST | `{username, password}` | `{id, username}` + Set-Cookie headers |
| `/auth/refresh` | POST | Empty (cookies in request) | Empty + Set-Cookie headers |
| `/auth/me` | GET | Empty (cookies in request) | `{id, username}` |
| `/auth/logout` | POST | Empty (cookies in request) | 204 + Clear cookies |

---

## Migration History

**Date:** February 2026
**Reason:** Eliminate XSS vulnerability from localStorage token storage
**Result:** Successfully migrated to httpOnly cookies
**Impact:** -286 lines of code, improved security, simpler architecture

**Phases Completed:**
1. ✅ Infrastructure setup
2. ✅ Service refactoring
3. ✅ State management update
4. ✅ App initialization
5. ✅ Interceptor simplification
6. ✅ Testing & verification
7. ✅ Documentation

---

## Troubleshooting

### Cookies not being sent?

1. Check `withCredentials: true` in Axios config
2. Verify CORS allows credentials on backend
3. Check cookies in DevTools under API origin (not frontend origin!)

### Session not persisting after reload?

1. Check if `AuthInitializer` is calling `/auth/me`
2. Verify cookies haven't expired
3. Check console for errors during initialization

### 401 errors not triggering refresh?

1. Verify response interceptor is configured
2. Check if URL contains `/auth/refresh` (infinite loop prevention)
3. Ensure `_retry` flag is working

---

**Last Updated:** February 2026
**Status:** Production Ready ✅
