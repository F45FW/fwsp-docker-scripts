# fwsp-docker-script
Package for managing the lifecycle of docker service images

## Installation
In package.json, add script:
```
  "scripts": {
    "docker": "fwsp-docker-scripts"
  },
```

and dev dependency (make sure to run npm install after):
```
  "devDependencies": {
    "fwsp-docker-scripts": "0.0.2"
  }
```

In config.json:
```
  "docker": {
    "organization": "flywheelsports",
    "baseImage": "flywheelsports/servicebase:0.0.3-alpine",
    "author": "Eric Adum",
    "email": "eric@flywheelsports.com"
  },
```
The image `flywheelsports/servicebase:0.0.3-alpine` contains a few nice upgrades on top of node 8 alpine, such as: `curl` which is used for docker healthchecks and linux performance tuning settings.

## Commands
`npm run docker build` - builds and tags the image

`npm run docker push` - pushes the image to docker hub

`npm run docker run` - start container in interactive mode

`npm run docker up` - start container in daemon mode