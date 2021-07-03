import fs from 'fs';
import { LocalMdToHtmlFileRelationship } from "./LocalFile";

export interface RawSoftwareArticle {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  body: string;
}

export class RawSoftwareArticleBuilder {
  private _localFiles: LocalMdToHtmlFileRelationship[];
  private _rawArticles: RawSoftwareArticle[];

  constructor(lfs: LocalMdToHtmlFileRelationship[]) {
    this._localFiles = lfs;
    this._rawArticles = [];
  }

  build(): void {
    this._rawArticles = [];
    for (const lf of this._localFiles) {
      this._rawArticles.push(this.buildRawBraf(lf))
    }
  }

  get rawArticles(): RawSoftwareArticle[] {
    return this._rawArticles
  }

  private buildRawBraf(lf: LocalMdToHtmlFileRelationship): RawSoftwareArticle {
    return {
      id: lf.name,
      createdAt: new Date(),
      updatedAt: new Date(),
      body: this.readFile(lf.htmlFilePath),
    }
  }

  private readFile(f: string): string {
    return fs.readFileSync(f, {encoding:'utf8', flag:'r'});
  }
}