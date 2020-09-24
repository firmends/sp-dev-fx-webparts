//import '@pnp/polyfill-ie11';
import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { escape } from '@microsoft/sp-lodash-subset';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneDropdown,
  IPropertyPaneDropdownOption,
  PropertyPaneLabel,
  PropertyPaneToggle
} from '@microsoft/sp-property-pane';

import * as strings from 'CarouselWebPartStrings';
import Carousel from './components/Carousel';
import { ICarouselProps } from './components/ICarouselProps';
import spservices from '../../spservices/spservices';
import { PropertyFieldNumber } from '@pnp/spfx-property-controls/lib/PropertyFieldNumber';
import { ImageFit } from 'office-ui-fabric-react';

export interface ICarouselWebPartProps {
  title: string;
  siteUrl: string;
  list: string;
  errorMessage: string;
  numberImages: number;
  includeCaption: boolean;
  sliderDelay: number;
  imageFitStyle: ImageFit;

}

export default class CarouselWebPart extends BaseClientSideWebPart<ICarouselWebPartProps> {
  private lists: IPropertyPaneDropdownOption[] = [];
  private listsDropdownDisabled: boolean = true;
  private spService: spservices = null;
  private errorMessage: string;

   // onInit
   public  async onInit(): Promise<void> {

    this.spService = new spservices(this.context);
    this.properties.siteUrl = this.properties.siteUrl ? this.properties.siteUrl : this.context.pageContext.site.absoluteUrl;

    if (this.properties.siteUrl && !this.properties.list) {
     const _lists = await this.loadLists();
     if ( _lists.length > 0 ){
      this.lists = _lists;
      this.properties.list = this.lists[0].key.toString();
     }
    }
    // default imageFitStyle option the first time web part is added to the page
    if (!this.properties.imageFitStyle) {
      this.properties.imageFitStyle = ImageFit.center;
    }

    return Promise.resolve();
  }


  protected async onPropertyPaneConfigurationStart() {

    try {
      if (this.properties.siteUrl) {
        const _lists = await this.loadLists();
        this.lists = _lists;
        this.listsDropdownDisabled = false;
        //  await this.loadFields(this.properties.siteUrl);
        this.context.propertyPane.refresh();

      } else {
        this.lists = [];
        this.properties.list = '';
        this.listsDropdownDisabled = false;
        this.context.propertyPane.refresh();
      }

    } catch (error) {

    }
  }

  private async loadLists(): Promise<IPropertyPaneDropdownOption[]> {
    const _lists: IPropertyPaneDropdownOption[] = [];
    try {
      const results = await this.spService.getSiteLists(this.properties.siteUrl);
      for (const list of results) {
        _lists.push({ key: list.Id, text: list.Title });
      }
      // push new item value
    } catch (error) {
      this.errorMessage =  `${ escape(error.message.toString())} -  please check if site url if valid.` ;
      this.context.propertyPane.refresh();
    }
    return _lists;
  }

  private onSiteUrlGetErrorMessage(value: string) {
    let returnValue: string = '';
    if (value) {
      returnValue = '';
    } else {
      const previousList: string = this.properties.list;
      const previousSiteUrl: string = this.properties.siteUrl;
      // reset selected item
      this.properties.list = undefined;
      this.properties.siteUrl = undefined;
      this.lists = [];
      this.listsDropdownDisabled = true;
      this.onPropertyPaneFieldChanged('list', previousList, this.properties.list);
      this.onPropertyPaneFieldChanged('siteUrl', previousSiteUrl, this.properties.siteUrl);
      this.context.propertyPane.refresh();
    }
    return returnValue;
  }

  protected async onPropertyPaneFieldChanged(propertyPath: string, oldValue: string, newValue: string) {
    try {
      // reset any error
      this.properties.errorMessage = undefined;
      this.errorMessage = undefined;
      this.context.propertyPane.refresh();

      if (propertyPath === 'siteUrl' && newValue) {
        super.onPropertyPaneFieldChanged(propertyPath, oldValue, newValue);
        const _oldValue = this.properties.list;
        this.onPropertyPaneFieldChanged('list', _oldValue, this.properties.list);
        this.context.propertyPane.refresh();
        const _lists = await this.loadLists();
        this.lists = _lists;
        this.listsDropdownDisabled = false;
        this.properties.list = this.lists.length > 0 ? this.lists[0].key.toString() : undefined;
        this.context.propertyPane.refresh();
        this.render();
      }
      else {
        super.onPropertyPaneFieldChanged(propertyPath, oldValue, newValue);
      }
    } catch (error) {
      this.errorMessage =  `${error.message} -  please check if site url if valid.` ;
      this.context.propertyPane.refresh();
    }
  }

  public render(): void {

    const element: React.ReactElement<ICarouselProps> = React.createElement(
      Carousel,
      {
        title: this.properties.title,
        siteUrl: this.properties.siteUrl,
        list: this.properties.list,
        numberImages: this.properties.numberImages,
        includeCaption: this.properties.includeCaption,
        sliderDelay: this.properties.sliderDelay,
        imageFitStyle: this.properties.imageFitStyle,
        context: this.context,
        displayMode: this.displayMode,
        updateProperty: (value: string) => {
          this.properties.title = value;
        },
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  //protected get dataVersion(): Version {
  //  return Version.parse('1.0');
  //}

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    if (this.properties.includeCaption) {
      this.properties.includeCaption = true;
    }
    else {
      this.properties.includeCaption = false;
    }
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('title', {
                  label: strings.TitleLabel,
                  value: this.properties.title,
                }),
                PropertyPaneTextField('siteUrl', {
                  label: strings.SiteUrlFieldLabel,
                  onGetErrorMessage: this.onSiteUrlGetErrorMessage.bind(this),
                  value: this.context.pageContext.site.absoluteUrl,
                  deferredValidationTime: 1200,
                }),
                PropertyPaneDropdown('list', {
                  label: strings.ListFieldLabel,
                  options: this.lists,
                  disabled: this.listsDropdownDisabled,
                }),
                PropertyFieldNumber('numberImages', {
                  key: "numberValue",
                  label: "Number of images to load",
                  description: "Number between 1 and 250",
                  value: this.properties.numberImages,
                  maxValue: 250,
                  minValue: 1,
                  disabled: false
                }),
                PropertyFieldNumber('sliderDelay', {
                  key: "delayValue",
                  label: "Delay in seconds until next image displays",
                  description: "Number between 1 and 60",
                  value: this.properties.sliderDelay,
                  maxValue: 60,
                  minValue: 1,
                  disabled: false
                }),
                PropertyPaneDropdown('imageFitStyle', {
                  options: [
                    {key: ImageFit.center, text: "center"}, 
                    {key: ImageFit.centerContain, text: "centerContain"},
                    {key: ImageFit.centerCover, text: "centerCover"},
                    {key: ImageFit.contain, text: "contain"},
                    {key: ImageFit.cover, text: "cover"},
                    {key: ImageFit.none, text: "None"}
                  ],
                  label: "Image Fit Option",
                  selectedKey: this.properties.imageFitStyle
                }),
                PropertyPaneToggle('includeCaption', {
                  label: "Include Caption"
                }),
                PropertyPaneLabel('errorMessage', {
                  text:  this.errorMessage,
                }),
              ]
            }
          ]
        }
      ]
    };
  }
}
