const config = require('fwsp-config');
const fs = require('fs');
const spawn = require('child_process').spawn;
const DEFAULT_DOCKER_HUB_ORG = 'flywheelsports';

class DockerScripts {
  constructor(name, version) {
    this.package = { name, version };
    this.modes = {
      build: () => ['docker', ['build', '-t', this.getTag(), process.cwd()], { stdio: 'inherit' }],
      run: () => ['docker', ['run', '-it', this.getTag()], { stdio: 'inherit' }],
      up: () => ['docker', ['run', '-d', this.getTag()], { detached: true }],
      push: () => ['docker', ['push', this.getTag()]]
    };
  }
  getTag() {
    return `${this.config.organization}/${this.package.name}:${this.package.version}`;
  }
  getDockerfile(entryPoint, exposePort, logger = false) {
    return `
    FROM ${this.config.baseImage}
    MAINTAINER ${this.config.author} ${this.config.email}
    EXPOSE ${exposePort}
    ARG NPM_TOKEN
    RUN mkdir -p /usr/src/app
    WORKDIR /usr/src/app
    ADD . /usr/src/app
    RUN echo "//registry.npmjs.org/:_authToken=\${NPM_TOKEN}" > .npmrc
    ${logger ? 'RUN npm install pino-elasticsearch -g' : ''}
    RUN npm install --production
    RUN rm -f .npmrc
    ENTRYPOINT ["node", "${entryPoint}"]
    `;
  }
  _run(mode) {
    let args = this.modes[mode]();
    console.log(`Running '${[args[0], ...args[1]].join(' ')}'`);
    let docker = spawn(...args);
    docker.on('close', code => console.log(`docker ${mode} exited with code ${code}`));
  }
  run(mode) {
    if (!this.modes[mode]) {
      console.log(`No such mode '${mode}'. Available modes: ${Object.keys(this.modes).join(', ')}.`);
      return;
    }
    if (!fs.existsSync('config/config.json')) {
      console.log('config/config.json must exist to run docker scripts');
      process.exit(1);
    }
    config.init('./config/config.json')
      .then(() => {
        if (!config.docker) {
          // TODO might want to fall back on some reasonable defaults
          console.log('config.json missing docker section');
          process.exit(1);
        }
        this.config = config.docker;
        if (mode === 'build') {
          if (fs.existsSync('Dockerfile')) {
            console.log('Dockerfile already exists, running docker build...');
            this._run(mode);
          } else {
            console.log('No Dockerfile found, loading config.json and generating one...');
            let Dockerfile = this.getDockerfile(
              config.hydra.serviceName,
              config.hydra.servicePort,
              config.hydra.plugins && config.hydra.plugins.logger ? true : false
            ).split(/\n/).map(v => v.trim()).filter(v => v.length).join('\n');
            console.log(Dockerfile);
            fs.writeFile('Dockerfile', Dockerfile, err => {
              if (err) {
                console.log('Error writing Dockerfile', err);
                process.exit(1);
              } else {
                console.log('Wrote Dockerfile');
                this._run(mode);
              }
            });
          }
        } else {
          this._run(mode);
        }
      });
  }
}

if (require.main === module) {
  let {npm_package_name, npm_package_version} = process.env;
  let mode = process.argv[2];
  new DockerScripts(npm_package_name, npm_package_version).run(mode);
} else {
  module.exports = DockerScripts;
}
