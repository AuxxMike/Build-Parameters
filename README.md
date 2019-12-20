# Build-Variables-Action
Action step to source and or create variables needed in the build process. 

## Inputs

### `project-name`
**Required** 'Name of the project'

### 'current-version'



## Outputs

### `version`

The new version based on triggering text in the commit message.
MojorVersion  -  bumps version to next major
feat  -   at the begining of commit message bumps a minor version

## Example usage

uses: actions/build-variables-action@v1
with:
  project-name: 'Toolkit'
  current-version: '1.0.0'