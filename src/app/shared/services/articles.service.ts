import {Injectable} from '@angular/core';
import {Observable} from "rxjs";
import {environment} from "../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {ArticleRelatedResponseType} from "../../../types/article-related-response.type";
import {DefaultResponseType} from "../../../types/default-response.type";
import {ArticlesActiveParamsType} from "../../../types/articles-active-params.type";
import {ArticlesRelatedResponseType} from "../../../types/articles-related-response.type";
import {ArticleResponseType} from "../../../types/article-response.type";

@Injectable({
  providedIn: 'root'
})
export class ArticlesService {

  constructor(private http: HttpClient) {
  }

  getPopularArticles(): Observable<DefaultResponseType | ArticleRelatedResponseType[]> {
    return this.http.get<DefaultResponseType | ArticleRelatedResponseType[]>(environment.api + 'articles/top');
  }

  getArticles(params: ArticlesActiveParamsType): Observable<DefaultResponseType | ArticlesRelatedResponseType> {
    return this.http.get<DefaultResponseType | ArticlesRelatedResponseType>(environment.api + 'articles', {
      params: params
    });
  }

  getArticle(url: string): Observable<DefaultResponseType | ArticleResponseType> {
    return this.http.get<DefaultResponseType | ArticleResponseType>(environment.api + 'articles/' + url);
  }

  getRelatedArticle(url: string): Observable<DefaultResponseType | ArticleRelatedResponseType[]> {
    return this.http.get<DefaultResponseType | ArticleRelatedResponseType[]>(environment.api + 'articles/related/' + url);
  }
}
