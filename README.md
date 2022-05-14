<h3 align="center">Homarr</h3>
<br/>
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
  <a href = "https://github.com/ajnart/homarr/deployments/activity_log?environment=Production" > <strong> Demo ↗️ </strong> </a> • <a href = "#-installation" > <strong> Install ➡️ </strong> </a>
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
  - [🐛 Known Issues](#-known-issues)
  - [⚡ Installation](#-installation)
    - [Deploying from Docker Image 🐳](#deploying-from-docker-image-)
    - [Building from Source 🛠️](#building-from-source-️)
- [💖 Contributing](#-contributing)

<!-- Getting Started -->
# 🚀 Getting Started

## ℹ️ About

Homarr is a simple and lightweight homepage for your server, that helps you easily access all of your services in one place.
    
**[⤴️ Back to Top](#-table-of-contents)**

## 🐛 Known Issues

-  Application cards not responsive https://github.com/ajnart/homarr/issues/47
-  Icon alignment out for specific icons https://github.com/ajnart/homarr/issues/82

## ⚡ Installation

### Deploying from Docker Image 🐳
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

### Building from Source 🛠️

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

# 💖 Contributing
**Please read our [Contribution Guidelines](/CONTRIBUTING.md)**

All contributions are highly appreciated.
    
**[⤴️ Back to Top](#-table-of-contents)**
