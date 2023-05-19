import React from 'react';
import styles from './Home.module.scss';

import Chat from '../../Components/Chat/Chat';
import Navbar from '../../Components/Navbar/Navbar';

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      key: 0
    };
  }

  reset = () => {
    this.setState((prvsState) => ({ key: prvsState.key + 1 }));
  };

  render = () => {
    const { key } = this.state;
    return (
      <div className={styles.Home}>
        <Navbar />
        <Chat key={`Chat${key}`} reset={this.reset} />
      </div>
    )
  }
};

Home.propTypes = {};

Home.defaultProps = {};

export default Home;
