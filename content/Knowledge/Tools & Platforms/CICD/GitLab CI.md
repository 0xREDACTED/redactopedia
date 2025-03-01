---
title: GitLab CI
tags:
  - bash
  - ci/cd
  - gitlab
  - grep
  - yaml
  - git
---
## `grep` and capturing exit status in CI scripts
GitLab sets a bunch of shell options by default. These default options include `errexit` (aka `set -e`) and `pipefail`. The combination of these two means that if the script involves anything that returns a non-zero exit status, the pipeline fails.

For example, consider the following:
```bash
error_count=$(grep -c "Error: " log_file)
```
Usually, if the grep doesn't match anything we would expect `error_count` to be zero with no problems. However, this will result in the pipeline failing since the `grep` results in an exit status of `1`.
Another example involving the capturing of an exit is:
```bash
kubectl get pods | grep "something"
if [ $? -eq 1 ]; then
  echo "Couldn't find something!"
fi
```
One would expect the if statement to be triggered if no pod with `"something"` in their name were present. However, the pipeline will fail before reaching the if statement. 
In order to do this, the exit status needs to be stored on the same line like so:
```bash
return_code=0; kubectl get pods | grep "something" || return_code=$?
if [ $return_code -eq 1 ]; then
  echo "couldn't find something!"
fi
```
We can also of course get output and the exit status simultaneously:
```bash
return_code=0; error_count=$(grep -c "Error: " log_file) || return_code=$?
```

## Converting an input array into a bash array

When writing your GitLab CI, you may want to consume an inputted array and process it in your bash script. Unfortunately, the inputted arrays are actually JSON-like strings. They aren't exactly JSON since the inputted variables may not be surrounded in double quotes and can have spaces without double quotes surrounding them. For example, the following is totally valid:
```yaml
my_array_values:
  - value_1
  - "value 2"
  - value 3
  - "value 4"
```
This will cause `$[[ inputs.my_array_values ]]` to hold the following value:
```bash
'[value_1, "value 2", value 3, "value 4"]'
```
Using `jq` isn't possible since this is invalid JSON. This means we need to resort to some tricky bash wizardry to convert this to a useable bash array. Behold:
```bash
readarray -t MY_ARRAY < <(echo $[[ inputs.my_array_values ]] |
  sed '
    s/[][]//g; # remove brackets
    s/,\s\+/,/g; # remove spaces after commas
    s/,/\n/g; # remove commas
    s/\"//g; # remove double quotes
    s/ /\\ /g; # escape spaces
  ' |
  xargs printf "%s\n"
)
```
## Dynamically defined `parallel:matrix` in GitLab CI

GitLab CI/CD jobs can be run in parallel via parallel matrices. Take for example the following:
```yaml
linux:build:
  stage: build 
  script: echo "Hello from $DEPLOYMENT on $CLOUD!"
  parallel:
    matrix:
      - CLOUD:
          - aws
          - azure
          - gcp
      - DEPLOYMENT:
          - kubernetes
          - service-mesh
```
This will then generate the following jobs that run in parallel:

![[parallel-matrix.png|500]]

The jobs will then set the environment variables respectively. So for the first job the output will be `Hello from kubernetes on aws!` 

Now, what if we wanted to *dynamically* define the elements within `CLOUD` or `DEPLOYMENT`. One might think that you could pass set it to an environment or input variable and have it expand. E.g:
```yaml
linux:build:
  stage: build 
  script: echo "Hello from $DEPLOYMENT on $CLOUD!"
  parallel:
    matrix:
      - CLOUD: $CLOUD
      - DEPLOYMENT: $[[ inputs.deployments ]]
```
Unfortunately, at the time of writing, **14/02/2025**, this feature is yet to be implemented out of the box by GitLab: https://gitlab.com/gitlab-org/gitlab/-/issues/388401
Luckily, with the use of `envubst`, we can get around this! Here is an example of how this might look:
```yaml
# template.yml
prepare:my-job:
  stage: .pre
  script:
    - |
      # Simple example but usually you would dynamically calculate / define these
      # Must be of this exact form
      CLOUDS=["aws","azure","gcp"]
      DEPLOYMENTS=["kubernetes","service-mesh"]

      # Perform substitution
      envubst '$CLOUDS' < template.yml > tmp.yml
      envubst '$DEPLOYMENTS' < tmp.yml > template.gitlab-ci.yml
  artifacts:
    paths:
      - template.gitlab-ci.yml
  rules:
    - if: ($TRIGGERED == null) || ($TRIGGERED == "")

trigger:my-job:
  stage: .pre
  trigger:
    strategy: depend
    include:
      - artifact: template.gitlab-ci.yml
        job: prepare:my-job
        inputs:
          # re-pass any inputs back into the parallel job as needed
    forward:
      pipeline_variables: true
  variables:
    TRIGGERED: true
  needs:
    - job: prepare:my-job
  rules:
    - if: ($TRIGGERED == null) || ($TRIGGERED == "")

my-job:
  stage: build
  script: echo "Hello from $DEPLOYMENT on $CLOUD!"
  parallel:
    matrix:
      - CLOUD: ${CLOUD}
      - DEPLOYMENT: ${DEPLOYMENTS}
  rules:
    - if: $CI_PIPELINE_SOURCE == "parent_pipeline" && $TRIGGERED

```

Essentially, the pipeline makes use of a prepare and trigger job to call itself with the updated variables.
### Converting an inputted array into a parallel matrix array
What if we wanted to set an inputted array as the parallel matrix? Well, we'd simply modify [[GitLab CI#Converting an input array into a bash array|the command above]] like so:
```bash
DEPLOYMENTS=[$(echo $[[ inputs.deployments ]] |
  sed '
    s/[][]//g; # remove brackets
    s/,\s\+/,/g; # remove spaces after commas
    s/,/\n/g; # remove commas
    s/\"//g; # remove double quotes
    s/ /\\ /g; # escape spaces
  ' |
  # add quotes & commas then remove last comma
  xargs printf "\"%s\"," |
  rev | cut -c 2- | rev 
)]
```