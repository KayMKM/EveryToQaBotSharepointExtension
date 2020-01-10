import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BaseDialog, IDialogConfiguration } from '@microsoft/sp-dialog';
import { ListViewCommandSetContext } from '@microsoft/sp-listview-extensibility';
import './index.css';
import App from './App';
import { createStore } from 'botframework-webchat';
import { Dispatcher } from "flux";
import FileData from "./models/FileData"

export class BotDialog extends BaseDialog {
  public siteUrl: string;
  public data: Array<FileData>;
  public context: ListViewCommandSetContext;

  constructor(config: IDialogConfiguration) {
    super(config);

    this._close = this._close.bind(this);
  }

  private _close() {
    this.close();
    ReactDOM.unmountComponentAtNode(this.domElement);
  }

  public render(): void {
    const eventDispatcher = new Dispatcher();
    const store = createStore({},
        () => next => action => {
        if (action.type === 'DIRECT_LINE/INCOMING_ACTIVITY') {
          if (action.payload.activity.type === "event") {
            eventDispatcher.dispatch(action.payload.activity);
          }
        }
        return next(action);
    });

    let fileList = this.data;
    ReactDOM.render(<App store={store} eventDispatcher={eventDispatcher} siteUrl={this.siteUrl} fileList={fileList} />, this.domElement)
  }
}