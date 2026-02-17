// It receives a function (requestHandler)
const asyncHandler = (requestHandler) => {
  // This returned function has req, res, next
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

/*
Manually 
app.get("/user/:id", async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    next(error); // manually forward error
  }
});

*/

export { asyncHandler };
