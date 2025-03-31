import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Params, Router} from "@angular/router";
import {catchError, combineLatest, concatMap, debounceTime, mergeMap, of, Subscription} from "rxjs";
import {ArticlesService} from "../../../shared/services/articles.service";
import {HttpErrorResponse} from "@angular/common/http";
import {MessageService} from "primeng/api";
import {AuthService} from "../../../core/auth/auth.service";
import {CommentService} from "../../../shared/services/comment.service";
import {FormBuilder, Validators} from "@angular/forms";
import {ErrorResponseService} from "../../../shared/services/error-response.service";
import {ArticleRelatedResponseType} from "../../../../types/article-related-response.type";
import {ArticleResponseType} from "../../../../types/article-response.type";
import {CommentType} from "../../../../types/comment.type";
import {CommentActionsType} from "../../../../types/comment-actions.type";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {CommentActionEnum} from "../../../../types/comment-action.enum";
import {CommentsResponseType} from "../../../../types/comments-response.type";

@Component({
  selector: 'app-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.scss']
})
export class ArticleComponent implements OnInit, OnDestroy {
  url: string = '';
  isLogged: boolean = false;
  relatedArticles: ArticleRelatedResponseType[] = [];
  article: ArticleResponseType = {} as ArticleResponseType;
  additionalComments: CommentType[] = [];
  commentForm = this.fb.group({
    comment: ['', Validators.required]
  });
  offset: number = 3;
  userCommentActions: CommentActionsType[] = [];
  private subs: Subscription = new Subscription();

  constructor(private activatedRoute: ActivatedRoute,
              private router: Router,
              private articleService: ArticlesService,
              private messageService: MessageService,
              private authService: AuthService,
              private commentService: CommentService,
              private fb: FormBuilder,
              private errorResponseService: ErrorResponseService) {
    this.isLogged = this.authService.getIsLoggedIn();
  }

  ngOnInit() {
    this.subs.add(this.authService.isLogged$.subscribe((isLoggedIn: boolean) => {
      this.isLogged = isLoggedIn;
    }));

    this.activatedRoute.params
      .pipe(
        debounceTime(500),

        mergeMap((params: Params) => {
          this.offset = 3;

          this.url = params['url'];
          return combineLatest([this.articleService.getRelatedArticle(this.url), this.articleService.getArticle(this.url)]);
        }),

        catchError(error => {
          this.errorResponseService.errorResponse(error, 'Ошибка получения параметров url');
          throw new Error(error);
        }),

        mergeMap(([articleRelated, article]) => {
          this.showRelatedArticle(articleRelated);
          return this.showArticle(article);
        }),

        catchError(error => {
          this.errorResponseService.errorResponse(error, 'Ошибка отображения связанных статей или основной статьи');
          throw new Error(error);
        })
      )
      .subscribe({
        next: (comments: CommentActionsType[] | DefaultResponseType | null) => {
          if (comments) {
            this.showArticleCommentActions(comments);
          }
        },

        error: (errorResponse: HttpErrorResponse) => {
          this.errorResponseService.errorResponse(errorResponse, 'Ошибка отображения реакции пользователя на комментарии');
        }
      });
  }

  private showRelatedArticle(articleRelated: DefaultResponseType | ArticleRelatedResponseType[]) {
    let error = null;

    if ((articleRelated as DefaultResponseType).error !== undefined) {
      error = (articleRelated as DefaultResponseType).message;
    }

    if (error) {
      this.messageService.add({severity: 'error', summary: 'Ошибка', detail: error});
      throw new Error(error);
    }

    this.relatedArticles = articleRelated as ArticleRelatedResponseType[];
  }

  private showArticle(article: DefaultResponseType | ArticleResponseType) {
    let error = null;

    if ((article as DefaultResponseType).error !== undefined) {
      error = (article as DefaultResponseType).message;
    }

    if (error) {
      this.messageService.add({severity: 'error', summary: 'Ошибка', detail: error});
      throw new Error(error);
    }

    this.article = article as ArticleResponseType;

    if (this.isLogged) {
      return this.commentService.getArticleCommentActions(this.article.id);
    }
    return of(null);
  }

  private showArticleCommentActions(comments: DefaultResponseType | CommentActionsType[], additionalComment: boolean = false) {
    let error = null;

    if ((comments as DefaultResponseType).error !== undefined) {
      error = (comments as DefaultResponseType).message;
    }

    if (error) {
      this.messageService.add({severity: 'error', summary: 'Ошибка', detail: error});
      throw new Error(error);
    }

    this.userCommentActions = comments as CommentActionsType[];

    if (additionalComment) {
      this.additionalComments.filter((item: CommentType) => {
        return (comments as CommentActionsType[]).forEach(((action: CommentActionsType) => {
          if (action.comment === item.id) {
            if (action.action === CommentActionEnum.like) {
              item.user.like = true;
            }
            if (action.action === CommentActionEnum.dislike) {
              item.user.dislike = true;
            }
          }
        }))
      });

    } else {
      this.article.comments.map((item: CommentType) => {
        return (comments as CommentActionsType[]).forEach(((action: CommentActionsType) => {
          if (action.comment === item.id) {
            if (action.action === CommentActionEnum.like) {
              item.user.like = true;
            }
            if (action.action === CommentActionEnum.dislike) {
              item.user.dislike = true;
            }
          }
        }))
      });
    }
  }

  addComment() {
    if (this.isLogged) {

      if (this.commentForm.valid && this.commentForm.value.comment) {
        this.commentService.addComment({text: this.commentForm.value.comment, article: this.article.id})
          .pipe(
            concatMap((data: DefaultResponseType) => {

              if (data.error) {
                this.messageService.add({severity: 'error', summary: 'Ошибка', detail: data.message});
                throw new Error(data.message);
              }

              this.messageService.add({
                severity: 'success',
                summary: 'Успешно',
                detail: 'Комментарий успешно добавлено'
              });
              this.commentForm.reset();

              if (this.additionalComments.length > 0) {
                this.additionalComments = [];
                this.offset = 3;
              }

              return this.articleService.getArticle(this.url);
            }),

            catchError(error => {
              this.errorResponseService.errorResponse(error, 'Ошибка добавления комментария');
              throw new Error(error);
            }),

            concatMap((data: DefaultResponseType | ArticleResponseType) => this.showArticle(data)),

            catchError(error => {
              this.errorResponseService.errorResponse(error, 'Ошибка отображения основной статьи');
              throw new Error(error);
            }),
          )
          .subscribe({
            next: (comments: CommentActionsType[] | DefaultResponseType | null) => {
              if (comments) {
                this.showArticleCommentActions(comments);
              }
            },

            error: (errorResponse: HttpErrorResponse) => {
              this.errorResponseService.errorResponse(errorResponse, 'Ошибка отображения реакции пользователя на комментарии');
            }
          })
      }
    }
  }
  getComments() {

    this.commentService.getComments({article: this.article.id, offset: this.offset})
      .pipe(
        concatMap((comments: DefaultResponseType | CommentsResponseType) => {
          let error = null;

          if ((comments as DefaultResponseType).error !== undefined) {
            error = (comments as DefaultResponseType).message;
          }

          if (error) {
            this.messageService.add({severity: 'error', summary: 'Ошибка', detail: error});
            throw new Error(error);
          }

          (comments as CommentsResponseType).comments.forEach(((item: CommentType) => {
            this.additionalComments.push(item);
          }));

          this.offset += 10;

          if (this.isLogged) {
            return this.commentService.getArticleCommentActions(this.article.id);
          }
          return of(null);
        }),

        catchError(error => {
          this.errorResponseService.errorResponse(error, 'Ошибка получения дополнительных комментарий');
          throw new Error(error);
        }),
      )
      .subscribe({
        next: (comments: CommentActionsType[] | DefaultResponseType | null) => {
          if (comments) {
            this.showArticleCommentActions(comments);
          }
        },

        error: (errorResponse: HttpErrorResponse) => {
          this.errorResponseService.errorResponse(errorResponse, 'Ошибка отображения реакции пользователя на комментарии');
        }
      });
  }

  applyActionToComment(actionData: CommentActionsType, additionalComment: boolean = false) {

    if (this.isLogged) {

      this.commentService.applyActionToComment(actionData.comment, actionData.action)
        .pipe(
          concatMap((data: DefaultResponseType | ArticleResponseType) => {

            if ((data as DefaultResponseType).error) {
              this.messageService.add({
                severity: 'error',
                summary: 'Ошибка',
                detail: (data as DefaultResponseType).message
              });
              throw new Error((data as DefaultResponseType).message);
            }

            this.messageService.add({
              severity: 'success',
              summary: 'Успешно',
              detail: (data as DefaultResponseType).message
            });

            if (additionalComment) {
              this.additionalComments.map((comment) => {

                if (comment.id === actionData.comment) {

                  if (actionData.action === CommentActionEnum.like) {

                    if (comment.user.dislike) {
                      comment.dislikesCount -= 1;
                      comment.user.dislike = false;
                    }

                    if (comment.user.like) {
                      comment.likesCount -= 1;
                      comment.user.like = false;
                    } else {
                      comment.likesCount += 1;
                      comment.user.like = true;
                    }
                  }

                  if (actionData.action === CommentActionEnum.dislike) {

                    if (comment.user.like) {
                      comment.likesCount -= 1;
                      comment.user.like = false;
                    }

                    if (comment.user.dislike) {
                      comment.dislikesCount -= 1;
                      comment.user.dislike = false;
                    } else {
                      comment.dislikesCount += 1;
                      comment.user.dislike = true;
                    }
                  }
                }
              });

              return of(null);
            } else {
              return this.articleService.getArticle(this.url);
            }

          }),

          catchError(error => {
            this.errorResponseService.errorResponse(error, 'Ошибка добавления реакции');
            throw new Error(error);
          }),

          concatMap((data: DefaultResponseType | ArticleResponseType | null) => {
            if (data) {
              if ((data as DefaultResponseType).error) {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Ошибка',
                  detail: (data as DefaultResponseType).message
                });
                new Error((data as DefaultResponseType).message);
                return of(null);
              }
              return this.showArticle(data as ArticleResponseType);
            }

            return of(null);
          }),

          catchError(error => {
            this.errorResponseService.errorResponse(error, 'Ошибка отображения основной статьи');
            throw new Error(error);
          }),
        )
        .subscribe({
          next: (comments: CommentActionsType[] | DefaultResponseType | null) => {
            if (comments) {
              this.showArticleCommentActions(comments as CommentActionsType[]);
            }
          },

          error: (errorResponse: HttpErrorResponse) => {
            this.errorResponseService.errorResponse(errorResponse, 'Ошибка отображения реакции пользователя на комментарии');
          }
        });

    } else {
      this.messageService.add({severity: 'error', summary: 'Ошибка', detail: 'Вы не авторизованы'});
      return;
    }
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
