#!/bin/bash
wsk action invoke -b feed-aggregator-dev-put -p url $1
