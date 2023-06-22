# Staff Data

Staff Data is imported through the `/import/staff` endpoint, which accepts a
`POST` request with a JSON body that looks like this:

```json
[
  {
    "name": "Mr Teacher",
    "username": "mr.teacher"
  },
  {
    "name": "Mrs Office",
    "username": "mrs.office"
  },
  {
    "name": "Miss Teacher",
    "username": "miss.teacher"
  }
]
```

Where `name` is the display name of the user, be aware that this will appear on
the start page so first names may be show to students if the staff member is
displaying their browser. `username` is the username that matches the value sent
by `azure-upn` (excluding the @domain.com).

Any user imported on this endpoint will be matched by username and have the user
type set to `STAFF`.
