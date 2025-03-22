---
title: Dual Booting
tags:
  - operating-systems
  - windows
  - linux
---
## Wrong time in Windows after Dual boot
>This fix will only work for Linux distributions that use `systemd` includes Ubuntu, RHEL, Arch Linux, etc.

After creating a dual boot between your Windows and Linux partitions, you'll likely encounter an issue where upon returning to your Windows OS the time is out of whack.

The reason for this is because by default, Linux assumes that the time stored in the hardware clock is in UTC, not local time. On the other hand, Windows assumes that the time stored on the hardware clock is in local time.

Luckily, the fix for this is simple. Boot into your Linux partition and run the following command:
```bash
sudo timedatectl set-local-rtc 1 
```