---
title: Faster GitLab Upgrades
tags:
  - git
---
When upgrading GitLab instances there are series of background migrations that take place at the end of the upgrade. These involve both database migrations and advanced search migrations.

GitLab *can* be used by users during background migrations, however, GitLab cannot be *upgraded* when background migrations are taking place.

>Strictly speaking you can initiate an upgrade however you are at risk of corrupting your database if you don't wait for the database migrations to finish.

This is a problem in cases where there are multiple upgrades in the [upgrade path](https://gitlab-com.gitlab.io/support/toolbox/upgrade-path/). The real kicker comes when there are a large amount of background migrations, which could take several hours if in GitLab instances with large amounts of data.
## Increasing number of Parallel Migrations
By default, on-prem GitLab deployments will only perform 2 parallel migrations at once. This uses a small amount of system resources but it very slow.

This is beneficial if the migrations are for the final upgrade in the path and users are actively using the system. However, if you want there to be downtime between upgrades and want to smash out the migrations as quickly as possible you'd want to increase this.

To check the existing setting, access the `gitlab-rails` console and type the following:
```ruby
Gitlab::CurrentSettings.database_max_running_batched_background_migrations
```
To set it to the desired amount, run the command below, substituting `<amount>` with the desired value. Note that it may take up to a minute for the setting to actually apply and the previous command to output the updated value.
```ruby
ApplicationSetting.update_all(database_max_running_batched_background_migrations: <amount>)
```