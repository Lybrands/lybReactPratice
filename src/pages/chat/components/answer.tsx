const AnswerComp = (props: any) => {
  return (
    <div>
      <div className={props.error ? "answerError" : "" + 'markdown'} dangerouslySetInnerHTML={{__html: props.content}}></div>
      <div>-------------------------------------------</div>
    </div>
  );
};

export default AnswerComp