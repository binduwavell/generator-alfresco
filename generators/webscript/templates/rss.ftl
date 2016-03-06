<#escape x as x?xml>
<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0">
    <channel>
        <title>Sample Feed</title>
        <description>
            ${data}
        </description>
        <link>http://www.example.com/rss</link>
        <category domain="www.dmoz.com">
            Computers/Software/Internet/Site Management/Content Management
        </category>
        <copyright>Copyright 2004 Example, Inc.</copyright>
        <docs>http://blogs.law.harvard.edu/tech/rss</docs>
        <language>en-us</language>
        <lastBuildDate>Tue, 19 Oct 2004 13:39:14 -0400</lastBuildDate>
        <managingEditor>editor@example.com</managingEditor>
        <pubDate>Tue, 19 Oct 2004 13:38:55 -0400</pubDate>
        <webMaster>webmaster@example.com</webMaster>
        <generator>Alfresco</generator>
        <image>
            <url>http://www.example.com/images/example.gif</url>
            <title>Example Feed</title>
            <link>http://www.example.com/rss.htm</link>
            <description>Example Feed</description>
            <width>48</width>
            <height>48</height>
        </image>
        <item>
            <title>RSS Example</title>
            <description>
                ${msg("greeting")} - ${data} - ${item!"config not loaded"}
            </description>
            <link>http://www.example.com/interesting.html</link>
            <category domain="www.dmoz.com">
                Computers/Software/Internet/Site Management/Content Management
            </category>
            <comments>http://www.example.com/comments</comments>
            <pubDate>Tue, 19 Oct 2004 11:09:11 -0400</pubDate>
        </item>
    </channel>
</rss>
</#escape>
