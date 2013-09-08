#!/bin/bash
echo -n $1
curl -Is $1 | grep HTTP
