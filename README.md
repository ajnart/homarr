
<!-- Project Title -->
<h1 align="center">Homarr</h1>

<!-- Badges -->
<p align="center">
<img src="https://img.shields.io/github/stars/ajnart/homarr?label=%E2%AD%90%20Stars&style=flat-square?branch=master&kill_cache=1%22">
<a href="https://github.com/ajnart/homarr/releases/latest">
  <img alt="Latest Release (Semver)" src="https://img.shields.io/github/v/release/ajnart/homarr?label=%F0%9F%9A%80%20Release">
</a>
<a href="https://github.com/ajnart/homarr/actions/workflows/docker.yml">
  <img title="Docker CI Status" src="https://github.com/ajnart/homarr/actions/workflows/docker.yml/badge.svg" alt="CI Status">
</a>
<a href=https://crowdin.com/project/homarr>
<img title="Translations" src="https://badges.crowdin.net/homarr/localized.svg" />
</a>
<a href="https://discord.gg/aCsmEV5RgA">
  <img title="Discord" src="https://discordapp.com/api/guilds/972958686051962910/widget.png?style=shield">
</a>
</p>

<!-- Links -->
<p align="center">
<i>Join the discord! — Don't forget to star the repo if you are enjoying the project!</i>
</p>
<p align="center">
<a href="https://homarr.ajnart.fr/"><strong> Demo ↗️ </strong></a> • <a href="https://homarr.vercel.app/docs/introduction/installation"><strong> Install ➡️ </strong></a> • <a href="https://homarr.vercel.app/docs/about"><strong> Read the Docs 📄 </strong></a>
</p>

---

<!-- Homarr Description -->
<img align="right" width=150 src="public/imgs/logo/logo-color.svg" />

Homarr is a simple and lightweight homepage for your server, that helps you easily access all of your services in one place.

It integrates with the services you use to display information on the homepage (E.g. Show upcoming Sonarr/Radarr releases).

For a full list of integrations, [head over to our documentation](https://homarr.vercel.app/docs/advanced-configuration/integrations).

If you have any questions about Homarr or want to share information with us, please go to one of the following places:

- [Github Discussions](https://github.com/ajnart/homarr/discussions)
- [Discord Server](https://discord.gg/aCsmEV5RgA)

*Before you file an [issue](https://github.com/ajnart/homarr/issues/new/choose), make sure you have read the [known issues](#-known-issues) section.*

**For more information, [read the documentation!](https://homarr.vercel.app/docs/about)**

<details>
  <summary><b>Table of Contents</b></summary>
  <p>

- [✨ Features](#-features)
- [👀 Preview](#-preview)
- [💥 Known Issues](#-known-issues)
- [🚀 Installation](#-installation)
  - [🐳 Deploying from Docker Image](#-deploying-from-docker-image)
  - [🛠️ Building from Source](#️-building-from-source)
- [💖 Contributing](#-contributing)
- [📜 License](#-license)

  </p>
</details>

---

## ✨ Features
- Integrates with services you use.
- Search the web directly from your homepage.
- Real-time status indicator for every service.
- Automatically finds icons while you type the name of a service.
- Widgets that can display all types of information.
- Easy deployment with Docker.
- Very light-weight and fast.
- Free and Open-Source.
- And more...

**[⤴️ Back to Top](#homarr)**

---

## 👀 Preview
<img alt="Homarr Preview" align="center" width="100%" src="https://user-images.githubusercontent.com/71191962/169860380-856634fb-4f41-47cb-ba54-6a9e7b3b9c81.gif" />

**[⤴️ Back to Top](#homarr)**

---

## 💥 Known Issues
- Posters on the Calendar get blocked by adblockers. (IMDb posters)

**[⤴️ Back to Top](#homarr)**

---

## 🚀 Installation
### 🐳 Deploying from Docker Image
> Supported architectures: x86-64, ARM, ARM64

_Requirements_:
- [Docker](https://docs.docker.com/get-docker/)

**Standard Docker Install**
```bash
docker run  \
  --name homarr \
  --restart unless-stopped \
  -p 7575:7575 \
  -v ./homarr/configs:/app/data/configs \
  -v ./homarr/icons:/app/public/icons \
  -d ghcr.io/ajnart/homarr:latest
```

**Docker Compose**
```yml
version: '3'
#---------------------------------------------------------------------#
#                Homarr -  A homepage for your server.                #
#---------------------------------------------------------------------#
services:
  homarr:
    container_name: homarr
    image: ghcr.io/ajnart/homarr:latest
    restart: unless-stopped
    volumes:
      - ./homarr/configs:/app/data/configs
      - ./homarr/icons:/app/public/icons
    ports:
      - '7575:7575'
```

```sh
docker compose up -d
```

*Getting EACCESS errors in the logs? Try running `sudo chmod 777 /directory-you-mounted-to`!*

**[⤴️ Back to Top](#homarr)**

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

**[⤴️ Back to Top](#homarr)**

---

## 💖 Contributing
**Please read our [Contribution Guidelines](/CONTRIBUTING.md)**

All contributions are highly appreciated.

**[⤴️ Back to Top](#homarr)**

---


## 📜 License
Homarr is Licensed under [MIT](https://en.wikipedia.org/wiki/MIT_License)

```txt
Copyright © 2022 Thomas "ajnart" Camlong

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

**[⤴️ Back to Top](#homarr)**

---

<p align="center">
  <i>Thank you for visiting! <b>For more information <a href="https://homarr.vercel.app/docs/about">read the documentation!</a></b></i>
  <br/>
  <br/>
</p>
