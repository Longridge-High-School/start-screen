# Shortcuts

Shortcuts appear on the Start Screen and can be limited to [scopes](#scopes).
Each Shortcut has a title, image, link, priority and scope.

All staff are able to create shortcuts for _any scope_ to allow them to manage
the shortcuts for their own classes. Shortcuts will always appear for the user
that created them.

Staff have an additional shortcut that links to the shortcut manager.

## Managing

## Scopes

Scopes are added to the shortcut search if they apply to the current user.

> All scopes are converted to lower case when used.

### Available Scopes

| Scope               | Description                                                                                             | Example Values |
| :------------------ | :------------------------------------------------------------------------------------------------------ | :------------- |
| `all`               | Always added                                                                                            | _N/A_          |
| `local`             | Added to search if the user is coming from [localIp](/admin/configuration#localIp).                     | _N/A_          |
| `remote`            | Added to search if the user is not coming from [localIp](/admin/configuration#localIp).                 | _N/A_          |
| `{userType}`        | Adds `staff` if the user is a staff member and `student` otherwise.                                     | _N/A_          |
| `local-{userType}`  | Added for `staff` and `student` if the user is coming from [localIp](/admin/configuration#localIp).     | _N/A_          |
| `remote-{userType}` | Added for `staff` and `student` if the user is not coming from [localIp](/admin/configuration#localIp). | _N/A_          |
| `{username}`        | Adds the current users username.                                                                        | _N/A_          |
| `{yearGroup}`       | Adds the current _students_ year group as set by the MIS                                                | year 8         |
| `{regGroup}`        | Adds the current _students_ form as set by the MIS                                                      | 8l             |
| `{class}`           | Added for every class the _student_ attends or the _staff_ teaches.                                     | `8l Ma`        |

### Using Scopes

When creating a shortcut you can create a comma seperated list of scopes that
the shortcut should appear for.

The scopes can either be a name or RegExp pattern.

#### Examples

These examples use some group names that are specific to the groups at Longridge
High School.

| Scopes    | Impact                                                                                                        |
| :-------- | :------------------------------------------------------------------------------------------------------------ |
| `all`     | Applies to all users.                                                                                         |
| `staff`   | Applies to all staff.                                                                                         |
| `/mu/`    | Applies to all groups that match `mu` for example a music class of `8c Mu`                                    |
| `/8*/rg/` | Applies to all students in a year 8 registration group, and the staff that teach a year 8 registration group. |

## Priority

Shortcuts are ordered by priority and then alphabeticaly. `1` to `10` appear on
the Start Screen and `11` will only show the shortcut on the all shortcuts
screen.
