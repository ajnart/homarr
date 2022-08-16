---
sidebar_position: 1
tags:
  - Modules
  - Time
  - Date
  - Calendar
  - Integration
---

# 📆 Calendar Module

The calendar Module will use the Integrations to display upcoming content.
It can display upcoming conent from all supported media integrations.

The Supported integrations for the calendar module currently, are:
[Sonarr](./../../advanced-configuration/integrations.md#sonarr), [Radarr](./../../advanced-configuration/integrations.md#radarr-integration), [Lidarr](./../../advanced-configuration/integrations.md#lidarr) and [Readarr](./../../advanced-configuration/integrations.md#readarr)

You must select the coresponding service type when adding your instances of the supported integrations, so Homarr can communicate with them accordingly:

![](./img/module-calendar-integration-sonarr-example.png)

Additionally, you must copy the api authentication token from your applications and paste it into the configuration of your service:

![screenshot of where the api key goes](./img/module-calendar-integration-api-key.png)

You can get your api key from your application, for example Sonarr. After selecting the correct service type, Homarr will help you and provide a link on where to get your api key:

![screenshot of the key link below the input field](./img/module-calendar-integration-api-key-link.png)

## Activate the Module
Please read our documentation on [how to enable a module](./../index.md#activating-a-module).

## Indicators for releases from your integrations

The calendar module will use the calendar from your services.
Currently, the calendar module supports Readarr, Radarr, Sonarr and Lidarr.

![screenshot of the calendar with multiple indicators](./img/module-calendar-indicators.png)

:::info

Homarr will only load the previous, current and next month from your integrations. This means, releases in 2+ / 2- months will not be loaded and visible in the calendar.

:::

### Load data from your existing services

Homarr loads the calendar data from your existing services on your dashboard.
This means, if you want to integrate any of the above mentioned applications, you must add them as a service to the dashboard any select their coressponding service type:

![example of correct service type for sonarr](./img/module-calendar-integration-sonarr-example.png)

The calendar module will display only one indicator per day. This means, if you have multiple releases, from a single service or multiple services, you may not see all indicators.

### Colors of indicators and their meaning

All indicators in the calendar have a specific color depending on their service:

| Color         | Integration | Project link                                 |
| ------------- | ----------- | -------------------------------------------- |
| 🔴 *(red)*    | Readarr     | [Readarr project link](https://readarr.com/) |
| 🟡 *(yellow)* | Radarr      | [Radarr project link](https://radarr.video/) |
| 🟢 *(green)*  | Lidarr      | [Lidarr project link](https://lidarr.audio/) |
| 🔵 *(blue)*   | Sonarr      | [Sonarr project link](https://sonarr.tv/)    |

## Release informations

Days with indicators can be clicked and offer additional information about all releases on this date:

![example after clicking on one day](./img/module-calendar-day-information.png)

The popup will display detailed information about the release, such as title, description, cover if available, tags if available and more.

:::info

We have noticed, that the scrollbar is on some devices poorly visible.
We'll fix this in a future update of Homarr.

:::

### Release Poster
Homarr will load the images from your integration, for example Sonarr.
It filters trough all images of the release and takes the first match, that is of the cover-type ``poster``.

:::warning

Some Adblockers are preventing Homarr from loading your posters. This is a [well known issue](./../../community/known-issues.md) in our community. To solve this issue, please disable your adblocker for Homarr.

:::

### Release Link

Homarr will add a little link button besides the title, which links to ImDb:

![screenshot of release link in the calendar](./img/module-calendar-release-link.png)

Please note, that the ImDb link will only be displayed for releases from Radarr and Sonarr.

## Configuration

| Configuration        | Description | Values | Default Value |
| -------------------- | ----------- | ------ | ------------- |
| Start week on sunday | Determines, if the calendar week should start on Sunday. If deactivated, Week will start on Monday. | yes / no | no |

![configuration of the calendar module](./img/module-calendar-configuration.png)

:::tip

Check out our documentation on [how to configure a module](./../index.md#configure-a-module).

:::

## Screenshots

![calendar in light mode](img/module-calendar-light-mode.png)

![calendar in dark mode](img/module-calendar-dark-mode.png)

![calendar show from integrations](img/module-calendar-show.gif)