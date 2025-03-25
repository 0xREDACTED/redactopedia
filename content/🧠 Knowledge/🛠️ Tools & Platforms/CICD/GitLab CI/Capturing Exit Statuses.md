---
title: Capturing Exit Statuses
tags:
  - bash
  - ci/cd
  - gitlab
  - grep
  - yaml
  - git
---
GitLab sets a bunch of shell options by default. These default options include `errexit` (aka `set -e`) and `pipefail`. The combination of these two means that if the script involves anything that returns a non-zero exit status, the pipeline fails.
## Capturing `grep` exit statuses
Consider the following:
```bash frame="none"
error_count=$(grep -c "Error: " log_file)
```

Usually, if the grep doesn't match anything we would expect `error_count` to be zero with no problems. However, this will result in the pipeline failing since the `grep` results in an exit status of `1`.
Another example involving the capturing of an exit is:
```bash frame="none"
kubectl get pods | grep "something"
if [ $? -eq 1 ]; then
  echo "Couldn't find something!"
fi
```
One would expect the if statement to be triggered if no pod with `"something"` in their name were present. However, the pipeline will fail before reaching the if statement. 
In order to do this, the exit status needs to be stored on the same line like so:
```bash frame="none"
return_code=0; kubectl get pods | grep "something" || return_code=$?
if [ $return_code -eq 1 ]; then
  echo "couldn't find something!"
fi
```
We can also of course get output and the exit status simultaneously:
```bash
return_code=0; error_count=$(grep -c "Error: " log_file) || return_code=$?
```
