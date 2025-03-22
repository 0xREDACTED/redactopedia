---
title: Auth Methods
tags:
  - secrets
  - auth
---
Authentication methods in HashiCorp Vault are plugins that verify identities (users/machines/services) and grant them tokens with associated policies. They are enabled using the `auth enable` command:

```bash
vault auth enable [options] <METHOD_TYPE>
```
## The importance of using `-path` 
One of the options when enabling an auth method is the `-path` flag. If unused, vault will default to create a vault path with the name of the auth type. For example, doing `vault auth enable jwt` will create `auth/jwt`. This may be okay for the majority of cases, however, consider the scenario where you have multiple external services that need to integrate with vault via the same auth type. 

For example, GitLab can be integrated via jwt so that GitLab CI can use secrets within Vault. Now, what if there were two GitLab instances (for whatever reason) that needed to use the same Vault? We would do the following:
1. **GitLab Prod**:  
```bash
vault auth enable -path=gitlab-prod-jwt jwt
vault write auth/gitlab-prod-jwt/config \
  oidc_discovery_url="https://gitlab.example.com" \
  bound_issuer="https://gitlab.example.com"
```
2. **GitLab Dev**:  
```bash
vault auth enable -path=gitlab-dev-jwt jwt
vault write auth/gitlab-dev-jwt/config \
  oidc_discovery_url="https://gitlab-dev.example.com" \
  bound_issuer="https://gitlab-dev.example.com"
```

>Note that this is just an example of using different paths for the same auth method. Realistically, you would want to use a different instance of Vault for prod and dev environments, or rather different namespaces if you're using Hashicorp's Enterprise Vault offering 