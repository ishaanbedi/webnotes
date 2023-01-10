import { getXataClient } from "../src/xata";
import { NextPage } from "next";
import { useEffect, useState } from "react";
import { Context } from "vm";
import Head from "next/head";
import Link from "next/link";
interface Props {
  note: string;
}
const Home: NextPage<Props> = (props) => {
  const [note, setNote] = useState(props.note);
  const [downloadFileName, setDownloadFileName] = useState("");
  useEffect(() => {
    localStorage.setItem("note", note);
  }, [note]);
  useEffect(() => {
    const value = localStorage.getItem("note") ?? "";
    setNote(JSON.parse(value));
  }, []);
  const downloadTextAsFile = (text: string) => {
    var label = document.createElement("label");
    label.htmlFor = "download-file-modal";
    document.body.appendChild(label);
    label.classList.add("hidden");
    label.click();
    document.body.removeChild(label);
  };
  return (
    <div>
      <Head>
        <title>webnotes | Shared Note</title>
      </Head>
      <header>
        <div className="py-4 flex justify-between px-5 sticky w-screen bg-primary text-primary-content">
          <Link href="/">
            <h1 className="text-xl font-bold">webnotes | Shared Note</h1>
          </Link>
          <ul className="flex space-x-3">
            <span className={` flex space-x-3`}>
              <li>
                <button
                  onClick={() => {
                    downloadTextAsFile(note);
                  }}
                >
                  Download
                </button>
              </li>
            </span>
          </ul>
        </div>
      </header>
      <textarea
        className="min-h-screen w-screen px-5 pt-3 outline-none resize-none bg-base-200 text-base-content"
        placeholder="The person who shared this note with you has not written anything in this note."
        value={note}
        onChange={(e) => setNote(e.target.value)}
        disabled
      />
      <input
        type="checkbox"
        id="download-file-modal"
        className="modal-toggle"
      />
      <div className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <h3 className="font-bold text-lg">
            Download the shared note as a file.
          </h3>
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
                    "data:text/plain;charset=utf-8," + encodeURIComponent(note)
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

export const getServerSideProps = async (context: Context) => {
  const id = context.query.id;
  const xata = getXataClient();
  const record = await xata.db.shared_webnotes.read(`rec_${id}`);
  if (record === null) {
    return {
      notFound: true,
    };
  }
  const note = record.note;
  return {
    props: {
      note,
    },
  };
};
