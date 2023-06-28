# Messages

Info Messages allow you to display an Info, Warning or Danger message to set
scopes over a given duration.

They are managed through the admin panel where you can add, edit and delete
messages.

A message has:-

- a _Title_, displayed at the top.
- a _Message_ which accepts HTML.
- a _type_ which can "Danger" (Red), "Warning" (Yellow) or "Info" (Blue).
- a _Start Date_ which is the first date it will be displayed.
- an _End Date_ which is the last date it will be displayed. Set this to the
  same as _Start Date_ to have a 1 day message.
- a _Target_ which is where it links to (can be blank).
- a comma seperated list of _Scopes_ that works the same as shortcuts for
  displaying messages to a subset of users.

Only 1 message is displayed at a time, selected by findind the first message
who's start date is before or equal to today, end date is after or equal to
today, sorted by the closest end date first.
