exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Minimal handler works",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    })
  };
};
