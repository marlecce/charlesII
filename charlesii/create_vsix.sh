#!/bin/bash

extensionName="charlesii"

vsixPath="./$extensionName.vsix"

rm -fr node_modules dist

npm install || { echo "Error during dependency installation"; exit 1; }

(cd node_modules/@charlesII/engine/ && npm install) || { echo "Error installing engine dependencies"; exit 1; }

cp ../engine/.env.production node_modules/@charlesII/engine/ || { echo "Error copying the engine configuration file"; exit 1; }

npx vsce package -o $vsixPath || { echo "Error creating the .vsix package"; exit 1; }

echo "Package created: $vsixPath"
