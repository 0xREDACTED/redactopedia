---
title: Headset Stuck on same Volume - Ubuntu
tags:
  - ubuntu
---
One strange issue that can be encountered on Ubuntu is when headphones are stuck on the same volume. Increasing the volume in the settings (or the keyboard) will have no impact on the output - however, the volume control on the headphones themselves does (In my experience I was using a Corsair Virtuoso headset).

This is ultimately caused by GNOME's sound slider mapping to the wrong `ALSA` control element (the interface that controls the device's sound).

> In the case of my Corsair Virtuoso, there is a toggle-able feature that let's one hear the microphone's input. I believe by default GNOME mapped to this control element, causing the volume control to actually increase or decrease the sound of the played back input. 
## Required Tools
In order to determine what files to tweak, we need to make use of `pactl`, a CLI tool used to control the `PulseAudio` sound server.

By default, versions of Ubuntu < 22.10 use `PulseAudio` as the sound server, so this *should* be installed. You can check by running:
```sh
pactl --version
```

On the other-hand, versions of Ubuntu ≥ 22.10 use `PipeWire` as the default server for handling audio. However, they include `pipewire-pulse`, a `PulseAudio` compatible daemon that integrates with `PipeWire`. This means we can use `PulseAudio` tools, which are quite useful. 

To install `pactl` run:
```sh
sudo apt-get install pulseaudio-utils
```
## Identifying the correct control element
Run the following command in the terminal to open `AlsaMixer`:
```sh
alsamixer
```

Inside the `AlsaMixer` GUI, press `F6` to select a sound card. In the case of my Corsair Virtuoso I had to select the following: 

![[alsamixer-select-sound-card.png|500]]

This brought up the following two sliders where the left one did nothing but the right one correctly changed the volume - this is the correct control element that GNOME *should* be mapped to.

![[alsamixer-sliders.png|250]]
## Setting the correct control element
To set the correct control element we must first determine which ALSA profile is in use by the card and thus which one to modify. The ALSA profile is the configuration used by the sound server to configure and expose ALSA sound devices.

To find the profile in use, run:
```sh
pactl list sinks
```
then find your audio device and take note `Active Port`'s value at the bottom of the sink's details. For example:
![[pactl-list-sink-active-port.png]]
This port name will map to the ALSA configuration profile name. Given the value above, if you are on an older Ubuntu that uses `PulseAudio` run the following to edit the config:
```sh
sudo nano /usr/share/pulseaudio/alsa-mixer/paths/analog-output-headphones.conf
```

Otherwise, if you are on a newer version of Ubuntu that uses `PipeWire` run the following:
```sh
sudo nano /usr/share/alsa-card-profile/mixer/paths/analog-output-headphones.conf
```

Find the entry for the incorrect element and rename it to the correct one. For example, I had to find the following:
```ini
[Element Headset]
...
```
and set it to
```ini
[Element Headset 1]
...
```

After doing that, restart your audio server. For `PulseAudio`:
```sh
systemctl --user restart pulseaudio.service
```

and for `PipeWire`:
```sh
systemctl --user restart pipewire pipewire-pulse
```

>You will have to restart any application that uses audio for it to pickup the new settings (e.g. Spotify)