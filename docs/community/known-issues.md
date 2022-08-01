---
sidebar_label: 'Known Issues'
sidebar_position: 2
tags:
  - Support
  - Help
  - Issues
  - Bug
  - Bugs
---

# Known Issues
Here we keep track of the currently known issues of Homarr, reported by our community or the developers.

## 🚨 Adblocker will break and block the posters of TV shows
Many popular ad-blockers will block the posters of TV-shows in your [calendar](./../modules/built-in-modules/module-calendar.md).

### Indicators
- Posters are not loading correctly
- Posters are replaced with some content from the ad-blocker

### Resolution
Please disable your ad-block for Homarr.
Most blockers will offer a switch, where you can disable them for Homarr only.

## 🚨 Docker container requires a restart after making modifications to the icons
If you are using [custom icons](./../advanced-configuration/custom-icons.md), you might be unable to get them working in the services.

### Indicators
- You've mounted the configuration path of Homarr
- You've uploaded / copied icons in the correct folder, [specified in our documentation](./../advanced-configuration/custom-icons.md#adding-your-own-icons)
- You've used the icons in the services, but they don't display

### Resolution
For the time being, restart your docker container after adding / making any changes to your icons.
