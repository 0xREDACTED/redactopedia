---
title: GitLab CI
tags:
  - bash
  - ci/cd
  - gitlab
  - grep
  - yaml
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
      - DEPLOYMENT
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