import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import Navbar from "../components/Navbar";
import axios from "axios";
import { useEffect, useState } from "react";
import NoteArea from "../components/NoteArea";
import Modals from "../components/Modals";
const Home: NextPage = () => {
  const [hideButton, setHideButton] = useState(false);
  const [text, setText] = useState("");
  const [shareLoading, setShareLoading] = useState(false);
  const [shareRecordID, setShareRecordID] = useState("");
  const [downloadFileName, setDownloadFileName] = useState("");
  const [markdownMode, setMarkdownMode] = useState(false);
  useEffect(() => {
    if (localStorage.getItem("webnote-text") === null) {
      setHideButton(true);
    } else {
      setHideButton(false);
    }
  }, [text, markdownMode]);
  useEffect(() => {
    if (localStorage.getItem("webnote-text") === null) {
      setText("");
    } else {
      setText(JSON.parse(localStorage.getItem("webnote-text") || ""));
    }
  }, []);
  const handleTextChange = (value: string) => {
    if (value === "") {
      clearTextArea();
      return;
    }
    localStorage.setItem("webnote-text", JSON.stringify(value));
    setText(value);
  };
  const downloadTextAsFile = () => {
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
        apiKey: process.env.NEXT_PUBLIC_API_KEY,
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
  const showAbout = () => {
    var label = document.createElement("label");
    label.htmlFor = "about-modal";
    document.body.appendChild(label);
    label.classList.add("hidden");
    label.click();
    document.body.removeChild(label);
  };
  return (
    <div>
      <Head>
        <title>webnotes | take quick notes</title>
      </Head>
      <header>
        <Navbar
          showAbout={showAbout}
          clearTextArea={clearTextArea}
          shareNote={shareNote}
          downloadTextAsFile={downloadTextAsFile}
          shareLoading={shareLoading}
          hideButton={hideButton}
          text={text}
          markdownMode={markdownMode}
          setMarkdownMode={setMarkdownMode}
        />
      </header>
      <NoteArea
        markdownMode={markdownMode}
        text={text}
        handleTextChange={handleTextChange}
      />
      <Modals
        shareRecordID={shareRecordID}
        downloadFileName={downloadFileName}
        setDownloadFileName={setDownloadFileName}
        text={text}
        markdownMode={markdownMode}
      />
    </div>
  );
};
export default Home;
