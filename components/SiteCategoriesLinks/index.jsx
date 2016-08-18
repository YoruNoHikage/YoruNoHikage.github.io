import React from 'react'
import { Link } from 'react-router'
import { prefixLink } from 'gatsby-helpers'

export default class SiteCategoriesLinks extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      currentCategory: null,
    }

    this.chooseCategory = this.chooseCategory.bind(this)
  }

  chooseCategory(e) {
    this.setState({
      currentCategory: e.target.innerText,
    })
  }

  render() {
    const { categories } = this.props
    const { currentCategory } = this.state

    return (
      <div>
        <h3>Categories</h3>
        {currentCategory &&
          <span className="fa fa-close" onClick={() => this.setState({currentCategory: null})} />
        }
        <ul>
          {categories.map(c => {
            return (<li><a href="#" onClick={this.chooseCategory}>{c}</a></li>)
          })}
        </ul>
      </div>
    )
  }
}
