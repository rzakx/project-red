#!/bin/bash
nowe=`date +%Y-%m-%d-%H-%M`
mv "last.log" "${nowe}.log"
screen -mSL "rdrProjectRed" -Logfile last.log ../server/run.sh +exec server.cfg +set gamename rdr3