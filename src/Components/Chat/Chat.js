import React, { useEffect, useState } from 'react';
import styles from './Chat.module.scss';
import messages from './chat.json';
import options from './options.json';

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
  const [hintPosition, setHintPosition] = useState([]);
  const [showHint, setShowHint] = useState(false);
  const [answers, setAnswers] = useState({
    3: [186, 615, 221, 658],
    5: [611, 276, 626, 305],
    7: [377, 271, 401, 318],
    9: [377, 271, 401, 318]
  });
  const [tiles, setTiles] = useState({
    3: [806, 1100],
    5: [686, 1100],
    7: [672, 1100],
    9: [672, 1100]
  });

  useEffect(() => {
    appendHistory(current);
  }, []);

  useEffect(() => {
    let chatHistory = document.getElementById("messageBody");
    if (chatHistory && chatHistory.scrollHeight) chatHistory.scrollTop = chatHistory.scrollHeight;
  }, [history, loading]);

  const handleMouseMove = (event) => {
    const rect = event.target.getBoundingClientRect();
    const x = Math.floor(event.clientX - rect.left);
    const y = Math.floor(event.clientY - rect.top);
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

  const translate2 = (x, y, h, w) => {
    const [height, width] = tiles[current];
    const _x = Math.floor(x / (width / w));
    const _y = Math.floor(y / (height / h));
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
      await sleep(time).then(() => history.push(entry));
      setHistory(JSON.parse(JSON.stringify(history)));
    }
    setLoading(false);
  };

  const respond = async (value) => {
    if (value === "I need a hint 👀") {
      const answer = answers[current];
      const [xmin, ymin, xmax, ymax] = answer;
      const { x, y } = translate2(xmin - 50, ymin - 50, mousePos.height, mousePos.width);

      let w = 200;
      if (x + w > mousePos.width) w = mousePos.width - x;

      let h = 200;
      if (y + h > mousePos.height) h = mousePos.height - y;

      setHintPosition([x, y, h, w]);
      setShowHint(true);
    } else {
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
      } else if (value === "No ❌") {
        history.push({ "Jade": "That's a shame, but it is ok. See you another time 😉" });
        setHistory(JSON.parse(JSON.stringify(history)));
        messagesList[steps[current]].options = [];
        await sleep(10).then(() => reset());
      } else if (value === "I give up 😩") {
        history.push({ "Jade": "Don’t worry, it was hard to find, fortunate I got a copy of the answers which told me where he was 😉" });
        setHistory(JSON.parse(JSON.stringify(history)));
        appendHistory(current + 1);
      } else appendHistory(current + 1);
    }
  };

  const play = () => {
    if (mouseEvent) removeEvent(mouseEvent);
    const answer = answers[current];
    const [xmin, ymin, xmax, ymax] = answer;
    const { x, y } = translate(mousePos.x, mousePos.y, mousePos.height, mousePos.width);
    if (x >= xmin && x <= xmax) {
      if (y >= ymin && y <= ymax) {
        setShowHint(false);
        history.push({ "Jade": "You found it 🥳" });
        setHistory(JSON.parse(JSON.stringify(history)));
        appendHistory(current + 1);
      }
    } else if (mouseEvent) addEvent(mouseEvent);
  }

  return (
    <div className={`container ${styles.Content}`} id="messageBody">
      <div className={styles.Chat}>
        {
          history.map((value, index) => {
            let k = Object.keys(value)[0]
            let v = Object.values(value)[0]

            if (k === 'Game') {
              return (
                <div style={{ position: "relative" }}>
                  {
                    showHint &&
                    <div
                      className={styles.Hint}
                      style={{ left: hintPosition[0], top: hintPosition[1], height: hintPosition[2], width: hintPosition }}
                    />
                  }
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
                </div>
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
        <div className='row justify-content-md-center' style={{ width: "100%" }}>
          {
            !!messagesList[steps[current]].options && !loading &&
            messagesList[steps[current]].options.map((value, index) => (
              <div className='col col-sm-4' style={{ display: "flex", justifyContent: "center" }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  key={`${value}${index}`}
                  onClick={() => respond(value)}
                  style={{ font: "calibri", fontWeight: 500, fontSize: '20px', marginRight: "0.5rem", marginBottom: "0.5rem" }}
                >
                  {value}
                </button>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
};

export default Chat;
