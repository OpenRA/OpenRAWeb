# All files in the 'lib' directory will be loaded
# before nanoc starts compiling.
include Nanoc::Helpers::Blogging
include Nanoc::Helpers::Rendering
include Nanoc::Helpers::LinkTo

module OpenRAHelpers
    RELEASE_TYPES = ["release", "playtest"]
    PACKAGE_DIR = '/path/to/packages/dir/'

    def pretty_date(date)
        attribute_to_time(date).strftime("%Y-%m-%d")
    end

    def post_snippet(post)
        # For 'real' snippets, html tags should be stripped before text processing. 
        # But really, it's a static site - we don't need snippets :)
        post.compiled_content

        # This will strip ALL tags, we want to whitelist *some*
        # Yes, this is a heavyweight dependency, but it's only used at compile time
        #require 'nokogiri'
        #doc = Nokogiri::HTML(post.compiled_content)
        #doc.xpath("//text()").to_s
    end

    def download_helper(platform)
        ret = ""
        RELEASE_TYPES.each do |release_type|
            url = url_for_download(platform, release_type)
            size = size_of_download(platform, release_type)
            ret += <<-HTML
                <div id="DownloadLatest" style="clear: both;">
                    <a href="#{url}"><img src="/images/platforms/#{platform}.png" alt="#{platform}.png" /></a>
                    <div style="padding-top: 15px;">
                        <a href="#{url}" title="Download #{release_type.capitalize} Version">Download #{release_type.capitalize} Version</a><br />
                        (#{size})
                    </div>
                </div>
            HTML
        end
        ret
    end

    def package_list(platform, release_type)
      case platform
          when "osx"
              pattern = "OpenRA-*.zip"
          when "win"
              pattern = "OpenRA-*.exe"
          when "linux/arch"
              pattern = "openra-*-1-any.pkg.tar.xz"
          when "linux/deb"
              pattern = "openra_*_all.deb"
          when "linux/rpm"
              pattern = "openra-*-1.noarch.rpm"
          else
              raise "Why is your platform #{platform}?!?!"
      end
      Dir.glob("#{PACKAGE_DIR}/#{platform}/#{release_type}/#{pattern}")
    end

    def url_for_download(platform, release_type)
        package = File.basename(package_list(platform, release_type).last || "")
        "#{release_type}/#{package}"
    end

    def size_of_download(platform, release_type)
        package = package_list(platform, release_type).last
        size = if package then (File.stat(package).size / 1048576.0).to_s[0..3] else '???' end
        "#{size} MB"
    end

    def name_of_download(platform, release_type)
        File.basename(package_list(platform, release_type).last || "")
    end
end
include OpenRAHelpers
