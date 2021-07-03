export class LocalMdToHtmlFileRelationship {
  name: string;
  mdFilePath: string;
  htmlFilePath: string;
  
  constructor(name: string, mdFilePath: string, htmlFilePath: string) {
    this.name = name;
    this.mdFilePath = mdFilePath;
    this.htmlFilePath = htmlFilePath;
  }
}