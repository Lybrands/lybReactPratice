import "@/styles/chat.scss";
import { marked } from "marked";
import { ReactNode, useState } from "react";
import AnswerComp from "./components/answer";
import QuestionComp from "./components/question";

const keyObj = { value: 0 };
let index = 0;
Object.defineProperty(keyObj, "value", {
  get() {
    return index++;
  },
});
const DocsPage = () => {
  const [content, setContent] = useState("");
  const [isGenerate, setIsGenerate] = useState(false);
  const [key, setKey] = useState(localStorage.getItem('api_key') || '');
  const [dialogCompArr, setDialogCompArr] = useState<ReactNode[]>([]);

  function handleChatInput(e: any) {
    setContent(e.target.value);
  }

  function handleAPIKey(e: any) {
    setKey(e.target.value);
  }

  // 对话区
  function addDialogCompHandle(component: ReactNode) {
    setContent("");
    setDialogCompArr((prev: ReactNode[]) => [...prev, component]);
  }

  const chatFun = () => {
    if(localStorage.getItem('api_key')) {
      addDialogCompHandle(<QuestionComp content={content} key={keyObj.value} />);
      setContent("...生成中");
      setIsGenerate(true);
      const data = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
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
              if (result.error && result.error.code === "invalid_api_key") {
                addDialogCompHandle(
                  <AnswerComp content="无效的API Key" error key={keyObj.value} />
                );
                return;
              } else if (result.error && result.error.code === null) {
                addDialogCompHandle(
                  <AnswerComp content="缺少API Key" error key={keyObj.value} />
                );
                return;
              }
              const message = result.choices[0].message.content;
              addDialogCompHandle(
                <AnswerComp content={marked(message)} key={result.id} />
              );
            });
          },
          (res) => {
            addDialogCompHandle(
              <AnswerComp content={"请重试..."} error key={keyObj.value} />
            );
          }
        )
        .then(() => {
          setIsGenerate(false);
        });
    } else {
      localStorage.setItem('api_key', key)
      chatFun()
    }

    
  };

  function handleKeyDown (e) {
    if (e.key === 'Enter') {
      chatFun()
    }
  }
  return (
    <div className="chat-main">
      <input
        type="text"
        placeholder="输入你的openAI API Key"
        value={key}
        onInput={handleAPIKey}
        className="chat-key"
      />
      <br></br>
      <div className="chat-input">
        <input
          type="text"
          id="chatInput"
          value={content}
          onInput={handleChatInput}
          onKeyDown={handleKeyDown}
        />
        <button className="chat-button" onClick={chatFun} disabled={isGenerate}>
          发送
        </button>
      </div>
      <div id="chatBox" style={{ whiteSpace: "pre-line" }}>
        {dialogCompArr}
      </div>
    </div>
  );
};

export default DocsPage;
