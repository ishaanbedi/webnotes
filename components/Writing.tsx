import { useEffect, useState } from "react";
const Writing = () => {
  const [text, setText] = useState("");
  useEffect(() => {
    setText(JSON.parse(localStorage.getItem("text") || ""));
  }, []);
  const handleTextChange = (value: string) => {
    localStorage.setItem("text", JSON.stringify(value));
    setText(value);
  };
  return (
    <section>
      <textarea
        id="textarea"
        className="h-screen w-screen px-3 outline-none"
        placeholder="Start typing here..."
        value={text}
        onChange={(e) => handleTextChange(e.target.value)}
      />
    </section>
  );
};
export default Writing;
