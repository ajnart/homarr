<h3 align="center">Homarr</h3>
<br>
<p align="center">
  <a href="https://github.com/ajnart/homarr/actions/workflows/docker.yml">
      <img title="Docker CI Status" src="https://github.com/ajnart/homarr/actions/workflows/docker.yml/badge.svg" alt="CI Status"></a>
    <a href="https://github.com/ajnart/homarr/releases/latest">
      <img alt="GitHub release (latest SemVer)" src="https://img.shields.io/github/v/release/ajnart/homarr"></a>
  <a href="https://github.com/ajnart/homarr/pkgs/container/homarr">
    <img alt="Docker Pulls" src="https://img.shields.io/docker/pulls/ajnart/homarr?label=Downloads%20"></a>
  </p>
  <p align="center">
  <a href="">
<img align="end" width=600 src="https://user-images.githubusercontent.com/49837342/168315259-b778c816-10fe-44db-bd25-3eea6f31b233.png" />
  <a/>
  </p>
  <p align = "center">
    A homepage for <i>your</i> server.
  <br/>
  <a href = "https://homarr.netlify.app/" > <strong> Demo ↗️ </strong> </a> • <a href = "#-installation" > <strong> Install ➡️ </strong> </a>
  <br />
  <br />
    <i>Join the discord!</i>
  <br />
    <a href = "https://discord.gg/aCsmEV5RgA" > <img title="Discord" src="https://discordapp.com/api/guilds/972958686051962910/widget.png?style=shield" > </a>
  <br/>  
    <br/>
</p>

# 📃 Table of Contents
- [📃 Table of Contents](#-table-of-contents)
- [🚀 Getting Started](#-getting-started)
  - [ℹ️ About](#ℹ️-about)
  - [⚡ Installation](#-installation)
    - [🐳 Deploying from Docker Image](#-deploying-from-docker-image)
    - [🛠️ Building from Source](#%EF%B8%8F-building-from-source)
  - [🔧 Configuration](#-configuration)
    - [🧩 Integrations](#--integrations)
    - [🧑‍🤝‍🧑 Multiple Configs](#-multiple-configs)
    - [🐻 Icons](#-icons)
    - [📊 Modules](#-modules)
    - [🔍 Search Bar](#-search-bar)
- [💖 Contributing](#-contributing)


<!-- Getting Started -->
# 🚀 Getting Started

## ℹ️ About

Homarr is a simple and lightweight homepage for your server, that helps you easily access all of your services in one place.
    
**[⤴️ Back to Top](#-table-of-contents)**

## 💥 Known Issues
- Posters on the Calendar get blocked by adblockers. (IMDb posters)
- Editing a service creates a duplicate (#97)
- Used search engine not properly selected (#35)

## ⚡ Installation

### 🐳 Deploying from Docker Image
> Supported architectures: x86-64, ARM, ARM64

_Requirements_:
- [Docker](https://docs.docker.com/get-docker/)

**Standard Docker Install**
```sh
docker run --name homarr -p 7575:7575 -v /data/docker/homarr:/app/data/configs -d ghcr.io/ajnart/homarr:latest
```

**Docker Compose**
```yml
---
version: '3'
#--------------------------------------------------------------------------------------------#
#                               Homarr -  A homepage for your server.                        #
#--------------------------------------------------------------------------------------------#
services:
  homarr:
    container_name: homarr
    image: ghcr.io/ajnart/homarr:latest
    restart: unless-stopped
    volumes:
      - /data/docker/homarr:/app/data/configs
    ports:
      - '7575:7575'
```

***Getting EACCESS errors in the logs? Try running `sudo chmod 775 /directory-you-mounted-to`!***

### 🛠️ Building from Source

_Requirements_:
- [Git](https://git-scm.com/downloads)
- [NodeJS](https://nodejs.org/en/) _(Latest or LTS)_
- [Yarn](https://yarnpkg.com/)

**Installing**

- Clone the GitHub repo: `git clone https://github.com/ajnart/homarr.git` & `cd homarr`
- Install all dependencies: `yarn install`
- Build the source: `yarn build`
- Start the NextJS web server: ``yarn start``
- *Note: If you want to update the code in real time, launch with ``yarn dev``*

## 🔧 Configuration

### 🧩  Integrations

Homarr natively integrates with your services. Here is a list of all supported services.

**Emby**
*The Emby integration is still in development.*

**Lidarr**
*The Lidarr integration is still in development.*

**Sonarr**
*Sonarr needs an API key.*<br>
Make a new API key in `Advanced > Security > Create new API key`<br>
**Current integration:** Upcoming media is displayed in the **Calendar** module.

**Plex**
*The Plex integration is still in development.*

**Radarr**
*Radarr needs an API key.*<br>
Make a new API key in `Advanced > Security > Create new API key`<br>
**Current integration:** Upcoming media is displayed in the **Calendar** module.

**qBittorent**
*The qBittorent integration is still in development.*

**[⤴️ Back to Top](#-table-of-contents)**

### 🧑‍🤝‍🧑 Multiple Configs

Homarr allows the usage of multiple configs. You can add a new config in two ways.

**Drag-and-Drop**
1. Download your config from the Homarr settings.
2. Change the name of the `.json` file and the name in the `.json` file to any name you want *(just make sure it's different)*.
3. Drag-and-Drop the file into the Homarr tab in your browser.
4. Change the config in settings.

**Using a filebrowser**
1. Locate your mounted `default.json` file.
2. Duplicate your `default.json` file.
3. Change the name of the `.json` file and the name in the `.json` file to any name you want *(just make sure it's different)*.
4. Refresh the Homarr tab in your browser.
5. Change the config in settings.

**[⤴️ Back to Top](#-table-of-contents)**

### 🐻 Icons

The icons used in Homarr are automatically requested from the [dashboard-icons](https://github.com/walkxhub/dashboard-icons) repo.

Icons are requested in the following way: <br>
`Grab name > Replace ' ' with '-' > .toLower() > https://cdn.jsdelivr.net/gh/walkxhub/dashboard-icons/png/{name}.png`

**[⤴️ Back to Top](#-table-of-contents)**

### 📊 Modules

Modules are blocks shown on the sides of the Homarr dashboard that display information. They can be enabled in settings.

**Clock Module**
The clock module will display your current time and date.

**Calendar Module**
The Calendar module uses [integrations](#--integrations-1) to display new content.

**[⤴️ Back to Top](#-table-of-contents)**

### 🔍 Search Bar

The Search Bar will open any Search Query after the Query URL you've specified in settings.

*(Eg. `https://www.google.com/search?q=*Your Query will be inserted here*`)*

**[⤴️ Back to Top](#-table-of-contents)**

# 💖 Contributing
**Please read our [Contribution Guidelines](/CONTRIBUTING.md)**

All contributions are highly appreciated.
    
**[⤴️ Back to Top](#-table-of-contents)**
