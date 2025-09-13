export interface IFileSearchResult {
  path: string;
  fileName: string;
  extension: string;
  lastModified: Date;
  size: number;
}

export interface ISearchOptions {
  recursive?: boolean;
  includeHidden?: boolean;
  maxResults?: number;
  timeout?: number;
}

export interface ISearchRequest {
  startPath: string;
  pattern: string;
  options?: ISearchOptions;
}

export interface ISearchResponse {
  results: IFileSearchResult[];
  totalCount: number;
  searchTime: number;
  isPartialResult?: boolean;
}

export interface IDirectoriesResponse {
  directories: string[];
}
