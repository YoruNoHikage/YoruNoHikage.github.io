import React from 'react'
import { RouteHandler, Link } from 'react-router'
import { prefixLink } from 'gatsby-helpers'
import { config } from 'config'
import SiteNav from '../SiteNav'
import SiteLinks from '../SiteLinks'
import SiteCategoriesLinks from '../SiteCategoriesLinks'
import './style.css'
import profilePic from '../../pages/yorunohikage.png'

class SiteSidebar extends React.Component {
    render() {
        const {location, children} = this.props
        const isHome = location.pathname === prefixLink('/')

        const allCategories = new Set()
        this.props.route.pages.forEach(({ data: {category, categories = []} }) => {
          category && categories.push(category)

          categories.forEach(cat => allCategories.add(cat))
        })

        const title = (
          <Link style={ {    textDecoration: 'none',    borderBottom: 'none',    color: 'inherit'} } to={ prefixLink('/') }>
            { config.siteAuthor }
            <span style={{ color: 'grey', fontSize: '14px', fontWeight: '100' }}> - @{ config.siteAuthorUsername }</span>
          </Link>
        )

        let header = (
        <header>
          <Link style={ {    textDecoration: 'none',    borderBottom: 'none',    outline: 'none'} } to={ prefixLink('/') }>
          <img src={prefixLink(profilePic)} width='75' height='75' />
          </Link>
          { isHome ? <h1>{title}</h1> : <h2>{title}</h2> }
          <p>
            { config.siteDescr }
          </p>
          <SiteLinks {...this.props}/>
        </header>
        )

        return (
            <div className='sidebar'>
              <div className='sidebar-inner'>
                <div className='blog-details'>
                  { header }
                </div>
                <div className='blog-options'>
                  <SiteNav {...this.props}/>
                  {/*<SiteCategoriesLinks categories={[...allCategories]} />*/}
                  <footer>
                    <p className='copyright'>
                      Made with Gatsby. Based on Lumen theme.
                    </p>
                  </footer>
                </div>
              </div>
            </div>
        )
    }
}

SiteSidebar.propTypes = {
    children: React.PropTypes.any,
    location: React.PropTypes.object,
}

export default SiteSidebar
