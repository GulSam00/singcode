export const getMessageReactNode = (message: React.ReactNode): React.ReactNode => {
  if (typeof message === 'string') {
    return <span>{message}</span>;
  } else if (Array.isArray(message)) {
    return (
      <>
        {message.map((item, index) => (
          <span key={index}>
            {item} <br />
          </span>
        ))}
      </>
    );
  }

  return message;
};
