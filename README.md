OpenRA Web
==========

Uses the [nanoc](http://nanoc.ws/) static website generator. [![Build Status](https://travis-ci.org/OpenRA/OpenRAWeb.png?branch=master)](https://travis-ci.org/OpenRA/OpenRAWeb)

Deployment
----------
* `nanoc compile` to update the HTML.
* `nanoc view` to preview the changes at [localhost:3000](http://localhost:3000).
* `nanoc deploy --target res0l` to upload to [open-ra.org](http://openra.res0l.net) (requires SSH access and rsync).
* Push to [openra.github.io](https://github.com/OpenRA/openra.github.io.git) to update [openra.net](http://openra.net) (requires git)

Stats
-----
* Visitors: http://open-ra.org/statistics/
* Uptime: http://stats.pingdom.com/syygqlg6525r/788293
