import React from 'react';
import styles from './Navbar.module.scss';

import jade from './jade.png';

const Navbar = () => (
  <div className={styles.Navbar}>
    <div className='container'>
      <div className='row'>
        <div className='col-1' style={{ maxHeight: "6rem" }}>
          <img src={jade} className={`img-fluid ${styles.Avatar}`} alt="Jade portrait" />
          <span className={styles.dot} />
        </div>
        <div className='col-8' style={{ display: "flex", alignItems: "center" }}>
          <h1 style={{ marginLeft: "0.5rem", marginBottom: "0" }}>Jade - Can you help me?</h1>
        </div>
      </div>
    </div>
  </div>
);

export default Navbar;
