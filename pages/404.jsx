import React from 'react';

import Sidebar from '../components/Sidebar';

export default function NotFound() {
  return (
    <div className="wrapper">
      <div>
        <Sidebar />
        <div className="content">
          <div className="main">
            <div className="main-inner">
              <div className="blog-page">
                <div className="text">
                  <h2>404</h2>
                  <p>Nothing here, sorry. :(</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
