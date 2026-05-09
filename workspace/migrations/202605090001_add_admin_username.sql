ALTER TABLE admin_user ADD COLUMN username TEXT;

UPDATE admin_user
SET username = lower(
  CASE
    WHEN instr(email, '@') > 1 THEN substr(email, 1, instr(email, '@') - 1)
    ELSE email
  END
)
WHERE username IS NULL OR trim(username) = '';

CREATE UNIQUE INDEX IF NOT EXISTS idx_admin_user_username ON admin_user(username);

