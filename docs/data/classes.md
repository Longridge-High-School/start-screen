# Class Data

Class Data is imported through the `/import/classes` endpoint, which accepts a
`POST` request with a JSON body that looks like this:

```json
{
  "7 Ma1": {
    "name": "7 MA1",
    "teacherUsername": "mr.teacher",
    "students": ["zxyv1"]
  }
}
```

> Unlike Staff and Students this is an object indexed by the class name

| Field             | Value                                                 |
| :---------------- | :---------------------------------------------------- |
| `name`            | The Classes name, exposed as a scope                  |
| `teacherUsername` | The teachers uesrname, used to link them to the class |
| `students`        | An array of Student UPNs for the class                |
