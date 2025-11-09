const Message = (req, res) => {
    res.status(200).json({ message: "Welcome to the jungle" });
};
export default Message;
