# Acceptable Use Policy

Start Screen has a system for enforcing users must sign an AUP before using it.
Couple this with a filtering system that sends members of a group to this page
and you can put a hard requirement on using the internet.

It **only applies to students** as staff should be agreeing to policies during
their induction etc...

## Configuration

Through the admin panl you can access the _Acceptable Use Policy_ which allows
you to set:

- The body of the policy as [MDX](/guides/working-with-mdx).
- Yes/No is the SUP required to view the start screen. (Turns the feature on and
  off).
- Yes/No should all users have their AUP acceptance reset on save.
- The DN of the group to **remove** users from.

### Group DN

If supplied the password resetting user set in config will be used to remove the
current user from the group. If this is left blank nothing happens.

If you reset the AUP acceptance in Start Screen it _does not_ add them back to
the group.

## Signing

Users are directed to `/aup` which has the full AUP on it and a box for them to
enter their name as defined in teh database (it is shown to the user). Once they
enter their name they will be able to click the sign button.
