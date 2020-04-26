import React from 'react';

import Sidebar from '../components/Sidebar';

export default function About() {
  return (
    <div className="wrapper">
      <div>
        <Sidebar />
        <div className="content">
          <div className="main">
            <div className="main-inner">
              <div className="blog-page">
                <div className="text">
                  <h2>About</h2>
                  <p>
                    Hey guys, I'm a programmer from Brittany, France. I don't
                    know what to say for now, so you can <a href="https://www.alexislaunay.fr/en">check my pro
                    website</a> instead!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
