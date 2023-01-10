import Link from "next/link";

const Modals = ({
  shareRecordID,
  setCopyButtonText,
  copyButtonText,
  downloadFileName,
  setDownloadFileName,
  text,
}: {
  shareRecordID: string;
  setCopyButtonText: (value: string) => void;
  copyButtonText: string;
  downloadFileName: string;
  setDownloadFileName: (value: string) => void;
  text: string;
}) => {
  return (
    <div>
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
            <li>Supports offline working 📱</li>
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

export default Modals;
