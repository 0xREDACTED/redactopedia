# Anthopedia

This repo contains the code for the anthopedia, a collection of knowledge, architectural preferences, as well tips and tricks for common pitfalls that I have accumulated and built throughout my software career :). 

The anthopedia is an Obsidian project, which is then converted into a static site via [Quartz 4.0](https://github.com/jackyzha0/quartz) and hosted at https://anthops.github.io/anthopedia/

## Developer guide 

All that is needed to run the anthopedia locally is docker. After cloning the repo, simply run the following command
which will host the anthopedia at http://localhost:8080 with hot-reload enabled over port 3001:

```bash
docker run --rm -it -p 8080:8080 -p 3001:3001 -v ./content:/quartz/content $(docker build -q .)
```