# Backups

Through the admin panel there is a system to backup the database and all files.

## Creating a backup

From the admin menu click _Backups_ and hit the _Backup_ button. This will dump
a copy of the database and zip it up with all the assets, adverts and shortcut
icons.

Once it completes a downlond link will appear to download a copy of the zip
file.

## Restoring a backup

> This is in early testing. Be careful resotring backups.

Select your backup and hit restore.

This will clear all your assets, adverts and shortcut icons and copy over the
files in the backup. It will then do a full restore of the database which will
overwrite your current database.

### Known Limitations

1. Database dump contains the database name so it needs to be consistent between
   the source and target.
