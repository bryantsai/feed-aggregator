#!/bin/bash
wsk action invoke -b feed-aggregator-dev-delete -p url $1
