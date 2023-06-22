# Student Data

Student Data is imported through the `/import/students` endpoint, which accepts
a `POST` request with a JSON body that looks like this:

```json
[
  {
    name: "A Pupil"
    username: "22apupil"
    upn: "Abcdef"
    yearGroup: "Year 8"
    regGroup: "8L"
  },
  {
    name: "B Pupil"
    username: "23bpupil"
    upn: "zxyv1"
    yearGroup: "Year 7"
    regGroup: "7O"
  }
]
```

| Field       | Value                                               |
| :---------- | :-------------------------------------------------- |
| `name`      | The students display name                           |
| `username`  | The students username as passed through `azure-upn` |
| `upn`       | The students UPN from the MIS                       |
| `yearGroup` | The students year group, exposed as a scope         |
| `regGroup`  | The students registration group, exposed as a scope |

Any user imported on this endpoint will be matched by username and have the user
type set to `STUDENT`.
