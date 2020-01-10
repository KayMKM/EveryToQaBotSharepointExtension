import * as React from 'react';
import './App.css';
import { Event, AddSourceEvent } from './models/Event';
import { QaManager } from "./components/QaManager";
import { WebChat } from "./components/WebChat";
import { UploadFilesList } from "./components/UploadFilesList";
import pnp from "sp-pnp-js";
import axios from "axios";
import FileData from './models/FileData';

/*global chrome*/

function App(props: { store: any, eventDispatcher: any, fileList: Array<FileData>}) {
  const tempUserId = 'TempUserId';
  let toDispatch: any[] = [];
  const fileHostUrl = ""

  const [ qnAs, setQnAs ] = React.useState({});
  const { store, eventDispatcher, fileList } = props;
  const webChatToken = "";
  const stateInit = new Array(fileList.length);
  stateInit.fill(true, 0, stateInit.length);
  const [filesCheckboxState, setFilesCheckboxState] = React.useState(stateInit);

  React.useEffect(()=>{
    const eventListener = eventDispatcher.register((event: {name:string, value:any}) => {
      if (event.name === Event.GetQnA) {
        setQnAs(event.value);
      }
    });
    return ()=>{eventDispatcher.unregister(eventListener)};
  });

  const addDebug = (error: any) => {

  };

  const clickDoSync = async () => {
    // const toDispatch = this.toDispatch.length;
    toDispatch.forEach(element => {
      store.dispatch(element);
    });
    toDispatch = [];

    // TODO why? maybe it causes a refresh of UI which breaks directline
    // setTimeout(() => {this.addDebug(`Sent ${toDispatch} configs.`);}, 1000);
  };

  const pushEvent = (name: string, value: any, sync = false) => {
    toDispatch.push({
      type: 'WEB_CHAT/SEND_EVENT',
      payload: {name: name, value: value}
    });

    // this.addDebug(`${name}:${value}`);

    if (sync) {
      clickDoSync();
    }
  };

  const clickSyncToThis = async (knowledgeBaseId: string) => {
    let filesDescription = [];
    let files = [];
    let index = 0;
    for (let item of filesCheckboxState) {
      if (item) {
        //const file = await pnp.sp.web.getFileByServerRelativeUrl(fileList[0].url).getText();
        const file = await pnp.sp.web.getFileByServerRelativeUrl(fileList[index].url).getBlob();
        if (!fileHostUrl) return;
        // if (event.target.files == null) return;
        // const file = event.target.files[0];
        let response = null;
        response = await axios.post(fileHostUrl,
            file,
            {
                headers: {
                    'Content-Type': "application/octet-stream"
                },
                params: {
                    name: fileList[index].fileName,
                    type: "application/octet-stream"
                }
            });
        if (response == null) return;
        filesDescription.push(`${fileList[index].fileName}`);
        files.push({
          fileName: fileList[index].fileName,
          fileUri: `${fileHostUrl}?id=${String(response.data)}`
        })
      }
      index++;
    }
    let value: AddSourceEvent = {
        knowledgeBaseId: knowledgeBaseId,
        filesDescription: filesDescription,
        files: files
    };
    pushEvent(Event.AddSource, value, true);
  };

  const handleCheckboxChange = index => {
    setFilesCheckboxState((state)=>{
      const newState = Array.from(state);
      newState[index] = !newState[index];
      return newState;
    });
  };

  return (
    <div className="App">
      <UploadFilesList
        filesCheckboxState={filesCheckboxState}
        handleCheckboxChange={handleCheckboxChange}
        filesList={fileList}
      />
      <QaManager
        qnAs={qnAs}
        fileHostUrl={fileHostUrl}
        syncToThis={clickSyncToThis}
        pushEvent={pushEvent}
        clickDoSync={clickDoSync}
        addDebug={addDebug}
      />
      <WebChat webChatToken={webChatToken} tempUserId={tempUserId} store={store} />
    </div>
  );
}

export default App;
