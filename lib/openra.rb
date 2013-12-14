DOWNLOAD_BASE_PATH = "http://openra.res0l.net/assets/downloads/"

PLAYTEST_TAG = "playtest-20131211"
RELEASE_TAG = "release-20130915"

PLATFORMS = ["win", "osx", "deb", "rpm", "arch", "source", "desura"]
PLATFORM_NAME = {
    "win" => "Windows",
    "osx" => "OS X",
    "deb" => "Debian / Ubuntu",
    "rpm" => "Fedora / OpenSUSE",
    "arch" => "Arch Linux",
    "source" => "Source Code",
    "desura" => "Desura"
}

PLATFORM_BLURB = {
    "win" => "The default GPU drivers included with Windows do not support OpenGL rendering.<br />You may need to install full drivers supplied by your GPU vendor.",
    "osx" => "OpenRA requires Mono 2.10 or greater (3.2 or greater recommended).<br /><a href=\"http://www.go-mono.com/mono-downloads/download.html\">Download Mono</a>.",
    "deb" => "Just install the package, and you're good to go!",
    "rpm" => "Just install the package, and you're good to go!",
    "arch" => "Just install the package, and you're good to go!",
    "source" => "Follow the instructions in the INSTALL document to build and run OpenRA.<br />
    <a title=\"Visual C# Express Download\" href=\"http://www.microsoft.com/express/downloads/\">Visual C# Express</a> (Windows) and <a title=\"MonoDevelop\" href=\"http://www.monodevelop.com/\"/>MonoDevelop</a> (OS X / Linux) are free IDEs that work with OpenRA.<br /><br />
    If you'd like to <a href=\"/get-involved/\">contribute patches</a> (or just don't want to fiddle with tar files) you can download and/or update the code using the <a href=\"http://git-scm.com/\">git version control system</a>:<br />
    <pre>$ git clone git://github.com/OpenRA/OpenRA.git</pre><br />",
    "desura" => "Desura is a community driven digital distribution service for gamers, putting the best games, mods and downloadable content from developers at gamers fingertips.",
}

def package_name(platform, tag)
    modtag = tag.gsub('-', '.')
    case platform
        when "osx"
            "mac/OpenRA-#{tag}.zip"
        when "win"
            "windows/OpenRA-#{tag}.exe"
        when "arch"
            "linux/arch/openra-#{modtag}-1-any.pkg.tar.xz"
        when "deb"
            "linux/deb/openra_#{modtag}_all.deb"
        when "rpm"
            "linux/rpm/openra-#{modtag}-1.noarch.rpm"
        when "source"
            "source/#{tag}.tar.gz"
        else
            raise "Why is your platform #{platform}?!?!"
    end
end

def package_url(platform, tag)
    DOWNLOAD_BASE_PATH + package_name(platform, tag)
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
