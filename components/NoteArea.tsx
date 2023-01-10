import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
const NoteArea = ({
  text,
  handleTextChange,
  markdownMode,
}: {
  text: string;
  handleTextChange: (value: string) => void;
  markdownMode: boolean;
}) => {
  return (
    <section>
      {markdownMode ? (
        <ReactMarkdown
          className="prose max-w-none min-h-screen w-screen px-5 pt-3 outline-none resize-none	bg-base-200 text-base-content"
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeKatex]}
        >
          {text}
        </ReactMarkdown>
      ) : (
        <textarea
          id="textarea"
          className="min-h-screen w-screen px-5 pt-3 outline-none resize-none	bg-base-200 text-base-content"
          placeholder="Start typing here..."
          value={text}
          onChange={(e) => {
            handleTextChange(e.target.value);
          }}
        />
      )}
    </section>
  );
};

export default NoteArea;
