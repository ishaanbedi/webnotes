import type { NextPage } from "next";
import Head from "next/head";
import { useEffect, useState } from "react";
const Home: NextPage = () => {
  const [hideButton, setHideButton] = useState(false);
  const [text, setText] = useState("");
  useEffect(() => {
    if (localStorage.getItem("text") === null) {
      setHideButton(true);
    } else {
      setHideButton(false);
    }
  }, [text]);
  useEffect(() => {
    if (localStorage.getItem("text") === null) {
      setText("");
    } else {
      setText(JSON.parse(localStorage.getItem("text") || ""));
    }
  }, []);
  const handleTextChange = (value: string) => {
    localStorage.setItem("text", JSON.stringify(value));
    setText(value);
  };
  const downloadTextAsFile = (text: string) => {
    const element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(text)
    );
    element.setAttribute("download", "webnote.txt");
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const clearTextArea = () => {
    localStorage.removeItem("text");
    setText("");
    setHideButton(true);
  };
  return (
    <div>
      <Head>
        <title>webnotes | take quick notes</title>
      </Head>
      <header>
        <div className="py-4 flex justify-between px-5 bg-gray-50 sticky w-screen">
          <h1 className="text-xl font-bold">webnotes</h1>
          <ul className="flex space-x-3">
            <span
              className={`${hideButton ? "hidden" : "block"} flex space-x-3`}
            >
              <li
                onClick={() => {
                  downloadTextAsFile(text);
                }}
              >
                <button>Download</button>
              </li>
              <li onClick={clearTextArea}>
                <button>Clear</button>
              </li>
            </span>
          </ul>
        </div>
      </header>
      <section>
        <textarea
          id="textarea"
          className="h-screen w-screen px-5 pt-3 outline-none resize-none	"
          placeholder="Start typing here..."
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
        />
      </section>
    </div>
  );
};

export default Home;
