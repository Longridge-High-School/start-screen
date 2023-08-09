# System Status

System Status is a simple status page for your school that can track incidents.

## Component Groups

Groups are the top level object that all components will be a member of. Groups
would be something like _Core Services_, _Cloud Applications_, etc...

Groups can be set to open expanded by default so that users can see all the
components in the group by default.

When displayed groups are display the worse status of all its components.

## Components

A component is the item that has a status and is the container for incidents.

You can manually set the status of a component, how ever its better to use
incidents to change it away from _Operational_.

## Incidents

You can create an incident for a component that will change the components
status.

These incidents can then have update messages that also set the status.

Once an update message sets the status back to _Operational_ the incident will
be _closed_ and deleted after 24 hours.
