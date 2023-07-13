#!/bin/bash

rsync -avzP --delete data/ web34@s213.goserver.host:www/franciskahajdu.de/next/assets/fetchedData

