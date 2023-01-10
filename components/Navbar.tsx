const Navbar = ({
  hideButton,
  text,
  downloadTextAsFile,
  clearTextArea,
  shareNote,
  shareLoading,
}: {
  hideButton: boolean;
  text: string;
  downloadTextAsFile: (text: string) => void;
  clearTextArea: () => void;
  shareNote: () => Promise<void>;
  shareLoading: boolean;
}) => {
  return (
    <div className="py-4 flex justify-between px-5 sticky w-screen bg-primary text-primary-content">
      <h1 className="text-xl font-bold">webnotes</h1>
      <ul className="flex space-x-3">
        <span className={`${hideButton ? "hidden" : "block"} flex space-x-3`}>
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
              className={shareLoading ? "text-gray-500 cursor-not-allowed" : ""}
              disabled={shareLoading}
              onClick={shareNote}
            >
              Share
            </button>
          </li>
        </span>
      </ul>
    </div>
  );
};

export default Navbar;
