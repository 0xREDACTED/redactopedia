---
title: Job Images from Private Repositories
tags:
  - bash
  - ci/cd
  - gitlab
  - yaml
  - git
  - docker
---
When creating a job in GitLab, one might want to configure the job to use a custom image from their own repository. This is particularly useful when working in air-gapped environments or when using images with specific binaries baked in:
```yaml
my-job:
	image: registry.example.com/custom/image:latest
	script:
		# do stuff
```

This will work out of the box for images in publicly readable repositories. However, further configuration needs to be done to get it to work when pointing to a private repository that requires authentication.

Unfortunately, there is no way to pass in the credentials in the ci file (e.g. it would be ideal to grab them from Vault and pass them in) so we must either define a CI/CD variable with the docker auth config or apply it to the runner images.
## Using CI/CD variables - without exposing them in the Job logs
To define the auth credentials via the GitLab CI/CD variables, the following steps must be done - which are [defined in the documentation](https://docs.gitlab.com/ci/docker/using_docker_images/#use-statically-defined-credentials) 
1. Use the credentials to the registry to generate the base64 encoded `username:password` "secret" (use an access token / service account - not your actual login):
```sh
printf "my_username:my_password" | openssl base64 -A
 ```
2. This will give you some base64 encoded string which you will then use to create something that looks like:
```json
{
	"auths": {
		"private-registry.example.com:5000": {
			"auth": "bXlfdXNlcm5hbWU6bXlfcGFzc3dvcmQ="
		}
	}
}
```

> **NOTE:** At this point in the official documentation, you will be instructed to create a `$DOCKER_AUTH_CONFIG` variable containing the value above. However, as of the time of writing, **25/03/2025**, GitLab only allows this to have full visibility due to whitespace - meaning it will be both visible in the job logs and revealable in the settings:  https://gitlab.com/gitlab-org/gitlab/-/issues/13514
> Luckily, there is a workaround shown in the following steps.
3. Create a secret within your CI/CD settings (at the project or group level) with the name `$DOCKER_AUTH_CONFIG_TOKEN` and the variable being the base64 encoded string from the first step. Make sure to set the visibility to `Masked and hidden`
4. Create another variable named `$DOCKER_AUTH_CONFIG` that contains the following which references the previous variable. **DO NOT** have `Expand variable reference` selected
``` json
{
	"auths": {
		"private-registry.example.com:5000": {
		"auth": "$DOCKER_AUTH_CONFIG"
		}
	}
}
```
5. Create a job that uses the registry and run your pipeline - it should pull the image successfully.