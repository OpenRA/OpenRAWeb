DOWNLOAD_BASE_PATH = "http://openra.res0l.net/assets/downloads/"
DOWNLOAD_GITHUB_RELEASE_PATH = "https://github.com/OpenRA/OpenRA/releases/download/"
DOWNLOAD_GITHUB_SOURCE_PATH = "https://github.com/OpenRA/OpenRA/archive/"
DOWNLOAD_OPENSUSE_PATH = "http://download.opensuse.org/repositories/games:/openra/"

PLAYTEST_TAG = "playtest-20140602"
RELEASE_TAG = "release-20131223"

# TODO: Remove this gross duplication
PLATFORMS = ["win", "osx", "debian", "ubuntu", "suse", "redhat", "arch", "gentoo", "source", "desura"]
PLATFORM_NAME = {
    "win" => "Windows",
    "osx" => "OS X",
    "debian" => "Debian",
    "ubuntu" => "Ubuntu",
    "redhat" => "Fedora",
    "suse" => "openSUSE",
    "arch" => "Arch Linux",
    "gentoo" => "Gentoo",
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
    "debian" => "Just install the package, and you're good to go!",
    "gentoo" => "Stable versions are packaged in the <a href=\"http://packages.gentoo.org/package/games-strategy/openra\">official Gentoo repositories</a>.<br /><br />
    To install the ebuild:<br />
    <pre>$ emerge -av openra</pre><br />
    You can get unstable playtests using the following overlay:<br />
    <pre>http://github.com/cerebrum/dr/raw/master/repo.xml</pre><br />",
    "ubuntu" => "The stable version is also available from <a href=\"http://www.playdeb.net/software/OpenRA\">PlayDeb</a>.<br /><br />If you are using a version of Ubuntu < 14.04 you need the <a href=\"#debian\">Debian package</a> instead!",
    "suse" => "The stable version is also available in the <a href=\"http://software.opensuse.org/download.html?project=games&package=openra\">official openSUSE games repository.</a>",
    "redhat" => "Just install the package, and you're good to go!",
    "arch" => "The stable version is also available in the <a href=\"https://www.archlinux.org/packages/community/any/openra/\">official Arch Linux repositories</a>.",
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
        when "ubuntu"
            "openra_#{modtag}_all.deb"
        when "debian"
            "openra_#{modtag}_all.deb"
        when "suse"
            "openra-#{modtag}-1.noarch.rpm"
        when "redhat"
            "openra-#{modtag}-1.noarch.rpm"
        when "source"
            "#{tag}.tar.gz"
        else
            raise "Why is your platform #{platform}?!?!"
    end
end

def package_url(platform, tag)
    case platform
        when "arch"
            obs_package_url(platform, tag)
        when "redhat"
            obs_package_url(platform, tag)
        when "suse"
            obs_package_url(platform, tag)
        when "ubuntu"
            obs_package_url(platform, tag)
        when "source"
            DOWNLOAD_GITHUB_SOURCE_PATH + package_name(platform, tag)
        else
            DOWNLOAD_BASE_PATH + package_path(platform) + package_name(platform, tag)
    end
end

def mirrored_package_url(platform, tag)
    case platform
        when "source"
            DOWNLOAD_GITHUB_SOURCE_PATH + package_name(platform, tag)
        when "arch"
            obs_package_url(platform, tag)
        else
            DOWNLOAD_GITHUB_RELEASE_PATH + tag + '/' + package_name(platform, tag)
    end
end

def obs_package_url(platform, tag)
    version = tag.gsub(/[^0-9]/, '')
    case platform
        when "arch"
            DOWNLOAD_OPENSUSE_PATH + "Arch_Extra/i686/openra-#{version}-1-any.pkg.tar.xz"
        when "redhat"
            DOWNLOAD_OPENSUSE_PATH + "Fedora_19/noarch/openra-#{version}-1.1.noarch.rpm"
        when "suse"
            DOWNLOAD_OPENSUSE_PATH + "openSUSE_13.1/noarch/openra-#{version}-1.1.noarch.rpm"
        when "ubuntu"
            DOWNLOAD_OPENSUSE_PATH + "xUbuntu_14.04/all/openra_#{version}-0_all.deb"
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
        when "debian"
            "linux/deb/"
        when "ubuntu"
            "linux/deb/"
        when "suse"
            "linux/rpm/"
        when "redhat"
            "linux/rpm/"
        when "source"
            "source/"
        else
            raise "Why is your platform #{platform}?!?!"
    end
end

def package_size(platform, tag)
    require 'net/http'
    size = ""
    begin
        uri = URI.parse(package_url(platform, tag))
        http = Net::HTTP.start(uri.host, uri.port)
        http.request_head(uri.path) {|response|
            size = sprintf("%.2f MB", Integer(response['content-length']) / 1048576.0)
        }
    rescue
        size = "??? MB"
    end
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
