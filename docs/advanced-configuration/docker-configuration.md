---
tags:
  - Docker
  - Container
  - Kubernetes
  - Hosting
  - Timezone
  - Container Engine
---

# Docker Configuration

Homarr offers a Docker container, which can be used for serving from any compatible linux system, unRAID, Kubernetes and many more systems! Our Docker container is based on the ``node:16-alpine`` image and serves per standard on the port 7575.

## Docker environment variables

Our docker container offers multiple environment variables for further configuration. If you wish to serve your Homarr Dashboard on a different port, you can adjust it trough the variables.

| Environment Variable | Description                                                 | Examples           |
| -------------------- | ----------------------------------------------------------- | ------------------ |
| ``BASE_URL``         | Allows you to change the base URL you use to access Homarr  | homarr.example.com |
| ``PASSWORD``         | Allows you to set a password for Password protection        | -                  |
| ``PORT``             | Allows you to change the default port Homarr uses to deploy | ``1234``           |

## Configuring the time zone

Some users might experience issues with their [calendar releases](./../modules/built-in-modules/module-calendar.md) in Homarr.
This is because the calendar is using the server-side time.
Although you should always set your host machine to your local time zone, you should specify the timezone for your Homarr Docker container to ensure that the timezone is always set correctly.

Usually, the default timezone, if no timezone flag is given, will be ``Europe/London``.

If the timezone is not set correctly, you might see wrong dates in your calendar or completely miss releases.

If you don't know your timezone, you can find it out [on this Wikipedia article](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) - Simply copy the value at the column "TZ database name".

### Set timezone when using docker run
You can set the timezone using the ``--tz`` when running ``docker run``.

**Example:**
```bash
docker run  \
  --name homarr \
  --restart unless-stopped \
  --tz=Europe/Berlin \
  -p 7575:7575 \
  -v ./homarr/configs:/app/data/configs \
  -v ./homarr/icons:/app/public/icons \
  -d ghcr.io/ajnart/homarr:latest
```

### Set timezone when using docker-compose
If you're using docker-compose, you can add the following property:
```yaml
environment:
  - TZ=America/Denver
```

<hr/>

Please note that this should work on nearly all systems. Check out these two amazing articles by howtogeek on timezones in containers:
- [How to Handle Timezones in Docker Containers](https://www.howtogeek.com/devops/how-to-handle-timezones-in-docker-containers/)
- [What Is Podman and How Does It Differ from Docker?](https://www.howtogeek.com/devops/what-is-podman-and-how-does-it-differ-from-docker/)