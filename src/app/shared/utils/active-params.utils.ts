import {Params} from "@angular/router";
import {ArticlesActiveParamsType} from "../../../types/articles-active-params.type";

export class ActiveParamsUtil {
  static processParams(params: Params): ArticlesActiveParamsType {
    const activeParams: ArticlesActiveParamsType = {categories: []};

    if (params.hasOwnProperty('categories')) {
      activeParams.categories = Array.isArray(params['categories']) ? params['categories'] : [params['categories']];
    }

    if (params.hasOwnProperty('page')) {
      activeParams.page = +params['page'];
    }
    return activeParams;
  }
}
