DOWNLOAD_GITHUB_BASE_PATH = "https://github.com/OpenRA/OpenRA/"

# Disable if you're doing something that may hit the gh rate limit (60 queries per hour for non-authenticated users)
ENABLE_GITHUB_API = true

# Github release IDs: obtain from https://api.github.com/repos/OpenRA/OpenRA/releases
GITHUB_PLAYTEST_ID = ''
GITHUB_RELEASE_ID = '4433699'

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
  "twitter" => { name: "Twitter", url: "http://twitter.com/openRA" },
  "reddit" => { name: "Reddit", url: "http://www.reddit.com/r/openra" },
  "youtube" => { name: "Youtube", url: "https://www.youtube.com/channel/UCRoiPL1J4K1-EhQeNazrYig"},
  "gplus" => { name: "Google+", url: "https://www.google.com/+OpenraNet" },
  "steam" => { name: "Steam", url: "http://steamcommunity.com/groups/openra/" },
  "itchio" => { name: "itch.io", url: "https://openra.itch.io/openra"},
  "gamereplays" => { name: "GameReplays", url: "http://www.gamereplays.org/openra/" },
  "github" => { name: "Github", url: "https://github.com/OpenRA/OpenRA"},
  "moddb" => { name: "ModDB", url: "http://www.moddb.com/games/openra" },
}

def package_name(platform, tag)
    modtag = tag.gsub('-', '.')
    case platform
        when "osx"
            "OpenRA-#{tag}.zip"
        when "win"
            "OpenRA-#{tag}.exe"
        when "deb"
            "openra_#{modtag}_all.deb"
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

def github_auth()
 if ENV.has_key?("GITHUB_OAUTH") then
  client = Octokit::Client.new(:access_token => ENV['GITHUB_OAUTH'])
  user = client.user
  user.login
 end
end

def fetch_package_sizes(gh_release_ids)
 require 'octokit'
 s = Hash.new
 if ENABLE_GITHUB_API then
   github_auth()
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
    github_auth()
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
