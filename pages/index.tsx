import axios from "axios";
import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
const Home: NextPage = () => {
  const [hideButton, setHideButton] = useState(false);
  const [text, setText] = useState("");
  const [shareLoading, setShareLoading] = useState(false);
  const [shareRecordID, setShareRecordID] = useState("");
  const [copyButtonText, setCopyButtonText] = useState("Copy");
  const [downloadFileName, setDownloadFileName] = useState("");
  useEffect(() => {
    if (localStorage.getItem("webnote-text") === null) {
      setHideButton(true);
    } else {
      setHideButton(false);
    }
  }, [text]);
  useEffect(() => {
    if (localStorage.getItem("webnote-text") === null) {
      setText("");
    } else {
      setText(JSON.parse(localStorage.getItem("webnote-text") || ""));
    }
  }, []);
  const handleTextChange = (value: string) => {
    localStorage.setItem("webnote-text", JSON.stringify(value));
    setText(value);
  };
  const downloadTextAsFile = (text: string) => {
    var label = document.createElement("label");
    label.htmlFor = "download-file-modal";
    document.body.appendChild(label);
    label.classList.add("hidden");
    label.click();
    document.body.removeChild(label);
  };

  const clearTextArea = () => {
    localStorage.removeItem("webnote-text");
    setText("");
    setHideButton(true);
  };
  const shareNote = async () => {
    setShareLoading(true);
    const { data } = await axios.get(`/api/share-note`, {
      params: {
        note: text,
      },
    });
    var label = document.createElement("label");
    label.htmlFor = "share-note-modal";
    document.body.appendChild(label);
    label.classList.add("hidden");
    label.click();
    document.body.removeChild(label);
    setShareLoading(false);
    setShareRecordID(data);
  };
  return (
    <div>
      <Head>
        <title>webnotes | take quick notes</title>
      </Head>
      <header>
        <div className="py-4 flex justify-between px-5 sticky w-screen bg-primary text-primary-content">
          <h1 className="text-xl font-bold">webnotes</h1>
          <ul className="flex space-x-3">
            <span
              className={`${hideButton ? "hidden" : "block"} flex space-x-3`}
            >
              <li>
                <button
                  onClick={() => {
                    downloadTextAsFile(text);
                  }}
                >
                  Download
                </button>
              </li>
              <li>
                <button onClick={clearTextArea}>Clear</button>
              </li>
              <li>
                <button
                  className={
                    shareLoading ? "text-gray-500 cursor-not-allowed" : ""
                  }
                  disabled={shareLoading}
                  onClick={shareNote}
                >
                  Share
                </button>
              </li>
            </span>
          </ul>
        </div>
      </header>
      <section>
        <textarea
          id="textarea"
          className="min-h-screen w-screen px-5 pt-3 outline-none resize-none	bg-base-200 text-base-content"
          placeholder="Start typing here..."
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
        />
      </section>
      <input type="checkbox" id="share-note-modal" className="modal-toggle" />
      <div className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <h3 className="font-bold text-lg">
            Awesome! Here&apos;s your shareable link for this note.
          </h3>
          <Link
            href={`https://webnotes.ishn.xyz/${shareRecordID}`}
            target={"_blank"}
            className="link"
          >
            <p className="py-4">webnotes.ishn.xyz/{shareRecordID}</p>
          </Link>
          <span className="flex justify-end space-x-3">
            <div className="modal-action">
              <label
                onClick={() => {
                  navigator.clipboard.writeText(
                    `https://webnotes.ishn.xyz/${shareRecordID}`
                    );
                  setCopyButtonText("Copied!");
                  setTimeout(() => {
                    setCopyButtonText("Copy");
                  }, 2000);
                }}
                className="btn"
              >
                {copyButtonText}
              </label>
            </div>
            <div className="modal-action">
              <label htmlFor="share-note-modal" className="btn">
                Close
              </label>
            </div>
          </span>
        </div>
      </div>
      <input
        type="checkbox"
        id="download-file-modal"
        className="modal-toggle"
      />
      <div className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Download the note as a file.</h3>
          <div className="form-control w-full py-3">
            <input
              type="text"
              placeholder="webnote"
              value={downloadFileName}
              className="input input-bordered w-full"
              onChange={(e) => setDownloadFileName(e.target.value)}
              onKeyPress={(e) => {
                var allowedChars = /^[a-zA-Z0-9 ]+$/;
                if (!allowedChars.test(e.key)) {
                  e.preventDefault();
                }
              }}
            />
          </div>

          <span className="flex justify-end space-x-3">
            <div className="modal-action">
              <label
                onClick={() => {
                  const element = document.createElement("a");
                  element.setAttribute(
                    "href",
                    "data:text/plain;charset=utf-8," + encodeURIComponent(text)
                  );
                  element.setAttribute(
                    "download",
                    `${
                      downloadFileName.length === 0
                        ? "webnote"
                        : downloadFileName
                    }.txt`
                  );
                  element.style.display = "none";
                  document.body.appendChild(element);
                  element.click();
                  document.body.removeChild(element);
                  setDownloadFileName("");
                }}
                className="btn"
                htmlFor="download-file-modal"
              >
                Download
              </label>
            </div>
            <div className="modal-action">
              <label
                onClick={() => {
                  setDownloadFileName("");
                }}
                htmlFor="download-file-modal"
                className="btn"
              >
                Cancel
              </label>
            </div>
          </span>
        </div>
      </div>
    </div>
  );
};
export default Home;