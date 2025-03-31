import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {environment} from "../../../environments/environment";
import {CommentsResponseType} from "../../../types/comments-response.type";
import {CommentsParamsType} from "../../../types/comments-params.type";
import {DefaultResponseType} from "../../../types/default-response.type";
import {CommentAddType} from "../../../types/comment-add.type";
import {CommentActionsType} from "../../../types/comment-actions.type";

@Injectable({
  providedIn: 'root'
})
export class CommentService {

  constructor(private http: HttpClient) {
  }
  getComments(params: CommentsParamsType): Observable<CommentsResponseType | DefaultResponseType> {
    return this.http.get<CommentsResponseType | DefaultResponseType>(environment.api + 'comments', {
      params: params
    });
  }

  addComment(params: CommentAddType): Observable<DefaultResponseType> {
    return this.http.post<DefaultResponseType>(environment.api + 'comments', {
      text: params.text,
      article: params.article
    });
  }

  applyActionToComment(commentId: string, action: string): Observable<DefaultResponseType> {
    return this.http.post<DefaultResponseType>(environment.api + 'comments/' + commentId + '/apply-action', {
      action
    });
  }
  getArticleCommentActions(id: string): Observable<CommentActionsType[] | DefaultResponseType |null> {
    return this.http.get<CommentActionsType[] | DefaultResponseType>(environment.api + 'comments/article-comment-actions', {
      params: {articleId: id}
    });
  }

}
