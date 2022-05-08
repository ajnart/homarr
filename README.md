# MyHomePage, a home page for your home server
Join the discord ! : https://discord.gg/C2WTXkzkwK
## What is MyHomePage ?

HomePage is a web page for your home server, it provides a user friendly interface to access docker containers or other services.

## Install
### Docker installation
Required : Docker
#### Standard docker install
To install the MyHomePage docker image simply execute ``docker pull ajnart/mhp``
To run the docker file ``docker run --name my-home-page -p 7575:80 -d ajnart/mhp``
*Note: Currently the port used is 80 (Nginx default port) It will change to be 7575 by default*
#### Docker compose
Here's a docker compose example on how to integrate MHP into your container stack
```docker
services:
  mhp:
    image: ajnart/mhp
    ports:
      - '7575:80'
    restart: always
```
### Local installation
Required: Node (LTS)
#### Install using node
To install MyHomePage locally:
- Clone the source code or download it.
- Execute ``npm install`` or ``yarn install`` *(prefered)* to install the dependencies
- Execute ``yarn export`` to build the source code into the final HTML pages in the ``./out`` folder
- Run a web server to serve the content of the ``./out`` folder. Example: ``python -m http.server 7575 --directory out``
