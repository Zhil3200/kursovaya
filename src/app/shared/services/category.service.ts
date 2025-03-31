import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {environment} from "../../../environments/environment";
import {CategoryResponseType} from "../../../types/category-response.type";

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  constructor(private http: HttpClient) {
  }

  getCategories(): Observable<CategoryResponseType[]> {
    return this.http.get<CategoryResponseType[]>(environment.api + 'categories');
  }
}
