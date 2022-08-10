---
tags:
  - Modules
  - Docker
  - Management
  - Container
---

# 🐳 Docker Module

The Docker modules allows you to interact with Docker containers running on your system direclty within Homarr.

You can **restart**, **stop**, **start**, **refresh** and **remove** containers as well as **add** them to the Homarr dashboard

![Docker Core Features](https://user-images.githubusercontent.com/190136/180496007-8456e486-a864-4510-b91f-fabf74df020c.png)

Additonally, if you have a lot of containers you can search and filter them by **container** or **image** name

![Contailer and Image Search](https://user-images.githubusercontent.com/190136/180496391-12a9a1c6-a54b-4d22-98ea-a5eb3a93fce4.png)

View the state of each container (**created**, **running** or **stopped**)

![Container States](https://user-images.githubusercontent.com/190136/180598244-61c1db95-ed04-48c9-9577-2bd5ebff3ae9.png)

And also check what ports the container has exposed (container port:external port)

![Exposed Ports](https://user-images.githubusercontent.com/190136/180598308-b24c7e83-e278-4556-a177-143fdd347f28.png)


## Before you begin
In order for Homarr to be able to interact with your Docker instance you must tell Homarr the path to your Docker socket.  You do this by adding the following to the Docker command when you first run Homarr:

`-v /var/run/docker.sock:/var/run/docker.sock
`

## Activating the Module
Please read our documentation on [how to enable a module](./../index.md#activating-a-module).
