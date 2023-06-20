# Doodles

Start Screen has a _Doodle_ system that allows a [MDX](/guides/working-with-mdx)
component to be displayed on the start page.

The start page will find the first doodle that:

- has a start date before or equal to today.
- has an end date after or equal to today.
- sorted by the soonest end date first.

This allows doodles to overlap, letting you have a long running doodle that gets
replaced by a single day doodle.

## Default Doodle

To create a doodle that appears whenever there isn't another doodle available
simply set the start date to the day of install or earlier and set the end date
to a few years in the future.

> For example 1/1/1970 to 1/1/2070.

## Creating a Doodle

From the admin panel doodles you can create an _empty_ doodle by supplying the
name, start date and end date. If the doodle only needs to display for a single
day set the start and end date to the same date.

Once created you will be taken to the edit page for the new doodle.

## Editing Doodles

The doodle editor has the same options as the create form plus the MDX code
editor.

The doodle preview can be displayed at either _16:9_ or _4:3_ to test the layout
on those screen resolutions.

The current users username is passed to the doodle through the text box on the
preview. This allows you to test any generation based on the username.

## Example Doodles

- [Star Wars Day](/features/doodles/star-wars-day)
