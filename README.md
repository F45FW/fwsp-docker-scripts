In package.json, add script:

```
  "scripts": {
    "docker": "fwsp-docker-scripts"
  },
```

and dev dependency (make sure to run npm install after):

```
  "devDependencies": {
    "fwsp-docker-scripts": "0.0.1"
  }
```

In config.json:
```
  "docker": {
    "organization": "flywheelsports",
    "baseImage": "node:7.8.0-alpine",
    "author": "Eric Adum",
    "email": "eric@flywheelsports.com"
  },
```

Then you can run:

`npm run docker build` - builds and tags the image

`npm run docker push` - pushes the image to docker hub

`npm run docker run` - start container in interactive mode

`npm run docker up` - start container in daemon mode