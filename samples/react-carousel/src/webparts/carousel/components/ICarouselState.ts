import { ImageFit } from 'office-ui-fabric-react';
import { ICarouselImages } from './ICarouselmages';
export interface ICarouselState {
  carouselImages: any[];
  isLoading: boolean;
  errorMessage: string;
  hasError: boolean;
  teamsTheme: string;
  photoIndex: number;
  loadingImage: boolean;
}
