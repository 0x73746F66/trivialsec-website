FROM registry.gitlab.com/trivialsec/containers-common/nodejs

ARG NODE_ENV
ENV NODE_ENV $NODE_ENV

WORKDIR /srv/app
COPY public/ public/

USER root
RUN chown -R trivialsec:trivialsec /srv/app

USER trivialsec
COPY package.json package.json
RUN yarn -s --ignore-optional --non-interactive --no-progress --network-timeout 1800 --use-yarnrc .yarnrc
ENTRYPOINT ["npm"]
CMD ["run", "server"]
