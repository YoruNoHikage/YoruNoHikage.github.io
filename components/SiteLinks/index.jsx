import React from 'react';

export default function SiteLinks() {
  const config = {
    social: {
      twitter: 'http://twitter.com/YoruNoHikage',
      github: 'http://github.com/YoruNoHikage',
      linkedin: 'https://www.linkedin.com/in/alexislaunay',
      youtube: 'http://youtube.com/YoruNoHikage',
      lastfm: 'http://last.fm/user/YoruNoHikage',
      steam: 'http://steamcommunity.com/id/yorunohikage/',
      email: 'yorunohikage@gmail.com',
    },
  };

  return (
    <div className="blog-links">
      <ul>
        {config.social.twitter && (
          <li>
            <a href={config.social.twitter}>
              <span className="fa fa-twitter" />
            </a>
          </li>
        )}
        {config.social.github && (
          <li>
            <a href={config.social.github}>
              <span className="fa fa-github" />
            </a>
          </li>
        )}
        {config.social.linkedin && (
          <li>
            <a href={config.social.linkedin}>
              <span className="fa fa-linkedin" />
            </a>
          </li>
        )}
        {config.social.email && (
          <li>
            <a href={`mailto:${config.social.email}`}>
              <span className="fa fa-envelope-o" />
            </a>
          </li>
        )}
        {config.social.youtube && (
          <li>
            <a href={config.social.youtube}>
              <span className="fa fa-youtube-play" />
            </a>
          </li>
        )}
        {config.social.lastfm && (
          <li>
            <a href={config.social.lastfm}>
              <span className="fa fa-lastfm" />
            </a>
          </li>
        )}
        {config.social.steam && (
          <li>
            <a href={config.social.steam}>
              <span className="fa fa-steam" />
            </a>
          </li>
        )}
      </ul>
    </div>
  );
}
