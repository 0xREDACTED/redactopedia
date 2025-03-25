---
title: Dynamic Parallel Jobs
tags:
  - bash
  - ci/cd
  - gitlab
  - yaml
  - git
---
## The expectation of `parallel:matrix`
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
## The workaround
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
What if we wanted to set an inputted array as the parallel matrix? Well, we'd simply modify [[Input Arrays#Input array -> bash array|this solution]] like so:
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