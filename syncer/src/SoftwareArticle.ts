import fs from "fs";
import { RawSoftwareArticle } from "./RawSoftwareArticle";

export class SoftwareArticle {

  constructor(
    private _id: string,
    private _title: string,
    private _createdAt: Date,
    private _updatedAt: Date,
    private _description: string,
    private _body: string,
    private _show: boolean,
    private _externalRepos: ExternalRepo[],
    private _techUsed: Tech[],
  ) { }


  get id() {
    return this._id;
  }

  get body() {
    return this._body;
  }

  set body(body: string) {
    this._body = body;
    this._updatedAt = new Date();
  }

  get saContents(): SoftwareArticleContent {
    return {
      _id: this._id,
      _body: this._body
    }
  }

  get saMeta(): SoftwareArticleMeta {
    return {
      _id: this._id,
      _title: this._title,
      _createdAt: this._createdAt,
      _updatedAt: this._updatedAt,
      _description: this._description,
      _show: this._show,
      _externalRepos: this._externalRepos,
      _techUsed: this._techUsed,
    }
  }
}

interface SoftwareArticleContent {
  _id: string;
  _body: string;
}

interface SoftwareArticleMeta {
  _id: string;
  _title: string;
  _createdAt: Date;
  _updatedAt: Date;
  _description: string;
  _show: boolean;
  _externalRepos: ExternalRepo[];
  _techUsed: Tech[];
}

interface ExternalRepo {
  _id: string;
  _imagePath: string;
  _url: string;
  _title: string;
  _hoverText: string;
}

interface Tech {
  _id: string;
  _imagePath: string;
  _title: string;
  _hoverText: string;
}

export class SoftwareArticlesProxy {
  private _destinationDir: string;
  private _metaFile: string;
  private _contentFile: string;
  private _softwareArticles: SoftwareArticle[];

  constructor(saDestinationDir: string, metaFile: string, contentFile: string) {
    this._destinationDir = saDestinationDir;
    this._metaFile = metaFile;
    this._contentFile = contentFile;
    this._softwareArticles = [];
  }

  get softwareArticles(): SoftwareArticle[] {
    return this._softwareArticles;
  }

  get metaFilePath(): string {
    return `${this._destinationDir}/${this._metaFile}`
  }

  get contentFilePath(): string {
    return `${this._destinationDir}/${this._contentFile}`
  }

  sync(rsas: RawSoftwareArticle[]): void {
    console.info(`Syncing authored articles with raw articles`);
    this.readExistingAuthoredArticles();
    for (const rsa of rsas) {
      this.syncRawArticle(rsa)
    }
    this.writeSyncedAuthoredArticles();
  }

  private readExistingAuthoredArticles(): void {
    console.info(`Reading existing authored articles`);
    const saMetas: SoftwareArticleMeta[] = this.readJsonFile<SoftwareArticleMeta>(this.metaFilePath);
    const saContents: SoftwareArticleContent[] = this.readJsonFile<SoftwareArticleContent>(this.contentFilePath);
    const merged: (SoftwareArticleMeta | SoftwareArticleContent)[] = [];
    for (const meta of saMetas) {
      const body: string = saContents.find((sac: SoftwareArticleContent) => sac._id === meta._id)?._body || '';
      merged.push({
        ...meta,
        _body: body,
      })
    }
    const mapper = (dto: any): SoftwareArticle  => {
      return new SoftwareArticle(
        dto._id,
        dto._title,
        dto._createdAt,
        dto._updatedAt,
        dto._description,
        dto._body,
        dto._show,
        dto._externalRepos,
        dto._techUsed,
      )
    };
    this._softwareArticles = merged.map(mapper);
  }

  private syncRawArticle(rawSoftwareArticle: RawSoftwareArticle) {    
    const matchedExistingArticleIndex = this._softwareArticles.findIndex((sa: SoftwareArticle) => {
      return sa.id === rawSoftwareArticle.id;
    })
    if (matchedExistingArticleIndex < 0) {
      this.addNewSoftwareArticle(rawSoftwareArticle)
    } else {
      this.updateExistingSoftwareArticleIfNecessary(rawSoftwareArticle, matchedExistingArticleIndex);
    }
  }

  private updateExistingSoftwareArticleIfNecessary(rawSoftwareArticle: RawSoftwareArticle, matchedExistingArticleIndex: number): void {
    if (rawSoftwareArticle.body !== this._softwareArticles[matchedExistingArticleIndex].body) {
      console.info(`Updating articled body: ${this._softwareArticles[matchedExistingArticleIndex].id}`)
      this._softwareArticles[matchedExistingArticleIndex].body = rawSoftwareArticle.body;
    }
  }

  private addNewSoftwareArticle(rawSoftwareArticle: RawSoftwareArticle): void {
    console.log(`Adding new article: ${rawSoftwareArticle.id}`)
    this._softwareArticles.push(
      new SoftwareArticle(
        rawSoftwareArticle.id,
        '',
        rawSoftwareArticle.createdAt,
        rawSoftwareArticle.updatedAt,
        '',
        rawSoftwareArticle.body,
        false,
        [],
        [],
      )
    );
  }

  writeSyncedAuthoredArticles(): void {
    console.info(`Writing synced authored articles`);
    const aaMetas: SoftwareArticleMeta[] = this._softwareArticles.map((sa: SoftwareArticle) => sa.saMeta)
    const aaContents: SoftwareArticleContent[] = this._softwareArticles.map((sa: SoftwareArticle) => sa.saContents)
    this.writeJsonFile<SoftwareArticleMeta>(this.metaFilePath, aaMetas);
    this.writeJsonFile<SoftwareArticleContent>(this.contentFilePath, aaContents);
  }

  private readJsonFile<T>(path: string): T[] {
    console.info(`Reading ${path}`);
    const rawData = fs.readFileSync(path, {encoding:'utf8', flag:'r'});
    const jsonData = JSON.parse(rawData);
    return jsonData.map((d: any) => d as T);
  }

  private writeJsonFile<T>(path: string, data: T[]): void {
    console.info(`Writing ${path}`);
    const rawData = JSON.stringify(data, null, 2);
    fs.writeFileSync(path, rawData);
  }
}