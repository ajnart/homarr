## 🦞 Homarr [v0.0.0](https://github.com/ajnart/homarr/compare/v0.0.0...v0.0.0) (2022-01-01)

<!-- Small release message -->

<!-- Bigger announcement marked in bold -->

### Upgrade Steps
*Upgrading without a mounted config? Make sure to download your config from the settings first! You can add it back later by drag and dropping it into your browser.*
* `docker pull ghcr.io/ajnart/homarr:latest`
* `docker stop [container_id]`
* `docker rm [container_id]`
* `docker run --name homarr -p 7575:7575 -v /data/docker/homarr:/app/data/configs -d ghcr.io/ajnart/homarr:latest` 
   * *(or use our [docker_compose.yml](https://github.com/ajnart/homarr#-installation))*

### Breaking Changes

### New Features

### Bug Fixes

### UI Changes

### GitHub Changes

### Other Changes

_**Special thanks to our contributors: @ajnart, @c00ldude1oo, @walkxcode, and of course all people using our project.**_
