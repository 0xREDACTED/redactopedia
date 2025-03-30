---
title: File Timestamps
tags:
  - git
  - cli
---
## Set timestamps of checked-out files to match Git
After cloning or pulling new files in from a git repository the timestamps for all files will be equal to the exact time that you cloned or pulled the repository / files.
If, for whatever reason, you wanted to set the timestamps of the local files to match what is represented in the git repository, you can create and run this script :
```sh
if [ $# = 0 ]; then
  git ls-files -z | xargs -0 sh "$0"
  exit $?
fi

for file in "$@"; do
  time="$(git log --pretty=format:%cd -n 1 \
                  --date=format:%Y%m%d%H%M.%S --date-order -- "$file")"
  if [ -z "$time" ]; then
    echo "ERROR: skipping '$file' -- no git log found" >&2
    continue
  fi
  touch -m -t "$time" "$file"
done
```
With this we can either:
- Update all tracked files in the repository by running it from within the repository with no arguments:
	```sh
	./update-ts.sh
	```
- Update specific files by specifying them as arguments:
	```sh
	./update-ts.sh index.html src/main.js
	```
- Update files within specific folders: 
	```sh
	git ls-files -z src/ tests/ | xargs -0 sh ./update-ts.sh
	```
- Update files that match a pattern:
	```sh
	git ls-files -z -- 'src/**/*.css' 'src/**/*.scss' | xargs -0 sh ./update-ts.sh
	```