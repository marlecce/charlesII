#!/bin/bash

extensionName="charlesii"

vsixPath="./$extensionName.vsix"

rm -fr node_modules dist

npm install || { echo "Error during dependency installation"; exit 1; }

npx vsce package -o $vsixPath || { echo "Error creating the .vsix package"; exit 1; }

echo "Package created: $vsixPath"
