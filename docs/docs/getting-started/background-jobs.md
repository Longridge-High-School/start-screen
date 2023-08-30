# Background Jobs

Start-Screen uses a background jobs worker to offload some tasks into the
background and prevent slow downs for the users.

It also uses this system to run some scheculed tasks.

- Clears old incidents from the status system. (Daily)
- Clears old messages from the info messages list. (Daily)
- Creates a backup. (Weekly)
