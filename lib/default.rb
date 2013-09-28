# All files in the 'lib' directory will be loaded
# before nanoc starts compiling.
include Nanoc::Helpers::Blogging
include Nanoc::Helpers::Rendering
include Nanoc::Helpers::LinkTo
include Nanoc::Helpers::XMLSitemap

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
end
include OpenRAHelpers
