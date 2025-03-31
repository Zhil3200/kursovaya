import {Component, OnInit} from '@angular/core';
import {ArticlesService} from "../../services/articles.service";
import {HttpErrorResponse} from "@angular/common/http";
import {MessageService} from "primeng/api";
import {ErrorResponseService} from "../../services/error-response.service";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {ArticleRelatedResponseType} from "../../../../types/article-related-response.type";

@Component({
  selector: 'app-popular-articles',
  templateUrl: './popular-articles.component.html',
  styleUrls: ['./popular-articles.component.scss']
})
export class PopularArticlesComponent implements OnInit {
  popularArticles: ArticleRelatedResponseType[] = [];

  constructor(private articleService: ArticlesService,
              private messageService: MessageService,
              private errorResponseService:ErrorResponseService) {
  }

  ngOnInit(): void {
    this.articleService.getPopularArticles()
      .subscribe({
        next: (data: DefaultResponseType | ArticleRelatedResponseType[]) => {
          let error = null;

          if ((data as DefaultResponseType).error !== undefined) {
            error = (data as DefaultResponseType).message;
          }

          if (error) {
            this.messageService.add({severity: 'error', summary: 'Ошибка', detail: error});
            throw new Error(error);
          }

          this.popularArticles = data as ArticleRelatedResponseType[];
        },
        error: (errorResponse: HttpErrorResponse) => {
          this.errorResponseService.errorResponse(errorResponse,'Ошибка получения популярных статей');
        }
      });
  }
}
