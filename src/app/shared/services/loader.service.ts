import { Injectable } from '@angular/core';
import {Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  isShowed$ = new Subject<boolean>();
  show() {
    this.isShowed$.next(true);
  }
  hide() {
    setTimeout(()=>{
      this.isShowed$.next(false);
    },500);
  }
}
