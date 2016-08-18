import React from 'react'
import moment from 'moment'
import { RouteHandler, Link } from 'react-router'
import DocumentTitle from 'react-document-title'
import { prefixLink } from 'gatsby-helpers'
import access from 'safe-access'
import { config } from 'config'
import ReadNext from '../ReadNext'
import AuthorCard from '../AuthorCard'
import './style.css'
import '../../static/css/highlight.css'
import profilePic from '../../pages/yorunohikage.png'

class SitePost extends React.Component {
  render() {
    const {route} = this.props
    const post = route.page.data
    const home = (
      <div>
        <Link className='gohome' to={ prefixLink('/') }> All Articles</Link>
      </div>
    )

    const dateStyle = {
      textAlign: 'center',
      display: 'block',
      color: 'grey',
      marginBottom: '50px',
    }

    return (
      <div>
        { home }
        <div className='blog-single'>
          <div className='text'>
            <h1>{ post.title }</h1>
            <em style={dateStyle}><time dateTime={post.date}>{ moment(post.date).format('D MMMM YYYY') }</time></em>
            <div dangerouslySetInnerHTML={{ __html: post.body }} />
          </div>
          <div className='footer'>
            <ReadNext post={post} {...this.props}/>
            <hr></hr>
            <AuthorCard name={config.siteAuthor} username={config.siteAuthorUsername} avatar={profilePic} twitterLink={config.social.twitter}>
              {config.siteAuthorDescription}
            </AuthorCard>
          </div>
        </div>
      </div>
    )
  }
}

SitePost.propTypes = {
  pages: React.PropTypes.array,
}

export default SitePost
