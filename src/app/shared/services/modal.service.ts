import {Injectable} from '@angular/core';
import {Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  isShowed$ = new Subject<boolean>();
  modalData$ = new Subject<{ type: string, service: string, title: string, buttonText: string }>();

  show(type: string, service: string,title: string, buttonText: string): void {
    this.isShowed$.next(true);
    this.modalData$.next({type, service, title, buttonText});
  }

  hide() {
    this.isShowed$.next(false);
  }
}
