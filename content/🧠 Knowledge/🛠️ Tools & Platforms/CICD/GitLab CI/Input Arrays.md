---
title: Input Arrays
tags:
  - bash
  - ci/cd
  - gitlab
  - yaml
  - git
---
## Input array -> bash array
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
```shell
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
