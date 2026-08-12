export default {
  Badge: {
    size: "md",
    color: "default",
    variant: "primary",
    // The default that surprised a caller in chuzz: a badge positions itself
    // absolutely as an overlay unless told otherwise, which is wrong for an
    // inline count beside a title.
    placement: "top-right",
  },
};
