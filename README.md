OpenRA Web
==========

Uses the http://nanoc.ws/ static website generator. [![Build Status](https://travis-ci.org/OpenRA/OpenRAWeb.png?branch=master)](https://travis-ci.org/OpenRA/OpenRAWeb)

Deployment
----------
* `nanoc compile` to update the HTML.
* `nanoc view` to preview the changes at [http://localhost:3000](http://localhost:3000).
* `nanoc deploy --target res0l` to upload to [http://openra.res0l.net](http://openra.res0l.net) (requires SSH access and rsync).
