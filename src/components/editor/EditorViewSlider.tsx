import {
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Tooltip,
  SliderMark,
} from "@chakra-ui/react";
import { useState } from "react";
export default function EditorViewSlider({
  editSize,
  setEditSize,
  ...props
}: any) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <Slider
      min={0}
      max={100}
      value={editSize}
      step={5}
      onChange={(v) => setEditSize(v)}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      aria-label="editor view slider"
      colorScheme="blue"
      {...props}
    >
      <SliderTrack>
        <SliderFilledTrack />
      </SliderTrack>
      <Tooltip
        hasArrow
        colorScheme="blue"
        placement="top"
        isOpen={showTooltip}
        label={`${editSize}%`}
      >
        <SliderThumb />
      </Tooltip>
    </Slider>
  );
}
