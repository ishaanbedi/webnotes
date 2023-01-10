const NoteArea = ({
  text,
  handleTextChange,
}: {
  text: string;
  handleTextChange: (value: string) => void;
}) => {
  return (
    <section>
      <textarea
        id="textarea"
        className="min-h-screen w-screen px-5 pt-3 outline-none resize-none	bg-base-200 text-base-content"
        placeholder="Start typing here..."
        value={text}
        onChange={(e) => handleTextChange(e.target.value)}
      />
    </section>
  );
};

export default NoteArea;
