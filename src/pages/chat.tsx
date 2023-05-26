import { useState } from "react";

const DocsPage = () => {
  const [text, setText] = useState("");
  const [content, setContent] = useState("");
  const [isGenerate, setIsGenerate] = useState(false);

  function handleChatInput(e: any) {
    setContent(e.target.value);
  }

  const chatFun = () => {
    const chatBox = document.querySelector("#chatBox");
    let question = document.createElement("p");
    question.textContent = `提问：${content}`;
    chatBox?.appendChild(question);
    setContent("...生成中");
    setIsGenerate(true);
    let divider = document.createElement('div')
    divider.textContent = '----------------'

    const data = {
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Bearer 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",
      },
      method: "post",
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: content }],
        temperature: 0.7,
      }),
    };
    fetch("https://api.openai.com/v1/chat/completions", data)
      .then(
        (res) => {
          const readableStream = res.body;
          const reader = readableStream && readableStream.getReader();
          reader?.read().then(({ value, done }) => {
            const decoder = new TextDecoder();
            const result = JSON.parse(decoder.decode(value));
            const message = result.choices[0].message.content;
            setText(message);
            setContent("");
            let answer = document.createElement("p");
            answer.textContent = `回答：${message}`;
            chatBox?.appendChild(answer);
            chatBox?.appendChild(divider)
          });
        },
        (res) => {
          setContent("");
          let answer = document.createElement("p");
          answer.style.color = "red";
          answer.textContent = `回答：生成失败`;
          chatBox?.appendChild(answer);
          chatBox?.appendChild(divider)
        }
      )
      .then(() => {
        setIsGenerate(false);
      });
  };

  return (
    <div>
      <input
        type="text"
        id="chatInput"
        value={content}
        onInput={handleChatInput}
      />
      <button onClick={chatFun} disabled={isGenerate}>
        start
      </button>
      <div id="chatBox" style={{ whiteSpace: "pre-line" }}></div>
    </div>
  );
};

export default DocsPage;
