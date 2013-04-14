# All files in the 'lib' directory will be loaded
# before nanoc starts compiling.
include Nanoc::Helpers::Blogging
include Nanoc::Helpers::Rendering
include Nanoc::Helpers::LinkTo

module OpenRAHelpers
    RELEASE_TYPES = ["release", "playtest"]

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
                        <! --(#{size}) -->
                    </div>
                </div>
            HTML
        end
        ret
    end

    def url_for_download(platform, release_type)
        #TODO: shell out or otherwise find the latest binary for a given platform
        #construct a url where it is presented 
        case release_type
            when "release"
                ver = "latest"
            when "playtest"
                ver = "latest"
            else
                raise "Why is your release_type #{release_type}?!?!"
        end
        "http://openra.res0l.net/download/#{platform}/#{release_type}/#{ver}"
    end

    def size_of_download(platform, release_type)
        #TODO: shell out or otherwise find the size of the latest binary
        case release_type
            when "release"
                size = "?"
            when "playtest"
                size = "?"
            else
                raise "Why is your release_type #{release_type}?!?!"
            end
        "#{size} MB"
    end
end
include OpenRAHelpers
