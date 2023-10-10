import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";
import { IoMdCopy } from "react-icons/io";
import { BsChevronDoubleRight } from "react-icons/bs";
import toast from 'react-hot-toast';

const Modals = ({
  shareRecordID,
  downloadFileName,
  setDownloadFileName,
  text,
  markdownMode,
}: {
  shareRecordID: string;
  downloadFileName: string;
  setDownloadFileName: (value: string) => void;
  text: string;
  markdownMode: boolean;
}) => {
  const [slug, setSlug] = useState("");
  const [isAvailable, setIsAvailable] = useState(null);
  const [success, setSuccess] = useState(false);
  const handleSaveSlug = () => {
    const fetchData = axios
      .post("/api/save-slug" + `?slug=${slug}&recordID=${shareRecordID}`)
      .catch((error) => {
      });
    setSuccess(true);
    toast.promise(fetchData, {
      loading: 'Saving...',
      success: 'Done',
      error: 'An error occurred...',
    });
  };

  useEffect(() => {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();

    const debounceTimer = setTimeout(() => {
      if (slug.length > 0) {
        axios.get(`/api/check-slug?slug=${slug}`, { cancelToken: source.token })
          .then(response =>
            setIsAvailable(
              response.data
            )
          )
          .then(response => console.log(response))
          .catch(error => {
            if (axios.isCancel(error)) {
              console.log('Request cancelled');
            } else {
              console.error(error);
            }
          });
      }
    }, 500); // debounce time of 500ms

    return () => {
      clearTimeout(debounceTimer);
      source.cancel('Request cancelled');
    };
  }, [slug]);

  return (
    <div>
      <input type="checkbox" id="share-note-modal" className="modal-toggle" />
      <div className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <h3 className="font-bold text-lg">
            Share your note with others 🤝
          </h3>
          <div>
            <input
              onChange={(event) => {
                setIsAvailable(null);
                setSuccess(false);
                const inputValue = event.target.value;
                const sanitizedValue = inputValue.replace(/[^a-zA-Z0-9]/g, '');
                event.target.value = sanitizedValue;
                setSlug(sanitizedValue);
              }}
              value={slug}
              type="text" placeholder="Enter a custom slug..." className="input input-bordered w-full my-3" />
          </div>
          <div className={`text-sm ${slug.length > 0 && !success ? "visible" : "invisible"}`}>
            {isAvailable === true && <p>slug is available!</p>}
            {isAvailable === false && <p>slug is not available.</p>}
            {isAvailable === null && <p>Checking slug availability...</p>}
          </div>
          <div className="flex justify-between items-center">
            <span className="flex items-center">
              <BsChevronDoubleRight
                className={`text-bold`}
              />
              <Link
                href={
                  `${process.env.NEXT_PUBLIC_APP_URL}/${slug !== "" ? slug : shareRecordID}`
                }
                target={"_blank"}
                className="link ml-2"
              >
                <p className="py-4 font-bold">
                  {`${process.env.NEXT_PUBLIC_APP_URL}/${slug !== "" ? slug : shareRecordID}`}
                </p>
              </Link>
            </span>
            <span>
              <button
                disabled={(!isAvailable && slug.length > 0)}
                className={`btn btn-sm btn-ghost`}
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${process.env.NEXT_PUBLIC_APP_URL}/${slug !== "" ? slug : shareRecordID}`
                  );
                  toast.success('Copied!');
                }
                }
              >
                <IoMdCopy className="text-xl" />
              </button>
            </span>
          </div>
          <span className="flex justify-end space-x-3">
            <div className="modal-action">
              <button

                disabled={!isAvailable || slug.length === 0 || success}
                className={`btn`}
                onClick={() => {
                  handleSaveSlug();
                }
                }
              >
                Save slug
              </button>
            </div>
            <div className="modal-action">
              <label htmlFor="share-note-modal" className="btn">
                Close
              </label>
            </div>
          </span>
        </div>
      </div>
      <input type="checkbox" id="about-modal" className="modal-toggle" />
      <div className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <h3 className="font-bold text-lg">About webnotes</h3>
          <h4>
            <span className="font-bold">webnotes</span> is a simple, open-source
            note-taking app built with modern web technologies.
          </h4>
          <h4 className="font-bold pt-2">🌟 Features</h4>
          <ul className="list-disc list-inside">
            <li>Share your notes with others 🤝</li>
            <li>Download notes to your system 💾</li>
            <li>
              Supports{" "}
              <Link
                href="https://www.markdownguide.org/getting-started/#what-is-markdown"
                target={"_blank"}
                className="link "
              >
                Markdown
              </Link>{" "}
              preview ⚡️
            </li>
            <li>Supports offline working 📱</li>
            <li>
              Built by{" "}
              <Link
                className="link"
                href="https://www.ishaanbedi.in"
                target={"_blank"}
              >
                Ishaan Bedi
              </Link>{" "}
              in 2023 🚀
            </li>
          </ul>
          <span className="flex justify-end space-x-3">
            <div className="modal-action">
              <Link
                target={"_blank"}
                href="https://www.github.com/ishaanbedi/webnotes"
              >
                <label className="btn">GitHub</label>
              </Link>
            </div>
            <div className="modal-action">
              <label htmlFor="about-modal" className="btn">
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
          <h3 className="font-bold text-lg">
            Download the note as a {markdownMode ? "Markdown" : "Text"} file
          </h3>
          <div className="form-control w-full py-3">
            <input
              type="text"
              placeholder="Enter the file name here..."
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
                    `${downloadFileName.length === 0
                      ? "webnote"
                      : downloadFileName
                    }.${!markdownMode ? "txt" : "md"}`
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
      <input type="checkbox" id="welcome-modal" className="modal-toggle" />
      <div className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Welcome to <span className="font-bold">webnotes</span></h3>
          <h4>
            <span className="font-bold">webnotes</span> is a simple, open-source
            note-taking app built with modern web technologies.
          </h4>
          <h4 className="font-bold pt-2">🌟 Features</h4>
          <ul className="list-disc list-inside">
            <li>Share your notes with others 🤝</li>
            <li>Download notes to your system 💾</li>
            <li>
              Supports{" "}
              <Link
                href="https://www.markdownguide.org/getting-started/#what-is-markdown"
                target={"_blank"}
                className="link "
              >
                Markdown
              </Link>{" "}
              preview ⚡️
            </li>
            <li>Supports offline working 📱</li>
            <li>
              Built by{" "}
              <Link
                className="link"
                href="https://www.ishaanbedi.in"
                target={"_blank"}
              >
                Ishaan Bedi
              </Link>{" "}
              in 2023 🚀
            </li>
          </ul>
          <span className="flex justify-end space-x-3">
            <div className="modal-action">
              <Link
                target={"_blank"}
                href="https://www.github.com/ishaanbedi/webnotes"
              >
                <label className="btn">GitHub</label>
              </Link>
            </div>
            <div className="modal-action">
              <label htmlFor="welcome-modal" className="btn">
                Close
              </label>
            </div>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Modals;
