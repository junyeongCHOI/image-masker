import styled from "@emotion/styled";
import { Button, Slider, Stack } from "@mui/material";
import type { NextPage } from "next";
import { ChangeEvent, useRef, useState } from "react";
import { RgbaColorPicker } from "react-colorful";

const defaultWeight = 205;

const Index: NextPage = () => {
  const [isImageLoading, setImageLoading] = useState<boolean>(false);
  const [image, setImage] = useState<string | null>(null);
  const [weight, setWeight] = useState<number>(defaultWeight);
  const [maskColor, setMaskColor] = useState({ r: 200, g: 150, b: 35, a: 0.5 });
  const [backgroundColor, setBackgroundColor] = useState({
    r: 0,
    g: 0,
    b: 0,
    a: 0,
  });
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const aRef = useRef<HTMLAnchorElement | null>(null);

  const fileHandler = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();

    setImageLoading(true);

    const file = e.target.files ? e.target.files[0] : null;

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      setImage(reader.result as string);

      setImageLoading(false);
    };

    reader.readAsDataURL(file);
  };

  const convert = () => {
    if (!canvasRef.current || !imageRef.current) return;

    const ctx = canvasRef.current.getContext("2d");

    if (!ctx) return;

    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    ctx.drawImage(imageRef.current, 0, 0);

    const imageData = ctx.getImageData(
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );
    const length = imageData.data.length;

    for (let i = 0; i < length; i += 4) {
      const count =
        imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2];

      let r = maskColor.r;
      let g = maskColor.g;
      let b = maskColor.b;
      let a = maskColor.a * 255;

      if (count > weight) {
        r = backgroundColor.r;
        g = backgroundColor.g;
        b = backgroundColor.b;
        a = backgroundColor.a * 255;
      }

      imageData.data[i] = r;
      imageData.data[i + 1] = g;
      imageData.data[i + 2] = b;
      imageData.data[i + 3] = a;
    }

    ctx.putImageData(imageData, 0, 0);
  };

  const download = () => {
    if (!aRef.current || !canvasRef.current) return;

    aRef.current.href = canvasRef.current.toDataURL("image/png");
    aRef.current.click();
  };

  return (
    <Wrap>
      <Container>
        <ButtonWrapTop>
          <Button onClick={() => fileInputRef.current?.click()}>
            + 이미지
          </Button>
        </ButtonWrapTop>
        {image ? (
          <ImageWrap>
            <img src={image} alt="uploaded image" ref={imageRef} />
          </ImageWrap>
        ) : (
          <ImageMock onClick={() => fileInputRef.current?.click()}>
            500 x 500
          </ImageMock>
        )}
      </Container>
      <Container>
        <canvas width={500} height={500} ref={canvasRef} />
        <Control>
          <Stack mb={2} spacing={1}>
            <div>강도: {weight}</div>
            <Slider
              defaultValue={defaultWeight}
              max={765}
              min={0}
              step={1}
              value={weight}
              onChange={(_, w) => setWeight(w as number)}
            />
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Stack mb={2} spacing={1}>
              <div>
                마스킹 색: {maskColor.r}, {maskColor.g}, {maskColor.b},{" "}
                {maskColor.a}
              </div>
              <RgbaColorPicker color={maskColor} onChange={setMaskColor} />
            </Stack>
            <Stack mb={2} spacing={1}>
              <div>
                배경 색: {backgroundColor.r}, {backgroundColor.g},{" "}
                {backgroundColor.b}, {backgroundColor.a}
              </div>
              <RgbaColorPicker
                color={backgroundColor}
                onChange={setBackgroundColor}
              />
            </Stack>
          </Stack>
          <ButtonWrap>
            <Button disabled={isImageLoading} onClick={convert}>
              변환
            </Button>
            <Button disabled={isImageLoading} onClick={download}>
              저장
            </Button>
          </ButtonWrap>
        </Control>
      </Container>
      <input
        type="file"
        accept="image/*"
        onChange={fileHandler}
        ref={fileInputRef}
        style={{ display: "none" }}
      />
      <a
        style={{ display: "none" }}
        download="converted.png"
        href=""
        ref={aRef}
      />
    </Wrap>
  );
};

const Wrap = styled.div`
  width: 1032px;
  margin: 0 auto;
  padding: 16px 0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const Container = styled.div`
  width: 500px;
  border-radius: 4px;
  border: 1px solid #f5f5f7;
  overflow: hidden;
  margin: 0 0 16px;
`;

const ImageWrap = styled.div`
  width: 500px;
  height: 500px;
  overflow: hidden;
`;

const ImageMock = styled.div`
  width: 500px;
  height: 500px;
  line-height: 500px;
  color: #e0e0e8;
  text-align: center;
  background-color: #fbfbfd;
  border-radius: 4px;
  user-select: none;
  cursor: pointer;
`;

const Control = styled.div`
  padding: 16px 32px;
`;

const ButtonWrap = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;

  button {
    margin-right: 16px;

    &:last-of-type {
      margin-right: 0;
    }
  }
`;

const ButtonWrapTop = styled(ButtonWrap)`
  padding: 8px 16px;
`;

export default Index;
