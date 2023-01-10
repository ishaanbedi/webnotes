const Navbar = ({
  hideButton,
  text,
  downloadTextAsFile,
  clearTextArea,
  shareNote,
  shareLoading,
  showAbout,
}: {
  hideButton: boolean;
  text: string;
  downloadTextAsFile: (text: string) => void;
  clearTextArea: () => void;
  shareNote: () => Promise<void>;
  shareLoading: boolean;
  showAbout: () => void;
}) => {
  return (
    <div className="py-4 flex justify-between px-6 sticky w-screen bg-primary text-primary-content">
      <h1 className="text-xl font-bold">webnotes 🚀</h1>
      <ul className="flex space-x-3 font-semibold">
        <span className={`${hideButton ? "hidden" : "block"} flex space-x-3`}>
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className={`${shareLoading ? "cursor-not-allowed text-base-300" : "cursor-pointer "}`}>
              {
                shareLoading ? "Loading" : "Menu"
              }
            </label>
            <ul
              tabIndex={0}
              className="menu dropdown-content p-2 shadow bg-base-100 text-primary rounded-box w-52 mt-4"
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
            </ul>
          </div>
        </span>
        <li>
          <button onClick={showAbout}>About</button>
        </li>
      </ul>
    </div>
  );
};

export default Navbar;
