DOWNLOAD_BASE_PATH = "http://openra.res0l.net/assets/downloads/"
DOWNLOAD_GITHUB_RELEASE_PATH = "https://github.com/OpenRA/OpenRA/releases/download/"
DOWNLOAD_GITHUB_SOURCE_PATH = "https://github.com/OpenRA/OpenRA/archive/"

PLAYTEST_TAG = "playtest-20140525"
RELEASE_TAG = "release-20131223"

# TODO: Remove this gross duplication
PLATFORMS = ["win", "osx", "deb", "rpm", "arch", "source", "desura"]
PLATFORM_NAME = {
    "win" => "Windows",
    "osx" => "OS X",
    "deb" => "Debian / Ubuntu",
    "rpm" => "Fedora / openSUSE",
    "arch" => "Arch Linux",
    "source" => "Source Code",
    "desura" => "Desura"
}

# TODO: Remove this gross duplication
SOCIAL = ["facebook", "gplus", "twitter", "moddb", "reddit", "github"]
SOCIAL_NAME = {
  "facebook" => "Facebook",
  "gplus" => "Google+",
  "twitter" => "Twitter",
  "moddb" => "ModDB",
  "reddit" => "Reddit",
  "github" => "Github"
}

SOCIAL_URL = {
  "facebook" => "https://www.facebook.com/openra",
  "gplus" => "https://plus.google.com/100332364931123881367",
  "twitter" => "http://twitter.com/openRA",
  "moddb" => "http://www.moddb.com/games/openra",
  "reddit" => "http://www.reddit.com/r/openra",
  "github" => "https://github.com/OpenRA/OpenRA"
}

PLATFORM_BLURB = {
    "win" => "The default GPU drivers included with Windows do not support OpenGL rendering.<br />You may need to install full drivers supplied by your GPU vendor.",
    "osx" => "OpenRA requires Mono 2.10 or greater (3.2 or greater recommended).<br /><a href=\"http://www.go-mono.com/mono-downloads/download.html\">Download Mono</a>.",
    "deb" => "Just install the package, and you're good to go!",
    "rpm" => "Just install the package, and you're good to go!",
    "arch" => "Just install the package, and you're good to go!",
    "source" => "Follow the instructions in the INSTALL document to build and run OpenRA.<br />
    <a title=\"Visual C# Express Download\" href=\"http://www.microsoft.com/express/downloads/\">Visual C# Express</a> (Windows) and <a title=\"MonoDevelop\" href=\"http://www.monodevelop.com/\"/>MonoDevelop</a> (OS X / Linux) are free IDEs that work with OpenRA.<br /><br />
    If you'd like to <a href=\"https://github.com/OpenRA/OpenRA/pulls\">contribute patches</a> (or just don't want to fiddle with tar files) you can download and/or update the code using the <a href=\"http://git-scm.com/\">git version control system</a>:<br />
    <pre>$ git clone git://github.com/OpenRA/OpenRA.git</pre><br />",
    "desura" => "Desura is a community driven digital distribution service for gamers, putting the best games, mods and downloadable content from developers at gamers fingertips.",
}

def package_name(platform, tag)
    modtag = tag.gsub('-', '.')
    case platform
        when "osx"
            "OpenRA-#{tag}.zip"
        when "win"
            "OpenRA-#{tag}.exe"
        when "arch"
            "openra-#{modtag}-1-any.pkg.tar.xz"
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

def package_url(platform, tag)
    DOWNLOAD_BASE_PATH + package_path(platform) + package_name(platform, tag)
end

def mirrored_package_url(platform, tag)
    case platform 
        when "source"
            DOWNLOAD_GITHUB_SOURCE_PATH + package_name(platform, tag)
        else
            DOWNLOAD_GITHUB_RELEASE_PATH + tag + '/' + package_name(platform, tag)
    end
end

def package_path(platform)
    case platform
        when "osx"
            "mac/"
        when "win"
            "windows/"
        when "arch"
            "linux/arch/"
        when "deb"
            "linux/deb/"
        when "rpm"
            "linux/rpm/"
        when "source"
            "source/"
        else
            raise "Why is your platform #{platform}?!?!"
    end
end

def package_size(platform, tag)
    require 'net/http'
    size = "??? MB"
    uri = URI.parse(package_url(platform, tag))
    http = Net::HTTP.start(uri.host, uri.port)
    http.request_head(uri.path) {|response|
        size = sprintf("%.2f MB", Integer(response['content-length']) / 1048576.0)
    }
    size
end

def pretty_date(date)
    attribute_to_time(date).strftime("%Y-%m-%d")
end

PAGES = ["/", "/news/", "/download/", "/games/", "/community/"]
PAGE_TITLES = {
	"/" => "Home",
	"/news/" => "News",
	"/download/" => "Download",
	"/games/" => "Games",
	"/community/" => "Community"
}

def navigation_page(page)
	page == @item.path || (page == "/news/" && @item.path.start_with?("/news/"))
end
