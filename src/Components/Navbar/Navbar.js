import React, { useEffect, useRef, useState } from 'react';
import styles from './Navbar.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashCan } from '@fortawesome/free-regular-svg-icons';

import jade from './jade.png';

function Navbar(props) {
  const portrait = useRef();
  const [rendered, setRendered] = useState(false);
  const [status, setStatus] = useState({});

  useEffect(() => {
    if (portrait.current.height > 0) {
      const w = portrait.current.width;
      const h = portrait.current.height;

      if (window.innerWidth < 700) {
        setStatus({
          w: w / 3,
          h: h / 3,
          l: (w / 12) * 11.5,
          t: (h / 12) * 11.5,
        });
      } else setStatus({
        w: w / 3.5,
        h: h / 3.5,
        l: (w / 12) * 10,
        t: (h / 12) * 10,
      });
    } else setTimeout(setRendered(!rendered), 1000);
  }, [rendered]);

  useEffect(() => {
    setRendered(true);
  }, []);

  return (
    <div className={styles.Navbar}>
      <div className='container'>
        <div className='row justify-content-md-center'>
          <div className='col-2' style={{ maxHeight: "6rem", position: "relative", display: "flex", alignItems: "center" }}>
            <img
              src={jade}
              id="jadePortrait"
              className={`img-fluid ${styles.Avatar}`}
              alt="Jade portrait"
              ref={portrait}
            />
            {
              status.w && status.h &&
              <span
                className={styles.dot}
                style={{
                  width: status.w,
                  height: status.h,
                  left: `${status.l}px`,
                  top: `${status.t}px`
                }}
              />
            }
          </div>
          <div className='col-8' style={{ display: "flex", alignItems: "center" }}>
            <h1 style={{ marginLeft: "0.5rem", marginBottom: "0" }}>Jade - Can you help me?</h1>
          </div>
          <div className='col-2'>

            <FontAwesomeIcon icon={faTrashCan} onClick={() => props.reset()} />
          </div>
        </div>
      </div>
    </div>
  )
  // }
};

export default Navbar;
