const createPartialDone = (count, done) => {
  let i = 0;
  return () => {
    if (++i === count) {
      done();
    }
  };
};

module.exports = { createPartialDone };
