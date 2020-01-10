export default class FileData {
    fileName: string;
    url: string;
    index: number;
  
    constructor(fileName: string, url: string, index: number) {
      this.fileName = fileName;
      this.url = url;
      this.index = index;
    }
  }
  