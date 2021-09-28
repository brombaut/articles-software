import { RawSoftwareArticle, RawSoftwareArticleBuilder } from "./RawSoftwareArticle";
import { SoftwareArticlesProxy } from "./SoftwareArticle";
import { SoftwareMdFile } from "./SoftwareMdFile";
import { SoftwareMdToHtmlConverter } from "./SoftwareMdToHtmlConverter";

const SOFTWARE_MD_FILES: SoftwareMdFile[] = [
  {
    id: 'firebase_firestore_facade',
    path: '/Users/BenRombaut/dev/f3/README.md',
  },
  {
    id: 'article_scraper',
    path: '/Users/BenRombaut/dev/article_scraper/README.md',
  }
]

async function main() {
  if (process.argv.length !== 6) {
    console.error('Requires HTML_DIR, SOFTWARE_ARTICLES_DESTINATION_DIR, SOFTWARE_ARTICLES_META_FILE and SOFTWARE_ARTICLES_CONTENT_FILE as command line args')
    process.exit(1);
  }
  const HTML_DIR = process.argv[2];
  const SOFTWARE_ARTICLES_DESTINATION_DIR = process.argv[3];
  const SOFTWARE_ARTICLES_META_FILE = process.argv[4];
  const SOFTWARE_ARTICLES_CONTENT_FILE = process.argv[5];
  const converter: SoftwareMdToHtmlConverter = new SoftwareMdToHtmlConverter(SOFTWARE_MD_FILES, HTML_DIR);
  await converter.convert();
  const rawSoftwareArticleBuilder: RawSoftwareArticleBuilder = new RawSoftwareArticleBuilder(converter.convertedFiles);
  rawSoftwareArticleBuilder.build();
  const rawSoftwareArticles: RawSoftwareArticle[] = rawSoftwareArticleBuilder.rawArticles;
  const saReader: SoftwareArticlesProxy = new SoftwareArticlesProxy(
    SOFTWARE_ARTICLES_DESTINATION_DIR, 
    SOFTWARE_ARTICLES_META_FILE,
    SOFTWARE_ARTICLES_CONTENT_FILE
  );
  saReader.sync(rawSoftwareArticles);
  console.info('Done')
}
main();