# Importing from your MIS

To import users (staff/student) and classes its best to get that data straight
from your MIS.

It's hard to define this exactly as every school uses different conventions for
usernames and display names, as well as MIS.

The basic principal is that you send a POST request to `/import/staff`,
`/import/students` and `/import/classes`. This request needs to have the header
`Import-Token` set to the
[value in your configuration](/admin/configuration#importKey).

For [staff](/data/staff):

- Name
- Username

For [Students](/data/students):

- Name
- Username
- UPN (_Unique Pupil Number_)
- Year Group
- Registration Group

For [Classes](/data/classes):

- Name
- Teacher's Username
- Array of Student UPNs

An
[example script](https://github.com/Longridge-High-School/start-screen/blob/main/scripts/export.ps1)
is supplied which runs SIMS Reports, parses the data and builds the objects for
Start Screen and then sends them to the import addresses.
