DOWNLOAD_GITHUB_BASE_PATH = "https://github.com/OpenRA/OpenRA/"

# Disable if you're doing something that may hit the gh rate limit (60 queries per hour for non-authenticated users)
ENABLE_GITHUB_API = true

# Github release IDs: obtain from https://api.github.com/repos/OpenRA/OpenRA/releases
GITHUB_PLAYTEST_ID = '587108'
GITHUB_RELEASE_ID = '443608'

PAGES = {
	"/" => "Home",
	"/news/" => "News",
	"/download/" => "Download",
	"/games/" => "Games",
	"/community/" => "Community"
}

PLATFORMS = {
    "win" => {
      name: "Windows",
      desc: "The default GPU drivers included with Windows do not support OpenGL rendering.<br />You may need to install full drivers supplied by your GPU vendor."
    },
    "osx" => {
      name: "OS X",
      desc: "OpenRA requires Mono 3.2 or greater.<br /><a href=\"http://www.go-mono.com/mono-downloads/download.html\">Download Mono</a>."
    }, 
    "deb" => {
      name: "Debian / Ubuntu",
      desc: "The stable version is also available from <a href=\"http://www.playdeb.net/software/OpenRA\">PlayDeb</a>."
    },

    "rpm" => {
      name: "Fedora / openSUSE",
      desc: "The stable version is also available in the <a href=\"http://software.opensuse.org/download.html?project=games&package=openra\">official openSUSE games repository.</a>"
    },

    "arch" => {
      name: "Arch Linux",
      desc: "The stable version is also available in the <a href=\"https://www.archlinux.org/packages/community/any/openra/\">official Arch Linux repositories</a>.<br /><br />Playtest and bleed packages are also <a href=\"https://aur.archlinux.org/packages/?C=6&SeB=n&K=openra\">available</a> in the AUR."
    },

    "gentoo" => {
      name: "Gentoo",
      desc: "Stable versions are packaged in the <a href=\"http://packages.gentoo.org/package/games-strategy/openra\">official Gentoo repositories</a>.<br /><br />To install the ebuild:<br /><pre>$ emerge -av openra</pre><br />You can get unstable playtests using the following overlay:<br /><pre>http://github.com/cerebrum/dr/raw/master/repo.xml</pre><br />"
    },
    "source" => {
      name: "Source Code",
      desc: "Follow the instructions in the <a href=\"https://github.com/OpenRA/OpenRA/blob/bleed/INSTALL.md\">INSTALL.md</a> document to build and run OpenRA.<br /><a title=\"Visual C# Express Download\" href=\"http://www.microsoft.com/express/downloads/\">Visual C# Express</a> (Windows) and <a title=\"MonoDevelop\" href=\"http://www.monodevelop.com/\"/>MonoDevelop</a> (OS X / Linux) are free IDEs that work with OpenRA.<br /><br />If you'd like to <a href=\"https://github.com/OpenRA/OpenRA/pulls\">contribute patches</a> (or just don't want to fiddle with tar files) you can download and/or update the code using the <a href=\"http://git-scm.com/\">git version control system</a>:<br /><pre>$ git clone git://github.com/OpenRA/OpenRA.git</pre><br />"
    },
    "desura" => {
      name: "Desura",
      desc: "Desura is a community driven digital distribution service for gamers, putting the best games, mods and downloadable content from developers at gamers fingertips."
    }
}

SOCIAL = {
  "facebook" => { name: "Facebook", url: "https://www.facebook.com/openra" },
  "gplus" => { name: "Google+", url: "https://www.google.com/+OpenraNet" },
  "twitter" => { name: "Twitter", url: "http://twitter.com/openRA" },
  "moddb" => { name: "ModDB", url: "http://www.moddb.com/games/openra" },
  "reddit" => { name: "Reddit", url: "http://www.reddit.com/r/openra" },
  "github" => { name: "Github", url: "https://github.com/OpenRA/OpenRA"}
}

def package_name(platform, tag)
    modtag = tag.gsub('-', '.')
    case platform
        when "osx"
            "OpenRA-#{tag}.zip"
        when "win"
            "OpenRA-#{tag}.exe"
        when "arch"
            "openra-#{modtag}-1-any.pkg.tar.gz"
        when "deb"
            "openra_#{modtag}_all.deb"
        when "rpm"
            "openra-#{modtag}-1.noarch.rpm"
        when "source"
            "#{tag}.tar.gz"
        else
            raise "Why is your platform #{platform}?!?!"
    end
end

def generate_download_button(platform, github_id, tag, sizes)
  if github_id == "" then
    "<span>No playtest available<br />(release is newer)</span>"
  elsif platform == "source"
    url = DOWNLOAD_GITHUB_BASE_PATH + "archive/#{tag}.tar.gz"
    sprintf('<a href="%s" title=\"Download %s">Download %s<br />(source package)</a>', url, tag, tag)
  else
    package = package_name(platform, tag)
    url = DOWNLOAD_GITHUB_BASE_PATH + "releases/download/" + tag + '/' + package
    size = sizes.key?(package) ? sprintf("(%.2f MB)", sizes[package] / 1048576.0) : "(size unknown)"
    sprintf('<a href="%s" title="Download %s">Download %s<br />%s</a>', url, tag, tag, size)
  end
end

def fetch_package_sizes(gh_release_ids)
 require 'octokit'
 s = Hash.new
 if ENABLE_GITHUB_API then
   gh_release_ids.each do |id|
     if id == "" then next end
     assets = Octokit.release_assets('https://api.github.com/repos/OpenRA/OpenRA/releases/' + id)
     assets.each do |asset|
       s[asset.name] = asset.size
     end
   end
 end
 s
end

def fetch_git_tag(github_id)
  require 'octokit'
  if ENABLE_GITHUB_API and github_id != '' then
    asset = Octokit.release_asset('https://api.github.com/repos/OpenRA/OpenRA/releases/' + github_id)
    asset.tag_name
  else
    "unknown-12345678"
  end
end

def pretty_date(date)
    attribute_to_time(date).strftime("%Y-%m-%d")
end

def navigation_page(page)
	page == @item.path || (page == "/news/" && @item.path.start_with?("/news/"))
end
