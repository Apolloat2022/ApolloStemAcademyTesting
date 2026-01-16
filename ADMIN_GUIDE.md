# Apollo STEM Academy - Admin User Management Guide

This guide explains how administrators can manually add or remove users from the **Apollo STEM Academy** backend using the Cloudflare D1 database tools.

**Prerequisites:**
- Access to the codebase terminal.
- `wrangler` CLI installed (available via `npm` in the project).
- Access to the `apolloacademydb` Cloudflare D1 database.

---

## 1. Understanding the Database Structure
There are two key tables responsible for user access:

1.  **`authorized_access`**: The "Whitelist". Users MUST be in this table to successfully log in with Google. It defines their allowed role (`student`, `teacher`, `volunteer`, `parent`).
2.  **`users`**: The actual user account created *after* the first successful login.

To **Add a User**, you insert them into `authorized_access`.
To **Delete a User**, you remove them from both `authorized_access` and `users`.

---

## 2. Managing Users via Terminal

Run all commands from the root directory or `apps/api` directory.

### ✅ Add a New User (Authorize Access)
To allow a new person to log in, run the following command. Replace `NEW_EMAIL` and `ROLE` with the actual values.

**Roles:** `student`, `teacher`, `volunteer`, `parent`

```powershell
npx wrangler d1 execute apolloacademydb --command "INSERT INTO authorized_access (email, role) VALUES ('robin@example.com', 'teacher');" --remote
```

*Note: The `--remote` flag executes the command on the live production database. Remove it to test locally.*

### ❌ Remove a User (Revoke Access)
To completely ban/remove a user, delete them from both the whitelist and the users table.

**Step 1: Remove from Whitelist**
```powershell
npx wrangler d1 execute apolloacademydb --command "DELETE FROM authorized_access WHERE email = 'robin@example.com';" --remote
```

**Step 2: Delete User Account Data**
```powershell
npx wrangler d1 execute apolloacademydb --command "DELETE FROM users WHERE email = 'robin@example.com';" --remote
```

### 🔍 View All Users
To see who is currently in the authorized list:

```powershell
npx wrangler d1 execute apolloacademydb --command "SELECT * FROM authorized_access;" --remote
```

To see active registered users:

```powershell
npx wrangler d1 execute apolloacademydb --command "SELECT * FROM users;" --remote
```

---

## 3. Advanced: Bulk Operations (SQL File)
If you have many users to add, it is cleaner to write a `.sql` file.

1.  Create a file named `add_users.sql`:
    ```sql
    INSERT INTO authorized_access (email, role) VALUES 
    ('student1@apollo.edu', 'student'),
    ('student2@apollo.edu', 'student'),
    ('new_teacher@apollo.edu', 'teacher');
    ```

2.  Run the file:
    ```powershell
    npx wrangler d1 execute apolloacademydb --file=./add_users.sql --remote
    ```
