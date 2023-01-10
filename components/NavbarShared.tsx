const Navbar = ({
  showAbout,
  markdownMode,
  setMarkdownMode,
  downloadTextAsFile,
  text,
}: {
  showAbout: () => void;
  markdownMode: boolean;
  setMarkdownMode: (markdownMode: boolean) => void;
  downloadTextAsFile: (text: string) => void;
  text: string;
}) => {
  return (
    <div className="py-4 flex justify-between items-center px-6 sticky w-screen bg-primary text-primary-content">
      <h1 className="text-xl font-bold">shared webnote</h1>
      <ul className="flex space-x-3 font-semibold">
        <li>
          <button
            onClick={() => {
              setMarkdownMode(!markdownMode);
            }}
            className={`${markdownMode ? "link underline-offset-4" : ""}`}
          >
            Markdown
          </button>
        </li>
        <li>
          <button
            onClick={() => {
              downloadTextAsFile(text);
            }}
          >
            Download
          </button>
        </li>
      </ul>
    </div>
  );
};

export default Navbar;
