# Redactopedia

This repo contains the code for the redactopedia, a collection of knowledge, architectural preferences, as well tips and tricks for common pitfalls that I have accumulated and built throughout my software career :). 

The redactopedia is an Obsidian project, which is then converted into a static site via [Quartz 4.0](https://github.com/jackyzha0/quartz) and hosted at https://0xredacted.github.io/redactopedia/

## Developer guide 

All that is needed to run the redactopedia locally is docker. After cloning the repo, simply run the following command
which will host the redactopedia at http://localhost:8080 with hot-reload enabled over port 3001:

```bash
docker run --rm -it -p 8080:8080 -p 3001:3001 -v ./content:/quartz/content $(docker build -q .)
```