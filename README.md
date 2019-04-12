# OpenRA Web
Uses the [Nanoc](http://nanoc.ws/) static website generator. [![Build Status](https://travis-ci.org/OpenRA/OpenRAWeb.png?branch=master)](https://travis-ci.org/OpenRA/OpenRAWeb)

## Installation

### Installing Ruby
Nanoc requires Ruby to run. Nanoc supports the official Ruby interpreter from version 2.3 up.

Ruby may already be installed on your system. To check, open a terminal window and type `ruby -v`. To install Ruby, follow the installation instructions on the [Ruby website](https://www.ruby-lang.org/en/documentation/installation/).

### Installing Bundler
You need to run Nanoc with Bundler. To avoid permission errors<sup>[1](https://stackoverflow.com/a/38259128)</sup> it is recommended to use the `--user install` option when installing gems. 

To install bundler, type `gem install bundler --user install` in a terminal to install Bundler to a directory inside your home directory. To use Bundler or any other gem installed to your `~/.gem` directory, you need to add ~/.gem/ruby/version/bin to your PATH environment variable. If you use bash, add the following lines to your `~/.bashrc`<sup>[2](https://guides.rubygems.org/faqs/#user-install)</sup>:

```bash
# Ruby user installed gems
if which ruby >/dev/null && which gem >/dev/null; then
    PATH="$(ruby -r rubygems -e 'puts Gem.user_dir')/bin:$PATH"
fi
```

### Installing nanoc
Open the repository directory and type `bundle install --path vendor/bundle` to install the local dependencies.

## Development
Use `bundle exec nanoc compile` and `bundle exec nanoc view` to generate and host a static preview at [localhost:3000](http://localhost:3000). Changes will be automatically deployed to [openra.github.io](https://github.com/OpenRA/openra.github.io.git) when a pull request is merged.

## Stats
* Analytics: http://www.seethestats.com/site/openra.net/STS5AYU4FS9
* Uptime: http://stats.pingdom.com/syygqlg6525r/788293
