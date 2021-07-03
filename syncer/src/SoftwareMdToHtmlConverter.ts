import path from 'path';
import { LocalMdToHtmlFileRelationship } from "./LocalFile";
const util = require('util');
const exec = util.promisify(require('child_process').exec);
import { SoftwareMdFile } from "./SoftwareMdFile";

export class SoftwareMdToHtmlConverter {
  private _mdFiles: SoftwareMdFile[];
  private _htmlDir: string;
  private _convertedFiles: LocalMdToHtmlFileRelationship[];

  constructor(_mdFiles: SoftwareMdFile[], htmlDir: string) {
    this._mdFiles = _mdFiles;
    this._htmlDir = htmlDir;
    this._convertedFiles = [];
  }

  get convertedFiles(): LocalMdToHtmlFileRelationship[] {
    return this._convertedFiles;
  }

  async convert() {
    console.info('Getting list of article MDs...')
    const toConvert: LocalMdToHtmlFileRelationship[] = this.getListOfLocalSoftwareMDs();
    console.info('Converting to HTML files...')
    this._convertedFiles = await this.convertFiles(toConvert);
  }
  
  private getListOfLocalSoftwareMDs(): LocalMdToHtmlFileRelationship[] {
    return this._mdFiles.map((mdFile: SoftwareMdFile) => {
      const fileNameNoExtention = path.parse(mdFile.path).name;
      return new LocalMdToHtmlFileRelationship(
        mdFile.id,
        mdFile.path,
        `${this._htmlDir}/${mdFile.id}@${fileNameNoExtention}.html`
      );
    });
  }

  private async convertFiles(toConvert: LocalMdToHtmlFileRelationship[]): Promise<LocalMdToHtmlFileRelationship[]> {
    for (const lf of toConvert) {
      await this.convertFile(lf);
    }
    return toConvert;
  }

  private async convertFile(lf: LocalMdToHtmlFileRelationship) {
    const command: string = `pandoc ${lf.mdFilePath} -o ${lf.htmlFilePath};`
    console.info(`Running: ${command}`)
    const { stdout, stderr } = await exec(command);
    if (stderr) {
      console.error('stderr:', stderr);
    }
  }
}