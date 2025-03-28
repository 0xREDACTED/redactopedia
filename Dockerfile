##############################################################
# Setup node image
##############################################################

ARG ALPINE_VERSION=3.21.3
ARG NODE_VERSION=23.9.0

FROM node:${NODE_VERSION}-alpine AS node
FROM alpine:${ALPINE_VERSION}

COPY --from=node /usr/lib /usr/lib
COPY --from=node /usr/local/lib /usr/local/lib
COPY --from=node /usr/local/include /usr/local/include
COPY --from=node /usr/local/bin /usr/local/bin

##############################################################
# Install quartz
##############################################################

ARG QUARTZ_VERSION=b397dae95113b0eaaf8054adf951fc533791bd0d

WORKDIR /quartz

RUN addgroup -S quartz && \
    adduser -S quartz -G quartz

RUN apk add --no-cache --update coreutils git && \
    git clone https://github.com/jackyzha0/quartz.git . && \
    git -c advice.detachedHead=false checkout "${QUARTZ_VERSION}" && \
    apk del git

COPY --chown=quartz:quartz entrypoint.sh .
RUN chmod +x ./entrypoint.sh

RUN npm ci

RUN chown -R quartz:quartz /quartz

COPY --chown=quartz:quartz customisations/ .
COPY --chown=quartz:quartz content content

USER quartz

CMD ["./entrypoint.sh"]