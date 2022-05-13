<p align = "center">
  <h3 align = "center"> Homarr <h3>

  <p align = "center">
    A homepage for <i>your</i> server.
  <br/>
  <a href = "https://github.com/ajnart/homarr/deployments/activity_log?environment=Production" > <strong> Demo ↗️ </strong> </a> • <a href = "#install" > <strong> Install ➡️ </strong> </a>
  <br />
  <br />
  <a href = "https://discord.gg/aCsmEV5RgA" > <img src="https://discordapp.com/api/guilds/972958686051962910/widget.png?style=shield" > </a>
</p>
</p>

# 📃 Table of Contents
- [📃 Table of Contents](#-table-of-contents)
- [🚀 Getting Started](#-getting-started)
  - [ℹ️ About](#ℹ️-about)
  - [⚡ Installation](#-installation)
    - [Deploying from Docker Image 🐳](#deploying-from-docker-image-)
    - [Building from Source 🛠️](#building-from-source-️)
- [💖 Contributing](#-contributing)

<!-- Getting Started -->
# 🚀 Getting Started

## ℹ️ About

Homarr is a simple and lightweight homepage for your server, that helps you easily access all of your services in one place.
    
**[⤴️ Back to Top](#-table-of-contents)**

## ⚡ Installation

### Deploying from Docker Image 🐳
> Supported architectures: x86-64, ARM, ARM64

_Requirements_:
- [Docker](https://docs.docker.com/get-docker/)

**Standard Docker Install**
```sh
docker run --name homarr -p 7575:7575 -d ghcr.io/ajnart/homarr
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
    image: ghcr.io/ajnart/homarr
    restart: unless-stopped
    ports:
      - '7575:7575'
```

### Building from Source 🛠️

_Requirements_:
- [Git](https://git-scm.com/downloads)
- [NodeJS](https://nodejs.org/en/) _(Latest or LTS)_
- [Yarn](https://yarnpkg.com/)
- Some web server

**Installing**

- Clone the GitHub repo: `git clone https://github.com/ajnart/homarr.git` & `cd homarr`
- Install all dependencies: `yarn install`
- Build the source: `yarn export`
- Start a web server (Any web server will work):
  - _Examples:_
    - NodeJS serve: `npm i -g serve` or `yarn global add serve` & `serve ./out`
    - python http.server: `python -m http.server 7474 --directory out`
    
**[⤴️ Back to Top](#-table-of-contents)**

# 💖 Contributing
You can contribute by [Starting a discussion](https://github.com/ajnart/homarr/discussions), [Submitting Bugs](https://github.com/ajnart/homarr/issues/new), [Requesting Features](https://github.com/ajnart/homarr/issues/new), or [Making a pull request](https://github.com/ajnart/homarr/compare)!

All contributions are highly appreciated.
    
**[⤴️ Back to Top](#-table-of-contents)**
