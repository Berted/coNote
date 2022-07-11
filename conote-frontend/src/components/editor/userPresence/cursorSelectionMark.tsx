import { Decoration } from "@codemirror/view";

function hex2rgb(hex: string, transparency?: number) {
  if (typeof hex !== "string") {
    throw new TypeError("Expected a string");
  }
  hex = hex.replace(/^#/, "");
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  var num = parseInt(hex, 16);
  var rgb = [num >> 16, (num >> 8) & 255, num & 255];
  var type = "rgb";
  if (transparency !== null && transparency !== undefined) {
    type = "rgba";
    rgb.push(transparency);
  }
  // rgb(r, g, b) or rgba(r, g, b, t)
  return type + "(" + rgb.join(",") + ")";
}

const cursorSelectionMark = (color: string, uid: string) => {
  let transparancy = 0.4;
  return Decoration.mark({
    attributes: {
      style:
        "background-color:" +
        hex2rgb(color) +
        "; background-color:" +
        hex2rgb(color, transparancy),
      class: "cursor-selection-element",
    },
    uid: uid,
  });
};

export default cursorSelectionMark;
