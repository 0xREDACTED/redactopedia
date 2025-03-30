---
title: Useful Commands
tags:
  - git
  - cli
---
## Replacing Author in commit history

Sometimes you might accidentally use the wrong username or email when committing changes to a repository. For example, you might accidentally use a work email on a public repository!
Luckily, this script can be used to replace all commits with the desired username and password:

```bash
git filter-branch --commit-filter '
	if [ "$GIT_AUTHOR_EMAIL" = "<INCORRECT EMAIL>" ];
	then
		GIT_AUTHOR_NAME="<NEW AUTHOR>";
		GIT_AUTHOR_EMAIL="<NEW EMAIL>";
		git commit-tree "$@";
	else
		git commit-tree "$@";
	fi' HEAD
```

## Deleting commit history
Consider the case that you want to just delete the commit history of a branch in your repository all-together. This can be done via the following steps:

1. Switch to the desired branch that you want to delete the history from
	```bash
	git switch <branch name>
	```
2. Create an orphan branch (this won't show when running `git branch`)
	```bash
	git checkout --orphan latest_branch
	```
3. Add all the files to the newly created branch
	```bash
	git add -A
	```
4. Commit the changes:
	```bash
	git commit -am "some commit message"
	```
5. Delete the branch you are removing history from (this is **permanent**)
	```bash
	git branch -D <branch name>
	```
6. Rename the orphan branch to the branch you just deleted
	```bash
	git branch -m <branch name>
	```
7. Force push the branch to the remote repository
	```bash
	git push -f origin <branch name>
	```