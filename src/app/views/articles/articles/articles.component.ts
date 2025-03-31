import {Component, OnInit} from '@angular/core';
import {ArticlesService} from "../../../shared/services/articles.service";
import {ArticleRelatedResponseType} from "../../../../types/article-related-response.type";
import {ArticlesActiveParamsType} from "../../../../types/articles-active-params.type";
import {CategoryService} from "../../../shared/services/category.service";
import {ActivatedRoute, Params, Router} from "@angular/router";
import {catchError, concatMap, debounceTime, mergeMap, Observable} from "rxjs";
import {ActiveParamsUtil} from "../../../shared/utils/active-params.utils";
import {AppliedFilterType} from "../../../../types/applied-filter.type";
import {CategoryResponseType} from "../../../../types/category-response.type";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {MessageService} from "primeng/api";
import {ArticlesResponseType} from "../../../../types/articles-response.type";
import {ErrorResponseService} from "../../../shared/services/error-response.service";
import {HttpErrorResponse} from "@angular/common/http";
import {ArticlesRelatedResponseType} from "../../../../types/articles-related-response.type";

@Component({
  selector: 'app-articles',
  templateUrl: './articles.component.html',
  styleUrls: ['./articles.component.scss']
})
export class ArticlesComponent implements OnInit {
  articles: ArticleRelatedResponseType[] = [];
  categories: CategoryResponseType[] = [];
  activeParams: ArticlesActiveParamsType = {categories: []};
  appliedFilters: AppliedFilterType[] = [];
  sortingOpen = false;
  pages: number[] = [];

  constructor(private articleService: ArticlesService,
              private categoryService: CategoryService,
              private activatedRoute: ActivatedRoute,
              private router: Router,
              private messageService: MessageService,
              private errorResponseService: ErrorResponseService) {
  }

  ngOnInit(): void {
    this.categoryService.getCategories().pipe(
      concatMap((categories: CategoryResponseType[]): Observable<Params> => {
        this.categories = categories;
        return this.activatedRoute.queryParams;
      }),

      catchError(error => {
        this.errorResponseService.errorResponse(error, 'Ошибка получения категорий');
        throw new Error(error);
      }),

      debounceTime(500),

      mergeMap((params: Params): Observable<DefaultResponseType | ArticlesRelatedResponseType> => {
        this.activeParams = ActiveParamsUtil.processParams(params);

        this.appliedFilters = [];

        this.activeParams.categories.forEach(url => {
          const foundType = this.categories.find((category: CategoryResponseType): boolean => category.url === url);

          if (foundType) {
            this.appliedFilters.push({
              name: foundType.name,
              urlParam: foundType.url
            })
          }
        });
        return this.articleService.getArticles(this.activeParams);
      }),

      catchError(error => {
        this.errorResponseService.errorResponse(error, 'Ошибка получения статей');
        throw new Error(error);
      }),
    )
      .subscribe({
        next: (data) => {
          let error = null;

          if ((data as DefaultResponseType).error !== undefined) {
            error = (data as DefaultResponseType).message;
          }

          if (error) {
            this.messageService.add({severity: 'error', summary: 'Ошибка', detail: error});
            throw new Error(error);
          }

          data = data as ArticlesResponseType;
          this.pages = [];
          for (let i = 1; i <= data.pages; i++) {
            this.pages.push(i);
          }
          this.articles = data.items;
        },
        error: (errorResponse: HttpErrorResponse): void => {
          this.errorResponseService.errorResponse(errorResponse, 'Ошибка получения статей');
        }
      });
  }

  removeAppliedFilter(appliedFilter: AppliedFilterType) {
    this.activeParams.categories = this.activeParams.categories.filter((item: string): boolean => item !== appliedFilter.urlParam);

    this.activeParams.page = 1;
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: this.activeParams,
      queryParamsHandling: 'merge'
    });
  }

  toggleSorting() {
    this.sortingOpen = !this.sortingOpen;
  }

  toggleFilter(filter: string) {
    const foundType: string | undefined = this.activeParams.categories.find((item: string): boolean => item === filter);

    if (!foundType) {
      this.activeParams.categories = [...this.activeParams.categories, filter]
    } else {
      this.activeParams.categories = this.activeParams.categories.filter(item => item !== filter);
    }

    this.activeParams.page = 1;

    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: this.activeParams,
      queryParamsHandling: 'merge'
    });
  }

  appliedFilter(category: string) {
    return this.appliedFilters.find((filter: AppliedFilterType): boolean => filter.urlParam === category);
  }

  openPage(page: number) {
    this.activeParams.page = page;

    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: this.activeParams,
      queryParamsHandling: 'merge'
    });
  }

  openPrevPage() {
    if (this.activeParams.page && this.activeParams.page > 1) {
      this.activeParams.page--;
    }

    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: this.activeParams,
      queryParamsHandling: 'merge'
    });
  }

  openNextPage() {
    if (this.activeParams.page && this.activeParams.page < this.pages.length) {
      this.activeParams.page++;
    }

    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: this.activeParams,
      queryParamsHandling: 'merge'
    });
  }
}
