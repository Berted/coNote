import {
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Tooltip,
  SliderMark,
  chakra,
} from "@chakra-ui/react";
import { useState } from "react";

function ClickableSlideMark({ setEditSize, value, ...props }: any) {
  // A bit hacky, but works (Chakra UI seems to force pointer-events:none for some reason)
  return (
    <SliderMark
      value={value}
      mt={-7}
      ml={0}
      textAlign="center"
      fontSize="sm"
      textColor="gray.400"
      fontWeight="500"
      pointerEvents="auto !important"
      transition="color 100ms linear"
      _hover={{ textColor: "gray.600" }}
      role="button"
      onClick={(e) => {
        e.preventDefault();
        setEditSize(value);
      }}
      {...props}
    >
      {value}
    </SliderMark>
  );
}

export default function EditorViewSlider({
  editSize,
  setEditSize,
  ...props
}: any) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <Slider
      mt={3}
      min={0}
      max={100}
      value={editSize}
      step={5}
      onChange={(v) => setEditSize(v)}
      aria-label="editor view slider"
      colorScheme="blue"
      {...props}
    >
      <ClickableSlideMark setEditSize={setEditSize} value={0} />
      <ClickableSlideMark setEditSize={setEditSize} value={50} ml={-2} />
      <ClickableSlideMark setEditSize={setEditSize} value={100} ml={-4} />
      <chakra.div
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <SliderTrack>
          <SliderFilledTrack />
        </SliderTrack>
        <Tooltip
          hasArrow
          bg="blue.500"
          colorScheme="blue"
          placement="top"
          isOpen={showTooltip}
          label={`${editSize}%`}
        >
          <SliderThumb />
        </Tooltip>
      </chakra.div>
    </Slider>
  );
}
