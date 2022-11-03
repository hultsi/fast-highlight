#!/bin/bash
echo \#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#
echo \#\#  Building fast-highlight-0.0.31.tgz \#\#
echo \#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#
echo 
npm pack
cd tests
npm install ../fast-highlight-0.0.31.tgz

echo 
echo \#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#
echo \#\#  Testing the build...  \#\#
echo \#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#
npm run fhl
npm run webpack

echo 
echo \#\#\#\#\#\#\#\#\#\#\#\#\#\#
echo \#\#  Finished  \#\#
echo \#\#\#\#\#\#\#\#\#\#\#\#\#\#
echo 