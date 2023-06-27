# Deploying to Users

Once you have [AAP](/guides/configuring-aap) setup and your
[users imported](/guides/importing-from-your-mis) it's time to deploy the start
screen to users.

For each browser on your network:

1. Set the Homepage/Start pages to `https://your.host/start`
2. Set the New Tab page to `https://your.host/start?newtab`

> `/start?newtab` disables the _pop-in_ animation on the shortcuts.

For some browsers you may need an extension for true seamless single sign on.
For example,
[Windows Accounts](https://chrome.google.com/webstore/detail/windows-accounts/ppnbnpeolgkicgegkbkbjmhlideopiji)
for Google Chrome.
