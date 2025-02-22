# Redactopedia

This repo contains the code for the redactopedia, a collection of knowledge, architectural preferences, as well tips and tricks for common pitfalls that I have accumulated and built throughout my software career :). 

The redactopedia is an Obsidian project, which is then converted into a static site via Quartz 4.0 and hosted at https://0xredacted.github.io/redactopedia/

## Developer guide 

### Requirements

Quartz v4 requires:
- `npm >= 9.3.1`
- `node == 20 || node >= 22`

### Setting up the repo & contributing

After cloning the repo, run the following command to set the actual quartz github repository as an upstream remote. This is required for quartz updates
```bash
git remote add upstream https://github.com/jackyzha0/quartz.git
```

Next, run `npm i` to install all dependencies

Whenever a change has been made, run the following command to push updates to the repository:
```bash
npx quartz sync
```
