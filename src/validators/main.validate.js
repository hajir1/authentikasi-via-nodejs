const mainValidate = (schema, val) => {
  const result = schema.safeParse(val);
  if (!result.error) {
    return result.data
  } else {
    throw result.error;
  }
};

export default mainValidate