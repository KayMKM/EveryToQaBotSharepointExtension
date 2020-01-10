import { override } from '@microsoft/decorators';
import { Guid } from '@microsoft/sp-core-library';
import {
  BaseListViewCommandSet,
  Command,
  IListViewCommandSetListViewUpdatedParameters,
  IListViewCommandSetExecuteEventParameters
} from '@microsoft/sp-listview-extensibility';
import { sp } from '@pnp/sp';
import { BotDialog } from './BotDialog';
import FileData from "./models/FileData";

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IEveryToQaBotCommandSetProperties {
  // This is an example; replace with your own properties
  sampleTextOne: string;
  sampleTextTwo: string;
}

export default class EveryToQaBotCommandSet extends BaseListViewCommandSet<IEveryToQaBotCommandSetProperties> {
  private siteId: Guid;
  private listId: Guid;
  private folderId: string;

  @override
  protected onInit(): Promise<void> {
    return super.onInit().then(async _ => {
      sp.setup({
        spfxContext: this.context
      });

      //Get Site Id and List Id
      this.siteId = this.context.pageContext.site.id;
      this.listId = this.context.pageContext.list.id;

      //Get Content Type Id for Folder content type
      let folderContentTypeId = await sp.web.lists.getById(this.listId.toString()).contentTypes.select('StringId').filter(`Name eq 'Folder'`).get();
      this.folderId = folderContentTypeId[0].StringId;
    });
  }

  @override
  public onListViewUpdated(event: IListViewCommandSetListViewUpdatedParameters): void {
    const addFileToQnACommand: Command = this.tryGetCommand('AddFileToQnA');
    if (addFileToQnACommand) {
      if (event.selectedRows.length >= 1) {
        //Hide Command Set for items with Folder Content Type as folders
        addFileToQnACommand.visible = true;
        event.selectedRows.forEach(element => {
          if (this.folderId === element.getValueByName('ContentTypeId')) {
            addFileToQnACommand.visible = false;
          }
        });
      } else {
        addFileToQnACommand.visible = false;
      }
    }
  }

  @override
  public onExecute(event: IListViewCommandSetExecuteEventParameters): void {
    switch (event.itemId) {
      case 'AddFileToQnA':
        let siteUrl: string = this.context.pageContext.web.absoluteUrl;
        let listName: string = `${this.context.pageContext.list.serverRelativeUrl}`.split("/").pop();
        let siteName = siteUrl.split('sites')[1];

        const dialog: BotDialog = new BotDialog({ isBlocking: true });

        let files = new Array<FileData>();
        let index = 0;
        event.selectedRows.forEach(element => {
          let itemName: string = element.getValueByName('FileLeafRef');
          files.push(new FileData(itemName, '/sites' + siteName + '/' + listName + '/' + itemName, index++));
        });
        dialog.data = files;
        dialog.show();

        break;
      default:
        throw new Error('Unknown command');
    }
  }
}
