import { WebPartContext } from "@microsoft/sp-webpart-base";
import { DisplayMode } from '@microsoft/sp-core-library';
export interface ICarouselProps {
  title: string;
  siteUrl: string;
  list: string;
  context: WebPartContext;
  numberImages: number;
  sliderDelay: number;
  includeCaption: boolean;
  updateProperty: (value: string) => void;
  displayMode: DisplayMode;
}
