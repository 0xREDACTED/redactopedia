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

Unfortunately, there is no way to pass in the credentials in the ci file (e.g. it would be ideal to grab them from Vault and pass them in as some variable) so we must either define a CI/CD       let indentMultiplier = Math.pow(1.7, i - 1).toFixed(2);
      cssRules += `
          .markdown-source-view.mod-cm6 .HyperMD-list-line-${i} + .cm-preview-code-block {
              transform: translateX(calc(${indentMultiplier} * var(--list-indent-edit-mode)));
              width: calc(100% - ${indentMultiplier} * var(--list-indent-edit-mode));
              box-sizing: border-box;
          }
      `;variable with the docker auth config or apply it to the runner images.

There are instructions to do this [defined in the documentation](https://docs.gitlab.com/ci/docker/using_docker_images/#use-statically-defined-credentials) , however the variable method is actually insecure since it tells you to put it as a visible variable. This is due to GitLab not allowing masked variables when the values contain whitespace - at least on the time of writing, **25/03/2025**:  https://gitlab.com/gitlab-org/gitlab/-/issues/13514. Luckily, there is way to get around this.
## Using CI/CD variables - without exposing them in the Job logs
To define the auth credentials via the GitLab CI/CD variables, the following steps must be done - which are 
1. Use the credentials to the registry to generate the base64 encoded `username:token` "secret" (use an access token / service account - not your actual login):
	```sh
	printf "my_username:my_access_token" | openssl base64 -A
	```
2. Create a secret within your CI/CD settings (at the project or group level) with the name `$DOCKER_AUTH_CONFIG_TOKEN` and the base64 encoded string as the variable. Make sure to set the following settings
   
   ![[masked-and-hidden-variable.png|250]]
3. Create another variable named `$DOCKER_AUTH_CONFIG` containing the value below. First set the following settings to allow for variable expansion:
   
   ![[visible-and-expanded-variable-reference-variable.png|250]]
   
   Then set the following value:
	```json
	{
		"auths": {
			"private-registry.example.com:5000": {
			"auth": "$DOCKER_AUTH_CONFIG_TOKEN"
			}
		}
	}
	```
4. Create a job that uses the registry and run your pipeline - it should pull the image successfully.