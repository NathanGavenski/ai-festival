import React, { useEffect, useState } from 'react';
import styles from './Chat.module.scss';
import messages from './chat.json';
import options from './options.json';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashCan } from '@fortawesome/free-regular-svg-icons';

function Chat(props) {
  const [messagesList, setMessages] = useState(messages);
  const [optionsList, setOptions] = useState(options);
  const [steps, setSteps] = useState(Object.keys(messages));
  const [current, setCurrent] = useState(0);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mousePos, setMousePos] = useState({});
  const [mouseEvent, setMouseEvent] = useState("");
  const [typingSpeed, setTypingSpeed] = useState(200);
  const [answers, setAnswers] = useState({
    2: [186, 615, 221, 658],
    4: [611, 276, 626, 305],
    6: [377, 271, 401, 318],
    8: [377, 271, 401, 318]
  });
  const [tiles, setTiles] = useState({
    2: [806, 1100],
    4: [686, 1100],
    6: [672, 1100],
    8: [672, 1100]
  });

  useEffect(() => {
    appendHistory(current);
  }, []);

  useEffect(() => {
    let chatHistory = document.getElementById("messageBody");
    if (chatHistory && chatHistory.scrollHeight) chatHistory.scrollTop = chatHistory.scrollHeight;
  }, [history, loading]);

  const handleMouseMove = (event) => {
    var rect = event.target.getBoundingClientRect();
    var x = Math.floor(event.clientX - rect.left); //x position within the element.
    var y = Math.floor(event.clientY - rect.top);  //y position within the element
    const height = rect.height;
    const width = rect.width;
    setMousePos({ x, y, height, width });
  };

  const translate = (x, y, h, w) => {
    const [height, width] = tiles[current];
    const _x = Math.floor(x / (w / width));
    const _y = Math.floor(y / (h / height));
    return { x: _x, y: _y };
  };

  const addEvent = (name) => {
    setMouseEvent(name);
    document
      .getElementById(name)
      .addEventListener('mousemove', handleMouseMove);
  }

  const removeEvent = (name) => {
    document
      .getElementById(name)
      .removeEventListener('mousemove', handleMouseMove);
  }

  const sleep = async (s) => {
    // return new Promise(resolve => setTimeout(resolve, s * 0));
    return new Promise(resolve => setTimeout(resolve, s * 1000));
  }

  const reset = () => {
    props.reset();
  }

  const appendHistory = async (current) => {
    setCurrent(current);
    setLoading(true);
    for (const entry of messagesList[steps[current]].chat) {
      let sentence = Object.values(entry)[0];
      let t = Object.keys(entry)[0];

      const time = Math.max(sentence.length / typingSpeed, 1);
      console.log(time);
      await sleep(time).then(() => history.push(entry));
      setHistory(JSON.parse(JSON.stringify(history)));
    }
    setLoading(false);
  };

  const respond = async (value) => {
    history.push({ "User": value });
    if (steps[current] === "bias") {
      setLoading(true);

      history.push({ "Image": optionsList[value].image });
      setHistory(JSON.parse(JSON.stringify(history)));

      await sleep(optionsList[value].text.length / typingSpeed)
        .then(() => history.push({ "Jade": optionsList[value].text }));
      setHistory(JSON.parse(JSON.stringify(history)));

      const linkText = "If you would like to know more about it, be sure to access: ";
      await sleep(linkText.length / typingSpeed)
        .then(() => history.push({ "Link": [linkText, optionsList[value].link] }));
      setHistory(JSON.parse(JSON.stringify(history)));

      setLoading(false);
    } else if (value === "No ❌" || value === "I give up 😩") {
      history.push({ "Jade": "That's a shame, but it is ok. See you another time 😉" });
      setHistory(JSON.parse(JSON.stringify(history)));
      await sleep(5).then(() => reset());
    } else appendHistory(current + 1);
  };

  const play = () => {
    removeEvent(mouseEvent);
    const answer = answers[current];
    const [xmin, ymin, xmax, ymax] = answer;
    const { x, y } = translate(mousePos.x, mousePos.y, mousePos.height, mousePos.width);
    if (x >= xmin && x <= xmax) {
      if (y >= ymin && y <= ymax) appendHistory(current + 1);
    } else addEvent(mouseEvent);
  }

  return (
    <div className={`container ${styles.Content}`} id="messageBody">
      <FontAwesomeIcon icon={faTrashCan} onClick={() => reset()} />
      <div className={styles.Chat}>
        {
          history.map((value, index) => {
            let k = Object.keys(value)[0]
            let v = Object.values(value)[0]

            if (k === 'Game') {
              return (
                <img
                  src={`https://github.com/NathanGavenski/ai-festival/blob/gh-pages${v}?raw=true`}
                  id={`tile${index}`}
                  key={`tile${index}`}
                  alt="tile for the wally game"
                  className='img-fluid game-tile'
                  onClick={() => play()}
                  onMouseEnter={() => addEvent(`tile${index}`)}
                  onMouseLeave={() => removeEvent(`tile${index}`)}
                />
              )
            } else if (k === 'Guess') {
              const [guess, heatmap] = v;
              return (
                <div className='row'>
                  <img 
                    src={`https://github.com/NathanGavenski/ai-festival/blob/gh-pages${guess}?raw=true`}
                    className='col-6 img-fluid game-tile' 
                    alt="jade's guess" 
                  />
                  <img 
                    src={`https://github.com/NathanGavenski/ai-festival/blob/gh-pages${heatmap}?raw=true`} 
                    className='col-6 img-fluid game-tile' 
                    alt="jade's attention map" 
                  />
                </div>
              )
            } else if (k === "Link") {
              const [text, link] = v;
              return (
                <div
                  key={`Link${index}`}
                  className={`${styles.bubble} ${styles.Jade}`}
                >
                  {text}
                  <a href={link} target='_blank' rel="noreferrer">{link}</a>
                </div>
              )
            } else if (k === "Image") {
              return (
                <div className={`${styles.bubble} ${styles.Jade}`}>
                  <img className={styles.Image} src={v} alt="project logo" />
                </div>
              )
            }
            return (
              <div
                key={index}
                className={`${styles.bubble} ${styles[k]}`}
                style={{ width: v === 'User' ? `${v.length + 4}ch` : '' }}
              >
                {v}
              </div>
            )
          })
        }
      </div>
      <div className={styles.Loader}>
        {
          loading &&
          <div className="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
        }
      </div>
      <div className={styles.Option}>
        {
          !!messagesList[steps[current]].options && !loading &&
          messagesList[steps[current]].options.map((value, index) => (
            <button
              type="button"
              className="btn btn-primary"
              key={`${value}${index}`}
              onClick={() => respond(value)}
              style={{ font: "calibri", fontWeight: 500, fontSize: '20px' }}
            >
              {value}
            </button>
          ))
        }
      </div>
    </div>
  )
};

export default Chat;
