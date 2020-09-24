import { WebPartContext } from "@microsoft/sp-webpart-base";
import { DisplayMode } from '@microsoft/sp-core-library';
import { ImageFit } from "office-ui-fabric-react";
export interface ICarouselProps {
  title: string;
  siteUrl: string;
  list: string;
  context: WebPartContext;
  numberImages: number;
  sliderDelay: number;
  imageFitStyle: ImageFit;
  includeCaption: boolean;
  updateProperty: (value: string) => void;
  displayMode: DisplayMode;
}
