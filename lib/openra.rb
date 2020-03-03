DOWNLOAD_GITHUB_BASE_PATH = "https://github.com/OpenRA/OpenRA/"

# Disable if you're doing something that may hit the gh rate limit (60 queries per hour for non-authenticated users)
ENABLE_GITHUB_API = true

# Github release IDs: obtain from https://api.github.com/repos/OpenRA/OpenRA/releases
GITHUB_PLAYTEST_ID = '24187720'
GITHUB_RELEASE_ID = '23311336'

PAGES = {
	"/" => "Home",
	"/news/" => "News",
	"/about/" => "About",
	"/download/" => "Download",
	"/games/" => "Games",
	"/community/" => "Community"
}

SOCIAL = {
  "facebook" => { name: "Facebook", url: "https://www.facebook.com/openra" },
  "discord" => { name: "Discord", url: "https://discord.openra.net" },
  "twitter" => { name: "Twitter", url: "https://twitter.com/openRA" },
  "reddit" => { name: "Reddit", url: "https://www.reddit.com/r/openra" },
  "youtube" => { name: "Youtube", url: "https://www.youtube.com/channel/UCRoiPL1J4K1-EhQeNazrYig"},
  "steam" => { name: "Steam", url: "https://steamcommunity.com/groups/openra/" },
  "itchio" => { name: "itch.io", url: "https://openra.itch.io/openra"},
  "gamereplays" => { name: "GameReplays", url: "https://www.gamereplays.org/openra/" },
  "github" => { name: "Github", url: "https://github.com/OpenRA/OpenRA"},
  "moddb" => { name: "ModDB", url: "http://www.moddb.com/games/openra" },
}

def package_name(platform, tag)
    case platform
        when "osx"
            "OpenRA-#{tag}.dmg"
        when "win"
            if tag == "release-20190314" then
                "OpenRA-#{tag}.exe"
            else
                "OpenRA-#{tag}-x64.exe"
            end
        when "source"
            "OpenRA-#{tag}-source.tar.bz2"
        else
            raise "Why is your platform #{platform}?!?!"
    end
end

def generate_download_button(platform, github_id, tag, sizes)
  if github_id == "" then
    "<span>No playtest available<br />(release is newer)</span>"
  else
    package = package_name(platform, tag)
    url = DOWNLOAD_GITHUB_BASE_PATH + "releases/download/" + tag + '/' + package
    size = sizes.key?(package) ? sprintf("(%.2f MB)", sizes[package] / 1048576.0) : "(size unknown)"
    sprintf('<a href="%s" title="Download %s">Download %s<br />%s</a>', url, tag, tag, size)
  end
end

def appimage_mod_title(mod)
    case mod
        when "ra"
            "Red Alert"
        when "cnc"
            "Tiberian Dawn"
        when "d2k"
            "Dune 2000"
        else
            raise "Why is your platform #{mod}?!?!"
    end
end

def appimage_mod_filename(mod, tag)
    channel = ''
    if tag.start_with?("playtest-")
        channel = "-playtest"
    end

    case mod
        when "ra"
            "OpenRA-Red-Alert" + channel + "-x86_64.AppImage"
        when "cnc"
            "OpenRA-Tiberian-Dawn" + channel + "-x86_64.AppImage"
        when "d2k"
            "OpenRA-Dune-2000" + channel + "-x86_64.AppImage"
        else
            raise "Why is your platform #{mod}?!?!"
    end
end

def generate_appimage_button(mod, github_id, tag, sizes)
  if github_id == "" then
    sprintf('<span class="%s">No playtest available<br />(release is newer)</span>', mod)
  else
    title = appimage_mod_title(mod)
    if tag.start_with?("playtest-")
        title += " (Playtest)"
    end

    filename = appimage_mod_filename(mod, tag)
    url = DOWNLOAD_GITHUB_BASE_PATH + "releases/download/" + tag + '/' + filename
    size = sizes.key?(filename) ? sprintf("(%.2f MB)", sizes[filename] / 1048576.0) : "(size unknown)"
    sprintf('<a class="%s" href="%s" title="Download %s">Download %s<br />%s</a>', mod, url, title, title, size)
  end
end

def fetch_package_sizes(gh_release_ids)
 require 'octokit'
 s = Hash.new
 if ENABLE_GITHUB_API then
   if ENV.has_key?("GITHUB_OAUTH") then
    Octokit.access_token = ENV['GITHUB_OAUTH']
   end
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
    if ENV.has_key?("GITHUB_OAUTH") then
     Octokit.access_token = ENV['GITHUB_OAUTH']
    end
    asset = Octokit.release_asset('https://api.github.com/repos/OpenRA/OpenRA/releases/' + github_id)
    asset.tag_name
  else
    "unknown-1234"
  end
end

def fetch_git_tags()
  require 'octokit'
  if ENABLE_GITHUB_API then
    if ENV.has_key?("GITHUB_OAUTH") then
     Octokit.access_token = ENV['GITHUB_OAUTH']
    end
    Octokit.releases('OpenRA/OpenRA').map {|release| release.tag_name}
  else
    []
  end
end

def pretty_date(date)
    attribute_to_time(date).strftime("%Y-%m-%d")
end

def navigation_page(page)
	page == @item.path || (page == "/news/" && @item.path.start_with?("/news/"))
end
