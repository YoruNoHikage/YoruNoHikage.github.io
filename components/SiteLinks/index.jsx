import React from 'react'
import { RouteHandler, Link } from 'react-router'
import { prefixLink } from 'gatsby-helpers'
import { config } from 'config'
import './style.css'
import '../../static/fonts/fontawesome/style.css'

class SiteLinks extends React.Component {
  render() {
    return (
      <div className='blog-social'>
        <ul>
          <li><a href={ config.social.twitter }><span className='fa fa-twitter'></span></a></li>
          <li><a href={ config.social.github }><span className='fa fa-github'></span></a></li>
          <li><a href={ config.social.linkedin }><span className='fa fa-linkedin'></span></a></li>
          <li><a href={ config.social.email }><span className='fa fa-envelope-o'></span></a></li>
          <li><a href={ config.social.youtube }><span className='fa fa-youtube-play'></span></a></li>
          <li><a href={ config.social.lastfm }><span className='fa fa-lastfm'></span></a></li>
          <li><a href={ config.social.steam }><span className='fa fa-steam'></span></a></li>
        </ul>
      </div>
    )
  }
}

export default SiteLinks
