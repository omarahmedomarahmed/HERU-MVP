# STAFF AUTH SYSTEM

## Overview

Staff authentication is completely separate from gamer and organizer authentication. Staff members access the system through the hidden `/admin` page, which is not linked from any public navigation.

## How It Works

1. **Access Point**: Staff members visit `/admin` (hidden from public)
2. **Credentials Required**: 
   - Email (must match a User with role='admin')
   - Staff Access Key (secret key stored in StaffAccessKey entity)
3. **Validation**:
   - System checks User.role == 'admin'
   - System checks StaffAccessKey matches and is_active == true
4. **Session Creation**: 
   - Creates StaffSession record with 24-hour expiry
   - Stores session_token in localStorage
   - Updates StaffAccessKey.use_count and last_used_at
5. **Access Control**: All `/dashboard/staff/*` pages verify token on load

## Entities Used

### StaffAccessKey
Stores secret keys for staff members. Created by admins via backend/database.

**Fields:**
- `staff_name`: Display name (e.g., "John Doe")
- `staff_email`: Email to authenticate with
- `access_key`: Secret key (never sent to frontend, only validated server-side)
- `is_active`: Boolean - set to false to revoke access
- `use_count`: Number of times this key has been used (auto-incremented)
- `last_used_at`: Timestamp of last login

### StaffSession
Tracks active sessions after successful /admin login. Auto-created.

**Fields:**
- `user_id`: Reference to User (role='admin')
- `session_token`: UUID generated on login
- `staff_email`: Email used to log in
- `staff_name`: Cached from StaffAccessKey
- `access_key_id`: Reference to StaffAccessKey
- `expires_at`: ISO timestamp (24 hours from creation)
- `is_active`: Boolean - set to false on logout or revocation

## Session Flow

```
1. Staff visits /admin
2. Enters email + access key
3. StaffLogin.jsx validates:
   - User exists with role='admin' AND email matches
   - StaffAccessKey matches AND is_active=true
4. On success:
   - Creates StaffSession with 24h expiry
   - Stores session_token in localStorage['heru_staff_token']
   - Stores expires_at in localStorage['heru_staff_expires']
5. Navigate to /dashboard/staff
6. StaffLayout.jsx verifies token on mount:
   - Checks token exists and not expired
   - Queries StaffSession to confirm token is still active
   - If invalid: clears localStorage and redirects to /admin
7. User can access all staff pages
8. On logout: Sets StaffSession.is_active=false, clears localStorage, redirects to /admin
```

## Lockout Protection

Failed login attempts are tracked in localStorage:
- `heru_staff_attempts`: Counter (incremented on each failure)
- `heru_staff_lockout`: Timestamp (set when attempts >= 5)

After 5 failed attempts, the form is locked for 15 minutes. This is client-side protection to discourage brute force.

## Adding a New Staff Member (Production Workflow)

1. **Create User in Supabase Auth** (via Auth dashboard):
   - Email: their staff email
   - Password: temporary (they should reset it)
   - Set custom claim: `role: admin`

2. **Create StaffAccessKey Record** (via App Dashboard or API):
   ```json
   {
     "staff_name": "John Doe",
     "staff_email": "john@heru.gg",
     "access_key": "secure_random_key_here",
     "is_active": true,
     "use_count": 0,
     "last_used_at": null
   }
   ```

3. **Securely Deliver the Access Key**:
   - Never send via email
   - Use secure channel (Slack, in-person, password manager)
   - Staff member stores it securely

4. **First Login**:
   - Staff visits `/admin`
   - Enters email + access key
   - Gets redirected to `/dashboard/staff`

## Revoking Access (Immediate)

**Option 1: Disable Key** (old logins still active until 24h expiry):
```
Set StaffAccessKey.is_active = false
```
This prevents future logins with this key but doesn't kill active sessions.

**Option 2: Kill Active Session** (immediate):
```
Query: StaffSession where staff_email = 'john@heru.gg' AND is_active = true
Update: Set is_active = false
```
This logs out the staff member immediately.

**Option 3: Both** (safest):
- Set StaffAccessKey.is_active = false
- Set all related StaffSession.is_active = false
- This prevents future logins and kills all active sessions

## Key Security Notes

1. **Access Keys Are Secrets**: Do NOT log them, display them, or send via email.
2. **Session Tokens Are Short-Lived**: 24 hours max expiry.
3. **No Bypass**: StaffLayout always verifies token on mount. There's no way to access `/dashboard/staff/*` without a valid StaffSession.
4. **Logout**: Explicitly sets StaffSession.is_active = false. Even if localStorage is cleared manually, a re-login will fail until the token is validated.
5. **Organizers/Gamers Cannot Access**: They never get a session_token, so they'll be redirected to /admin if they try to access staff pages.

## Database RLS (Row-Level Security)

These RLS policies should be set in Supabase PostgreSQL:

```sql
-- StaffAccessKey: Only admins can read/write
CREATE POLICY "staff_access_key_read" ON StaffAccessKey
  FOR SELECT USING (auth.jwt()->>'role' = 'admin');

CREATE POLICY "staff_access_key_write" ON StaffAccessKey
  FOR ALL USING (auth.jwt()->>'role' = 'admin');

-- StaffSession: Only admins can create/manage
CREATE POLICY "staff_session_read" ON StaffSession
  FOR SELECT USING (auth.jwt()->>'role' = 'admin');

CREATE POLICY "staff_session_write" ON StaffSession
  FOR ALL USING (auth.jwt()->>'role' = 'admin');

-- Service role bypasses RLS, so backend functions can verify tokens
```

**Note**: In development, RLS might be disabled. In production, ensure these policies are enforced.

## File Structure

- **pages/StaffLogin.jsx**: Hidden /admin login page
- **lib/staffAuth.js**: Verification, logout, and session utilities
- **components/layouts/StaffLayout.jsx**: Wraps all /dashboard/staff/* pages with token verification
- **App.jsx**: Routes (including hidden /auth route)

## Testing the System

1. **Create a test StaffAccessKey** in the database
2. **Navigate to `/admin`**
3. **Enter email + key**
4. **Verify redirect to `/dashboard/staff`**
5. **Check localStorage** for `heru_staff_token` and `heru_staff_expires`
6. **Try accessing `/dashboard/staff/users`** - should work
7. **Clear localStorage manually** - next page refresh should redirect to `/admin`
8. **Test logout button** - should clear token and redirect to `/admin`
9. **Test failed login** - should show generic error and increment attempt counter

## Troubleshooting

**"Access denied. Unauthorized credentials" on valid credentials**:
- Check StaffAccessKey.is_active == true
- Verify User.role == 'admin'
- Verify email matches exactly (case-sensitive in comparison)

**Staff member stays logged in after revoking access**:
- Set StaffSession.is_active = false to force logout
- Clear localStorage if needed (will redirect to /admin on next page load)

**Stuck in lockout**:
- localStorage['heru_staff_lockout'] is set to a future timestamp
- Wait 15 minutes or manually clear localStorage['heru_staff_lockout']
- Refresh page

**Can't reach staff pages from public navigation**:
- This is intentional. `/admin` is hidden.
- Only way to access: type URL directly or click small link at bottom of /auth page