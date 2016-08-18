import React from 'react'
import { Link } from 'react-router'
import sortBy from 'lodash/sortBy'
import moment from 'moment'
import DocumentTitle from 'react-document-title'
import { prefixLink } from 'gatsby-helpers'
import access from 'safe-access'
import { config } from 'config'
import SitePost from '../components/SitePost'
import SiteSidebar from '../components/SiteSidebar'

class SiteIndex extends React.Component {
  render() {
    const { pages } = this.props.route;

    const articles = pages.filter(page => access(page, 'file.ext') === 'md' && access(page, 'data.layout') === 'post');
    const sortedArticles = sortBy(articles, (article) => access(article, 'data.date')).reverse();

    const formattedArticles = sortedArticles.map((page, i) => {
      const title = access(page, 'data.title') || page.path;
      const body = access(page, 'data.body');
      const datePublished = access(page, 'data.date');
      const category = access(page, 'data.category');
      const categories = access(page, 'data.categories') || [];
      category && categories.push(category);

      if(i > 5) {
        return (
          <div className='blog-post' style={{
            margin: '0',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
          }}>
            <time dateTime={ moment(datePublished).format('MMMM D, YYYY') }>
              { moment(datePublished).format('MMMM YYYY') }
            </time>
            <h2 style={{
              display: 'inline',
              fontSize: '16px',
              marginLeft: '5px',
            }}>
              <Link style={{ borderBottom: 'none' }} to={ prefixLink(page.path) } > { title } </Link>
            </h2>
          </div>
        );
      }

      // Fix paths for images, videos... relative to blog post
      const bodyWithFixedPaths = body.replace(/<[^>]+src="(.+)"[^>]*>/g, (match, g1) => {
        return match.replace(g1, page.path + g1)
      })

      return (
          <div className='blog-post'>
            <time dateTime={ moment(datePublished).format('MMMM D, YYYY') }>
              { moment(datePublished).format('MMMM YYYY') }
            </time>
            <ul style={{display: 'inline-block', margin: '0', padding: '0'}}>{categories.map(category => <li className='blog-category'>{category}</li>)}</ul>
            <h2><Link to={ prefixLink(page.path) } > { title } </Link></h2>
            <div dangerouslySetInnerHTML={{ __html: bodyWithFixedPaths }} />
          </div>
      );
    });

    return (
      <DocumentTitle title={config.siteTitle}>
        <div>
          <SiteSidebar {...this.props}/>
          <div className='content'>
            <div className='main'>
              <div className='main-inner'>
                {formattedArticles}
              </div>
            </div>
          </div>
        </div>
      </DocumentTitle>
    )
  }
}

SiteIndex.propTypes = {
  route: React.PropTypes.object,
}

export default SiteIndex
